import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileName, tempUserId, cameraAngle, lightingCondition } = body

    if (!fileName || !tempUserId) {
      return NextResponse.json(
        { error: '缺少文件信息' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

    // 获取public URL
    const { data: { publicUrl } } = supabaseUrl
      ? { data: { publicUrl: `${supabaseUrl}/storage/v1/object/public/videos/${fileName}` } }
      : { data: { publicUrl: '' } }

    // 直接使用fileName构建public URL
    const videoPublicUrl = `${supabaseUrl.replace('/rest/v1', '')}/storage/v1/object/public/videos/${fileName}`

    const supabase = createClient()

    const { data: task, error: taskError } = await supabase
      .from('analysis_tasks')
      .insert({
        user_id: tempUserId,
        status: 'pending',
        video_url: videoPublicUrl,
        video_duration: 0,
        camera_angle: cameraAngle || 'side',
        lighting_condition: lightingCondition || 'good',
        is_paid: false,
      } as any)
      .select()
      .single()

    if (taskError || !task) {
      console.error('创建任务错误:', taskError)
      return NextResponse.json(
        { error: '创建分析任务失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      task_id: (task as any).id,
      status: 'pending',
      message: '分析任务已创建',
    })

  } catch (error) {
    console.error('创建任务失败:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
