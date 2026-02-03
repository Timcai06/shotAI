import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeShootingForm } from '@/lib/analysis/engine'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { video_url, camera_angle, lighting_condition, task_id } = body

    if (!video_url && !task_id) {
      return NextResponse.json(
        { error: '缺少视频URL或任务ID' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // 如果提供了task_id，则执行分析
    if (task_id) {
      try {
        // 更新任务状态为处理中
        await supabase
          .from('analysis_tasks')
          .update({ status: 'processing' } as never)
          .eq('id', task_id)

        // 获取任务信息
        const { data: taskData, error: fetchError } = await supabase
          .from('analysis_tasks')
          .select('*')
          .eq('id', task_id)
          .single()

        if (fetchError || !taskData) {
          throw new Error('任务不存在')
        }

        // 执行分析
        const analysisResult = await analyzeShootingForm(
          (taskData as any).video_url,
          (taskData as any).camera_angle || 'side'
        )

        // 保存结果
        const { error: updateError } = await supabase
          .from('analysis_tasks')
          .update({
            status: 'completed',
            results: analysisResult,
            updated_at: new Date().toISOString(),
          } as never)
          .eq('id', task_id)

        if (updateError) {
          throw updateError
        }

        return NextResponse.json({
          task_id,
          status: 'completed',
          results: analysisResult,
          message: '分析完成',
        })
      } catch (analysisError) {
        console.error('分析执行错误:', analysisError)

        // 更新任务状态为失败
        await supabase
          .from('analysis_tasks')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString(),
          } as never)
          .eq('id', task_id)

        return NextResponse.json(
          { error: '分析执行失败' },
          { status: 500 }
        )
      }
    }

    // 创建新任务
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
