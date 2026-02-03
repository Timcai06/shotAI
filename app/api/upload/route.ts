import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const video = formData.get('video') as File
    const cameraAngle = formData.get('camera_angle') as string || 'side'
    const lightingCondition = formData.get('lighting_condition') as string || 'good'

    if (!video) {
      return NextResponse.json(
        { error: '没有提供视频文件' },
        { status: 400 }
      )
    }

    // 使用 service role 客户端绕过 RLS
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    // 创建一个临时用户 ID（基于时间戳）
    const tempUserId = `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`
    
    // 在 users 表中创建临时用户记录
    const { error: userCreateError } = await supabase
      .from('users')
      .insert({
        id: tempUserId,
        email: `${tempUserId}@shotai.local`,
        preferred_language: 'zh-CN',
      })
      .select()
      .single()
    
    if (userCreateError && userCreateError.code !== '23505') {
      console.error('创建用户记录失败:', userCreateError)
    }

    const fileName = `${tempUserId}/${Date.now()}_${video.name}`
    
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('videos')
      .upload(fileName, video, {
        contentType: video.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('上传错误:', uploadError)
      return NextResponse.json(
        { error: '视频上传失败: ' + uploadError.message },
        { status: 500 }
      )
    }

    const { data: { publicUrl } } = supabase
      .storage
      .from('videos')
      .getPublicUrl(fileName)

    const { data: task, error: taskError } = await supabase
      .from('analysis_tasks')
      .insert({
        user_id: tempUserId,
        status: 'pending',
        video_url: publicUrl,
        video_duration: 0,
        camera_angle: cameraAngle,
        lighting_condition: lightingCondition,
        is_paid: false,
      })
      .select()
      .single()

    if (taskError) {
      console.error('任务创建错误:', taskError)
      return NextResponse.json(
        { error: '创建分析任务失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      task_id: task.id,
      status: 'pending',
      message: '分析任务已创建',
    })

  } catch (error) {
    console.error('上传处理错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

export const runtime = 'nodejs'
