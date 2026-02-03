import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id

    if (!taskId) {
      return NextResponse.json(
        { error: '缺少任务ID' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // 获取任务信息
    const { data: task, error } = await supabase
      .from('analysis_tasks')
      .select('*')
      .eq('id', taskId)
      .single()

    if (error || !task) {
      return NextResponse.json(
        { error: '任务不存在' },
        { status: 404 }
      )
    }

    // 确保task有正确的类型
    const typedTask = task as {
      status: string
      results?: unknown
      updated_at?: string
    }

    // 根据状态返回不同的响应
    if (typedTask.status === 'completed') {
      return NextResponse.json({
        task_id: taskId,
        status: 'completed',
        results: typedTask.results,
        completed_at: typedTask.updated_at,
      })
    } else if (typedTask.status === 'failed') {
      return NextResponse.json({
        task_id: taskId,
        status: 'failed',
        error: '分析失败，请重试',
      })
    } else if (typedTask.status === 'processing') {
      return NextResponse.json({
        task_id: taskId,
        status: 'processing',
        progress: 50,
        message: '正在分析中...',
      })
    } else {
      return NextResponse.json({
        task_id: taskId,
        status: 'pending',
        message: '等待处理...',
      })
    }

  } catch (error) {
    console.error('查询状态错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
