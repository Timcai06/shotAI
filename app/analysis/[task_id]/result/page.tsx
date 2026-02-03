'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Lock, TrendingUp, Activity, Scale, Clock, Zap, Move, Target, RotateCcw, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AnalysisTask } from '@/types'

export default function AnalysisResultPage() {
  const params = useParams()
  const taskId = params.task_id as string
  
  const [task, setTask] = useState<AnalysisTask | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await fetch(`/api/analysis/${taskId}`)
        if (response.ok) {
          const data = await response.json()
          setTask(data)
        }
      } catch (error) {
        console.error('获取分析结果失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTask()
  }, [taskId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">加载报告中...</p>
        </div>
      </div>
    )
  }

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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">分析报告</h1>
        <p className="text-gray-600 mb-8">基于AI技术的9维度动作分析</p>

        {/* Preview Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-800 mb-1">免费预览模式</p>
              <p className="text-sm text-amber-700">
                您正在查看3个维度的免费预览。付费解锁完整9维度分析和个性化训练计划。
              </p>
              <button className="mt-3 px-4 py-2 bg-accent-600 text-white text-sm font-medium rounded-lg hover:bg-accent-700 transition-colors">
                解锁完整报告 ¥9.9
              </button>
            </div>
          </div>
        </div>

        {/* Overall Score */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="text-center">
            <div className="text-6xl font-bold text-primary-600 mb-2">72</div>
            <div className="text-gray-600 mb-1">综合评分 / 100</div>
            <div className="text-sm text-gray-500">置信区间: 65-79 (±15°误差范围)</div>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              进阶水平
            </div>
          </div>
        </div>

        {/* Dimensions Grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <DimensionCard
            icon={<Activity className="w-5 h-5" />}
            title="动作一致性"
            score={62}
            status="warning"
            description="膝关节角度波动18°，高于精英标准的10°"
            highlight
          />
          <DimensionCard
            icon={<Scale className="w-5 h-5" />}
            title="关节角度"
            score={75}
            status="good"
            description="各关节角度在职业球员范围内"
          />
          <DimensionCard
            icon={<RotateCcw className="w-5 h-5" />}
            title="对称性"
            score={68}
            status="warning"
            description="左右肘关节角度差12°，存在轻微不对称"
          />
          <LockedDimension
            icon={<Clock className="w-5 h-5" />}
            title="时序节奏"
          />
          <LockedDimension
            icon={<Target className="w-5 h-5" />}
            title="稳定性"
          />
          <LockedDimension
            icon={<Zap className="w-5 h-5" />}
            title="投篮风格"
          />
        </div>

        {/* Error Margin Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-blue-800 mb-1">测量精度说明</p>
              <p className="text-sm text-blue-700">
                所有关节角度测量误差范围为 ±15°（侧面视角）。
                我们基于动作一致性评估技术水平，而非绝对角度。
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button className="px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/25">
            解锁完整9维度报告 ¥9.9
          </button>
          <p className="mt-4 text-sm text-gray-500">
            包含：AI个性化训练计划、3D可视化、时序曲线图、动力链分析
          </p>
        </div>
      </main>
    </div>
  )
}

function DimensionCard({
  icon,
  title,
  score,
  status,
  description,
  highlight = false,
}: {
  icon: React.ReactNode
  title: string
  score: number
  status: 'good' | 'warning' | 'bad'
  description: string
  highlight?: boolean
}) {
  const statusColors = {
    good: 'bg-green-50 border-green-200 text-green-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    bad: 'bg-red-50 border-red-200 text-red-700',
  }

  return (
    <div className={cn(
      "p-5 rounded-xl border-2 transition-all hover:shadow-md",
      highlight ? "border-primary-200 bg-primary-50" : "border-gray-200 bg-white"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            highlight ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-600"
          )}>
            {icon}
          </div>
          <span className="font-medium text-gray-900">{title}</span>
        </div>
        <span className={cn(
          "text-lg font-bold",
          status === 'good' ? 'text-green-600' : status === 'warning' ? 'text-yellow-600' : 'text-red-600'
        )}>
          {score}
        </span>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}

function LockedDimension({
  icon,
  title,
}: {
  icon: React.ReactNode
  title: string
}) {
  return (
    <div className="p-5 rounded-xl border-2 border-gray-200 bg-gray-50 opacity-60">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-10 h-10 rounded-lg bg-gray-200 text-gray-400 flex items-center justify-center">
          {icon}
        </div>
        <span className="font-medium text-gray-500">{title}</span>
        <Lock className="w-4 h-4 text-gray-400 ml-auto" />
      </div>
      <p className="text-sm text-gray-400">付费解锁查看详情</p>
    </div>
  )
}
