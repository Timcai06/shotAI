'use client'

import Link from 'next/link'
import { ChevronLeft, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'

const capabilities = [
  {
    category: '能做（基于视频分析）',
    icon: <CheckCircle className="w-6 h-6 text-green-600" />,
    items: [
      {
        title: '关节角度测量',
        description: '测量膝、髋、肩、肘、腕关节角度，误差范围 ±15°（侧面视角）',
        confidence: '高',
      },
      {
        title: '动作一致性分析',
        description: '分析多次投篮中关节角度波动范围，评估动作重复性',
        confidence: '高',
        highlight: true,
      },
      {
        title: '时序分析',
        description: '计算准备、蓄力、出手、随挥各阶段时长',
        confidence: '中',
      },
      {
        title: '动力链协调性',
        description: '基于关节角度变化时序，评估发力顺序是否流畅',
        confidence: '中',
      },
      {
        title: '投篮风格识别',
        description: '区分One-motion和Two-motion投篮风格',
        confidence: '中',
      },
      {
        title: '左右对称性',
        description: '比较左右侧关节角度差异（侧面视角有限）',
        confidence: '中',
      },
    ],
  },
  {
    category: '不能做（需要额外设备）',
    icon: <XCircle className="w-6 h-6 text-red-600" />,
    items: [
      {
        title: '力量测量',
        description: '无法测量发力大小。需要测力台（设备成本约50万元）',
        reason: '视频只能看到角度变化，看不到力量',
      },
      {
        title: '神经肌肉协调',
        description: '无法评估神经控制精度。需要EMG肌电设备',
        reason: '视频分析属于运动学，神经肌肉属于生理学',
      },
      {
        title: '命中率预测',
        description: '不能预测命中率变化。机械改进≠命中率提升',
        reason: '心理因素、防守压力等同样重要',
      },
      {
        title: '绝对准确率',
        description: '所有测量都有误差范围，不存在"标准姿势"适合所有人',
        reason: '职业球员间关节角度差异可达50°以上',
      },
    ],
  },
]

export default function AboutPage() {
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">AI能力边界</h1>
          <p className="text-lg text-gray-600">
            科学诚实：明确说明我们能做什么、不能做什么
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-12">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-semibold text-amber-800 mb-2">
                重要科学声明
              </h2>
              <p className="text-amber-700 mb-4">
                ShotAI 基于计算机视觉技术进行动作分析。我们的目标是提供有用的参考信息，
                而非绝对的"正确标准"。所有测量结果都应结合您自身的感受和实际情况来理解。
              </p>
              <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-100 p-3 rounded">
                <Info className="w-4 h-4" />
                <span>关键原则：<strong>一致性 &gt; 绝对角度</strong>（命中率最强预测因子）</span>
              </div>
            </div>
          </div>
        </div>

        {/* Capabilities */}
        <div className="space-y-12">
          {capabilities.map((section, idx) => (
            <div key={idx}>
              <div className="flex items-center gap-3 mb-6">
                {section.icon}
                <h2 className="text-xl font-bold text-gray-900">{section.category}</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {section.items.map((item, itemIdx) => (
                  <div
                    key={itemIdx}
                    className={`p-6 rounded-xl border-2 ${
                      (item as any).highlight
                        ? 'bg-primary-50 border-primary-200'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      {(item as any).confidence && (
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            (item as any).confidence === '高'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          置信度：{(item as any).confidence}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                    {(item as any).reason && (
                      <p className="text-xs text-gray-500 italic">{(item as any).reason}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Science Reference */}
        <div className="mt-12 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">科学依据</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              <strong>Slegers et al. (2021)</strong> - 动作一致性是命中率最强预测因子（r=-0.96）
            </p>
            <p>
              <strong>Cabarkapa et al. (2022)</strong> - 投篮时序分析研究
            </p>
            <p>
              <strong>Winter (2009)</strong> - 运动学（Kinematics）与动力学（Kinetics）的区别
            </p>
            <p className="text-xs text-gray-500 mt-4">
              我们的分析基于运动学（关节角度变化），而非动力学（力量测量）。
              这是视频分析的根本局限，也是科学诚实的体现。
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">了解了我们的能力与局限？</p>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
          >
            开始分析
          </Link>
        </div>
      </main>
    </div>
  )
}
