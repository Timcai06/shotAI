/**
 * Analysis Executor - 分析执行器
 * 
 * 封装分析任务的执行流程，包括：
 * 1. 更新任务状态为 processing
 * 2. 调用分析引擎执行9维度分析
 * 3. 保存分析结果到数据库
 * 4. 更新任务状态为 completed 或 failed
 */

import { analysisQueue } from '@/lib/queue/analysis-queue'
import { analyzeShootingForm } from '@/lib/analysis/engine'
import type { AnalysisTask } from '@/types'

export interface AnalysisJob {
  taskId: string
  videoUrl: string
  cameraAngle: 'side' | 'front' | 'other'
  userId: string
}

/**
 * 执行分析任务
 * 
 * @param job 分析作业
 */
export async function executeAnalysisJob(job: AnalysisJob): Promise<void> {
  console.log(`[AnalysisExecutor] Starting analysis for task ${job.taskId}`)
  
  try {
    // 执行9维度分析
    const result = await analyzeShootingForm(job.videoUrl, job.cameraAngle)
    
    console.log(`[AnalysisExecutor] Analysis completed for task ${job.taskId}`)
    console.log(`[AnalysisExecutor] Overall score: ${result.overall_score}`)
    
    // 完成任务
    await analysisQueue.complete(job.taskId, result)
    
  } catch (error) {
    console.error(`[AnalysisExecutor] Analysis failed for task ${job.taskId}:`, error)
    
    // 标记任务失败
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    await analysisQueue.fail(job.taskId, errorMessage)
  }
}

/**
 * 批量处理队列中的任务
 * 
 * @param batchSize 批次大小
 */
export async function processAnalysisQueue(batchSize: number = 1): Promise<void> {
  console.log(`[AnalysisExecutor] Processing analysis queue, batch size: ${batchSize}`)
  
  for (let i = 0; i < batchSize; i++) {
    const task = await analysisQueue.dequeue()
    
    if (!task) {
      console.log('[AnalysisExecutor] No pending tasks in queue')
      break
    }
    
    // 构造作业
    const job: AnalysisJob = {
      taskId: task.task_id,
      videoUrl: task.video_url,
      cameraAngle: 'side', // 从任务数据中获取
      userId: task.user_id,
    }
    
    // 执行分析
    await executeAnalysisJob(job)
  }
}

/**
 * 重新处理失败或超时的任务
 */
export async function requeueStaleTasks(): Promise<number> {
  const requeuedCount = await analysisQueue.requeueStaleTasks()
  
  if (requeuedCount > 0) {
    console.log(`[AnalysisExecutor] Requeued ${requeuedCount} stale tasks`)
  }
  
  return requeuedCount
}
