'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Loader } from 'lucide-react'

export default function WaitingPage() {
  const params = useParams()
  const router = useRouter()
  const taskId = params.task_id as string

  const [status, setStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending')
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('准备分析...')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!taskId) return

    // 轮询检查状态
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/analysis/${taskId}/status`)
        const data = await response.json()

        if (data.status === 'completed') {
          setStatus('completed')
          setProgress(100)
          setMessage('分析完成！')
          clearInterval(pollInterval)
          // 2秒后跳转到结果页面
          setTimeout(() => {
            router.push(`/analysis/${taskId}/result`)
          }, 2000)
        } else if (data.status === 'failed') {
          setStatus('failed')
          setError(data.error || '分析失败')
          clearInterval(pollInterval)
        } else if (data.status === 'processing') {
          setStatus('processing')
          setProgress(data.progress || 50)
          setMessage(data.message || '分析中...')
        } else {
          setStatus('pending')
          setProgress(Math.min(progress + 5, 30))
          setMessage('等待处理...')
        }
      } catch (err) {
        console.error('轮询错误:', err)
      }
    }, 2000)

    return () => clearInterval(pollInterval)
  }, [taskId, router, progress])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f2785] to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-12 py-4">
          <Link href="/" className="flex items-center gap-2 text-primary-600 hover:text-primary-700">
            <ChevronLeft className="w-5 h-5" />
            返回首页
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-12 py-20">
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          {error ? (
            <>
              <div className="text-red-600 mb-6">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">分析失败</h1>
              <p className="text-gray-600 mb-8">{error}</p>
              <Link
                href="/upload"
                className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                重新上传
              </Link>
            </>
          ) : status === 'completed' ? (
            <>
              <div className="text-green-600 mb-6">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">分析完成！</h1>
              <p className="text-gray-600 mb-8">正在跳转到结果页面...</p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </>
          ) : (
            <>
              <div className="mb-8">
                <Loader className="w-16 h-16 mx-auto text-primary-600 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">正在分析您的投篮动作</h1>
              <p className="text-gray-600 mb-8">{message}</p>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">{progress}%</p>
              </div>

              {/* Analysis Steps */}
              <div className="text-left space-y-4 mb-8">
                <AnalysisStep
                  title="视频处理"
                  description="提取视频帧并进行姿态检测"
                  completed={progress > 20}
                />
                <AnalysisStep
                  title="关键点检测"
                  description="识别33个人体关键点"
                  completed={progress > 40}
                />
                <AnalysisStep
                  title="9维度分析"
                  description="计算一致性、对称性、动力链等指标"
                  completed={progress > 60}
                />
                <AnalysisStep
                  title="生成报告"
                  description="生成AI分析报告和训练建议"
                  completed={progress > 80}
                />
              </div>

              {/* Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <p className="text-sm text-blue-900 font-medium mb-2">💡 分析提示</p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 分析通常需要 30-60 秒</li>
                  <li>• 请勿关闭此页面</li>
                  <li>• 分析完成后将自动跳转到结果页面</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

interface AnalysisStepProps {
  title: string
  description: string
  completed: boolean
}

function AnalysisStep({ title, description, completed }: AnalysisStepProps) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0">
        {completed ? (
          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-green-600">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        ) : (
          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-gray-300">
            <div className="h-2 w-2 rounded-full bg-gray-600"></div>
          </div>
        )}
      </div>
      <div>
        <p className={`font-medium ${completed ? 'text-gray-900' : 'text-gray-600'}`}>{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  )
}
