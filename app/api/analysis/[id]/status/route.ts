import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      )
    }

    const { data: task, error } = await supabase
      .from('analysis_tasks')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (error || !task) {
      return NextResponse.json(
        { error: '任务不存在' },
        { status: 404 }
      )
    }

    const taskData = task as any
    const progress = calculateProgress(taskData.status)
    const stage = getStageFromStatus(taskData.status)
    const message = getMessageFromStatus(taskData.status)

    return NextResponse.json({
      task_id: taskData.id,
      status: taskData.status,
      progress,
      stage,
      message,
    })

  } catch (error) {
    console.error('获取状态错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

function calculateProgress(status: string): number {
  const progressMap: Record<string, number> = {
    'pending': 10,
    'processing': 50,
    'completed': 100,
    'failed': 0,
  }
  return progressMap[status] || 0
}

function getStageFromStatus(status: string): string {
  const stageMap: Record<string, string> = {
    'pending': 'uploading',
    'processing': 'analyzing',
    'completed': 'generating',
    'failed': 'uploading',
  }
  return stageMap[status] || 'uploading'
}

function getMessageFromStatus(status: string): string {
  const messageMap: Record<string, string> = {
    'pending': '等待处理...',
    'processing': '正在分析动作...',
    'completed': '分析完成',
    'failed': '分析失败',
  }
  return messageMap[status] || '处理中...'
}
