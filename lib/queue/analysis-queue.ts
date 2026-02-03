import { createClient } from '@/lib/supabase/server'
import type { AnalysisTask } from '@/types'

// Use any to bypass strict Supabase typing issues during build
const createSupabaseClient = () => createClient() as any

export interface QueueItem {
  task_id: string
  user_id: string
  video_url: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  priority: number
  created_at: string
  attempts: number
}

export class AnalysisQueue {
  private supabase = createSupabaseClient()
  private readonly MAX_ATTEMPTS = 3
  private readonly PROCESSING_TIMEOUT = 5 * 60 * 1000 // 5 minutes

  async enqueue(taskId: string, priority: number = 1): Promise<void> {
    const { error } = await this.supabase
      .from('analysis_tasks')
      .update({
        status: 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)

    if (error) {
      throw new Error(`入队失败: ${error.message}`)
    }
  }

  async dequeue(): Promise<QueueItem | null> {
    const { data: tasks, error } = await this.supabase
      .from('analysis_tasks')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(1)

    if (error || !tasks || tasks.length === 0) {
      return null
    }

    const task = tasks[0]
    
    const { error: updateError } = await this.supabase
      .from('analysis_tasks')
      .update({
        status: 'processing',
        updated_at: new Date().toISOString(),
      })
      .eq('id', task.id)

    if (updateError) {
      return null
    }

    return {
      task_id: task.id,
      user_id: task.user_id,
      video_url: task.video_url,
      status: 'processing',
      priority: 1,
      created_at: task.created_at,
      attempts: 0,
    }
  }

  async complete(taskId: string, results: Record<string, unknown>): Promise<void> {
    const { error } = await this.supabase
      .from('analysis_tasks')
      .update({
        status: 'completed',
        results,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)

    if (error) {
      throw new Error(`完成失败: ${error.message}`)
    }
  }

  async fail(taskId: string, errorMessage: string): Promise<void> {
    const { error } = await this.supabase
      .from('analysis_tasks')
      .update({
        status: 'failed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)

    if (error) {
      throw new Error(`标记失败状态错误: ${error.message}`)
    }
  }

  async getQueueLength(): Promise<number> {
    const { count, error } = await this.supabase
      .from('analysis_tasks')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    if (error) {
      throw new Error(`获取队列长度失败: ${error.message}`)
    }

    return count || 0
  }

  async requeueStaleTasks(): Promise<number> {
    const staleThreshold = new Date(Date.now() - this.PROCESSING_TIMEOUT).toISOString()
    
    const { data: staleTasks, error } = await this.supabase
      .from('analysis_tasks')
      .select('id')
      .eq('status', 'processing')
      .lt('updated_at', staleThreshold)

    if (error || !staleTasks || staleTasks.length === 0) {
      return 0
    }

    const { error: updateError } = await this.supabase
      .from('analysis_tasks')
      .update({
        status: 'pending',
        updated_at: new Date().toISOString(),
      })
      .in('id', staleTasks.map((t: { id: string }) => t.id))

    if (updateError) {
      throw new Error(`重新入队失败: ${updateError.message}`)
    }

    return staleTasks.length
  }
}

export const analysisQueue = new AnalysisQueue()
