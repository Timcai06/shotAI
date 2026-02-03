'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Loader2, Activity, Clock, Zap, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AnalysisProgress } from '@/types'

const stages = [
  { id: 'uploading', label: '上传视频', icon: Activity },
  { id: 'detecting', label: '姿态检测', icon: Zap },
  { id: 'analyzing', label: '动作分析', icon: Activity },
  { id: 'generating', label: '生成报告', icon: CheckCircle },
]

export default function AnalysisWaitingPage() {
  const params = useParams()
  const router = useRouter()
  const taskId = params.task_id as string
  
  const [progress, setProgress] = useState<AnalysisProgress | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!taskId) return

    const fetchProgress = async () => {
      try {
        const response = await fetch(`/api/analysis/${taskId}/status`)
        if (!response.ok) throw new Error('获取进度失败')
        
        const data = await response.json()
        setProgress(data)

        if (data.status === 'completed') {
          router.push(`/analysis/${taskId}/result`)
        } else if (data.status === 'failed') {
          setError(data.message || '分析失败')
        }
      } catch (err) {
        console.error('获取进度错误:', err)
      }
    }

    fetchProgress()
    const interval = setInterval(fetchProgress, 3000)

    return () => clearInterval(interval)
  }, [taskId, router])

  const currentStageIndex = stages.findIndex(s => s.id === progress?.stage) || 0
  const currentProgress = progress?.progress || 0

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="w-5 h-5" />
            返回首页
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">分析中...</h1>
          <p className="text-gray-600">AI正在分析您的投篮动作</p>
        </div>

        {/* Progress Animation */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          {/* Skeleton Visual */}
          <div className="relative h-48 bg-gray-100 rounded-xl mb-8 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse" />
            <div className="text-center">
              <Activity className="w-12 h-12 text-primary-600 mx-auto mb-2 animate-pulse" />
              <p className="text-sm text-gray-500">3D骨骼检测动画</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">总进度</span>
              <span className="text-sm text-gray-500">{currentProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-primary-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${currentProgress}%` }}
              />
            </div>
          </div>

          {/* Stage Indicators */}
          <div className="grid grid-cols-4 gap-2">
            {stages.map((stage, index) => {
              const Icon = stage.icon
              const isActive = index <= currentStageIndex
              const isCurrent = index === currentStageIndex

              return (
                <div
                  key={stage.id}
                  className={cn(
                    "flex flex-col items-center p-3 rounded-lg transition-all",
                    isCurrent ? "bg-primary-100" : isActive ? "bg-gray-100" : "bg-gray-50"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 mb-2",
                      isCurrent
                        ? "text-primary-600 animate-pulse"
                        : isActive
                        ? "text-gray-600"
                        : "text-gray-400"
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs text-center",
                      isCurrent ? "text-primary-700 font-medium" : "text-gray-500"
                    )}
                  >
                    {stage.label}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Current Message */}
          {progress?.message && (
            <p className="mt-6 text-center text-sm text-gray-600">
              {progress.message}
            </p>
          )}
        </div>

        {/* Time & Quality Estimate */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
            <Clock className="w-8 h-8 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">已用时</p>
              <p className="text-lg font-semibold text-gray-900">
                {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
            <Activity className="w-8 h-8 text-primary-500" />
            <div>
              <p className="text-sm text-gray-500">预估检测质量</p>
              <p className="text-lg font-semibold text-primary-700">良好</p>
            </div>
          </div>
        </div>

        {/* Fun Facts */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="text-sm font-medium text-blue-900 mb-2">篮球小知识</h3>
          <p className="text-sm text-blue-700">
            动作一致性（而非绝对角度）是命中率的最强预测因子，相关性高达 r=-0.96。
            精英球员的特征不是"标准姿势"，而是极高的动作重复性。
          </p>
          <p className="text-xs text-blue-600 mt-2">
            参考：Slegers et al. (2021), Journal of Sports Sciences
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700">{error}</p>
            <Link
              href="/upload"
              className="mt-2 inline-block text-sm text-primary-600 hover:text-primary-700"
            >
              重新上传
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
