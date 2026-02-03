import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { filename, contentType } = body

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: '缺少文件名或内容类型' },
        { status: 400 }
      )
    }

    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/mov']
    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json(
        { error: '不支持的视频格式，请上传 MP4、MOV、WebM' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: '服务器配置错误' },
        { status: 500 }
      )
    }

    const tempUserId = `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`
    const fileName = `${tempUserId}/${Date.now()}_${filename}`

    // 使用 Supabase SDK 创建签名URL
    const adminClient = createAdminClient(supabaseUrl, serviceRoleKey)

    const { data: signData, error: signError } = await adminClient
      .storage
      .from('videos')
      .createSignedUploadUrl(fileName)

    if (signError) {
      console.error('签名URL创建失败:', signError)
      return NextResponse.json(
        { error: '无法创建上传链接: ' + signError.message },
        { status: 500 }
      )
    }

    // 在 users 表创建临时用户记录
    try {
      await adminClient
        .from('users')
        .insert({
          id: tempUserId,
          email: `${tempUserId}@shotai.local`,
          preferred_language: 'zh-CN',
        })
        .single()
    } catch (e) {
      // 忽略重复错误
    }

    return NextResponse.json({
      uploadUrl: signData.signedUrl,
      fileName,
      tempUserId,
      expiresIn: 3600,
    })

  } catch (error) {
    console.error('获取签名URL失败:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Presigned Upload URL API',
    status: 'ready',
    maxFileSize: '100MB',
    allowedTypes: ['video/mp4', 'video/quicktime', 'video/webm', 'video/mov'],
  })
}
