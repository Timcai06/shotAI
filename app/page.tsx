'use client'

import Link from 'next/link'
import { Upload, PlayCircle, Shield, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f2785] to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">ShotAI</span>
          </div>
          <nav className="flex items-center gap-8">
            <Link href="/guide" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              拍摄指南
            </Link>
            <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              AI能力边界
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24">
        <div className="max-w-7xl mx-auto px-12">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              科学分析您的投篮动作
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              使用AI技术进行9维度专业评估，获得个性化训练建议
            </p>
            <p className="text-lg text-amber-600 font-semibold mb-8">
              首次分析仅需 ¥9.9
            </p>

            {/* Main CTA */}
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <Upload className="w-5 h-5" />
              上传视频开始分析
            </Link>

            <p className="mt-4 text-sm text-gray-500">
              支持 MP4, MOV, WebM 格式 · 最大 50MB · 60秒内完成分析
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">9维度专业分析</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<TrendingUp className="w-6 h-6" />}
              title="动作一致性"
              description="命中率最强预测因子（r=-0.96）。分析膝关节、肘关节角度波动范围。"
              color="blue"
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="科学诚实"
              description="所有测量标注误差范围（±15°），明确说明AI能力与局限。"
              color="green"
            />
            <FeatureCard
              icon={<PlayCircle className="w-6 h-6" />}
              title="个性化训练"
              description="基于您的动作数据，生成针对性的训练计划和改进建议。"
              color="orange"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">三步开始</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number={1}
              title="拍摄视频"
              description="侧面视角拍摄投篮动作，确保全身可见"
            />
            <StepCard
              number={2}
              title="上传分析"
              description="AI自动检测33个关键点，生成9维度报告"
            />
            <StepCard
              number={3}
              title="查看报告"
              description="免费预览3个维度，付费解锁完整分析"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">ShotAI</span>
            </div>
            <p className="text-sm text-gray-400">
              基于科学研究的动作分析工具 · 不保证命中率提升
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode
  title: string
  description: string
  color: 'blue' | 'green' | 'orange'
}) {
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    orange: 'bg-orange-500'
  }
  
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
      <div className={cn(
        "w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-white",
        colorClasses[color]
      )}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}

function StepCard({
  number,
  title,
  description,
}: {
  number: number
  title: string
  description: string
}) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-blue-600 text-white text-2xl font-bold rounded-full flex items-center justify-center mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}
