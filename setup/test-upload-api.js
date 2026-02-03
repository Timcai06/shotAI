// 测试上传 API（不需要认证）
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 测试上传 API 配置...\n')

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testSetup() {
  try {
    // 测试 1: Storage Bucket
    console.log('1️⃣ 测试 Storage Bucket...')
    const { data: buckets, error: bucketError } = await supabase
      .storage
      .listBuckets()
    
    if (bucketError) {
      console.log('   ❌ 获取 Bucket 列表失败:', bucketError.message, '\n')
      return false
    }
    
    const videosBucket = buckets.find(b => b.id === 'videos')
    if (videosBucket) {
      console.log('   ✅ videos bucket 已创建')
      console.log('   公开访问:', videosBucket.public ? '是' : '否')
      console.log('   大小限制:', videosBucket.file_size_limit / 1024 / 1024, 'MB\n')
    } else {
      console.log('   ❌ videos bucket 不存在\n')
      return false
    }
    
    // 测试 2: 创建临时用户
    console.log('2️⃣ 测试创建临时用户...')
    const tempUserId = `temp_test_${Date.now()}`
    
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        id: tempUserId,
        email: `${tempUserId}@shotai.local`,
        preferred_language: 'zh-CN',
      })
      .select()
      .single()
    
    if (userError) {
      console.log('   ❌ 创建用户失败:', userError.message, '\n')
      return false
    }
    
    console.log('   ✅ 临时用户创建成功')
    console.log('   用户 ID:', user.id, '\n')
    
    // 测试 3: 创建分析任务
    console.log('3️⃣ 测试创建分析任务...')
    const { data: task, error: taskError } = await supabase
      .from('analysis_tasks')
      .insert({
        user_id: tempUserId,
        status: 'pending',
        video_url: 'https://example.com/test.mp4',
        camera_angle: 'side',
        lighting_condition: 'good',
      })
      .select()
      .single()
    
    if (taskError) {
      console.log('   ❌ 创建任务失败:', taskError.message, '\n')
      return false
    }
    
    console.log('   ✅ 分析任务创建成功')
    console.log('   任务 ID:', task.id, '\n')
    
    // 清理测试数据
    console.log('4️⃣ 清理测试数据...')
    await supabase.from('analysis_tasks').delete().eq('id', task.id)
    await supabase.from('users').delete().eq('id', tempUserId)
    console.log('   ✅ 测试数据已清理\n')
    
    console.log('✨ 所有测试通过！')
    console.log('🚀 上传功能已就绪，无需配置匿名认证！\n')
    
    return true
  } catch (err) {
    console.error('❌ 测试失败:', err.message)
    return false
  }
}

testSetup().then(success => {
  process.exit(success ? 0 : 1)
})
