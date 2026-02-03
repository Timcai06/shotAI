import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { video_url, camera_angle, lighting_condition } = body

    if (!video_url) {
      return NextResponse.json(
        { error: '缺少视频URL' },
        { status: 400 }
      )
    }

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
      .insert({
        user_id: user.id,
        video_url,
        camera_angle: camera_angle || 'side',
        lighting_condition: lighting_condition || 'good',
        status: 'pending',
        is_paid: false,
      } as any)
      .select()
      .single()

    if (error) {
      console.error('创建分析任务错误:', error)
      return NextResponse.json(
        { error: '创建分析任务失败' },
        { status: 500 }
      )
    }

    const taskData = task as any
    return NextResponse.json({
      task_id: taskData.id,
      status: 'pending',
      estimated_time: 45,
      message: '分析任务已创建',
    })

  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
