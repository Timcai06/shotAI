'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Camera, AlertTriangle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const steps = [
  {
    title: '选择拍摄位置',
    description: '站在投篮者侧面3-5米处，确保能拍摄到全身',
    details: [
      '最佳角度：侧面视角（与投篮方向垂直）',
      '手机高度：与腰部平齐',
      '背景：简洁，避免杂乱或逆光',
    ],
  },
  {
    title: '调整画面构图',
    description: '确保投篮者全身可见，预留一定空间',
    details: [
      '画面应包含：头顶到脚底完整身体',
      '左右预留1米空间',
      '投篮手臂不要被遮挡',
    ],
  },
  {
    title: '开始拍摄',
    description: '录制完整投篮动作，从准备到随挥',
    details: [
      '拍摄时长：5-10秒即可',
      '建议拍摄3-5次投篮',
      '保持稳定，避免手抖',
    ],
  },
]

export default function GuidePage() {
  const [currentStep, setCurrentStep] = useState(0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">
          拍摄指南
        </h1>
        <p className="text-gray-600 text-center mb-12">
          正确的拍摄角度是获得准确分析结果的关键
        </p>

        {/* Error Warning */}
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 rounded-r-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-amber-800 mb-1">
                测量精度说明
              </h3>
              <p className="text-sm text-amber-700">
                侧面视角：关节角度误差 ±15°<br />
                正面/其他视角：误差 ±20-25°<br />
                <strong>重要：</strong>侧面视角是唯一推荐的拍摄角度，其他角度会显著降低分析准确性。
              </p>
            </div>
          </div>
        </div>

        {/* Step Progress */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {steps.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === currentStep
                  ? "w-8 bg-primary-600"
                  : index < currentStep
                  ? "w-4 bg-primary-400"
                  : "w-4 bg-gray-300"
              )}
            />
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-primary-600 text-white text-xl font-bold rounded-full flex items-center justify-center">
              {currentStep + 1}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {steps[currentStep].title}
            </h2>
          </div>

          <p className="text-lg text-gray-600 mb-8">
            {steps[currentStep].description}
          </p>

          {/* Step Details */}
          <div className="space-y-4 mb-8">
            {steps[currentStep].details.map((detail, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{detail}</span>
              </div>
            ))}
          </div>

          {/* Visual Placeholder */}
          <div className="bg-gray-100 rounded-xl p-8 text-center mb-8">
            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">示意图占位符</p>
            <p className="text-sm text-gray-400 mt-2">
              {currentStep === 0 && "侧面拍摄位置示意图"}
              {currentStep === 1 && "画面构图示例"}
              {currentStep === 2 && "拍摄动作示范"}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className={cn(
                "inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors",
                currentStep === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              )}
            >
              <ChevronLeft className="w-5 h-5" />
              上一步
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                下一步
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <Link
                href="/upload"
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent-600 text-white rounded-lg font-medium hover:bg-accent-700 transition-colors"
              >
                开始上传
                <ChevronRight className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>

        {/* Camera Angle Info */}
        <div className="mt-12 bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">拍摄角度对比</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
              <div className="font-medium text-green-800 mb-2">侧面视角（推荐）</div>
              <div className="text-sm text-green-700">
                误差范围：±15°<br />
                检测置信度：高<br />
                适合：所有分析维度
              </div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="font-medium text-yellow-800 mb-2">正面视角</div>
              <div className="text-sm text-yellow-700">
                误差范围：±20-25°<br />
                检测置信度：中<br />
                适合：对称性分析
              </div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="font-medium text-red-800 mb-2">其他角度</div>
              <div className="text-sm text-red-700">
                误差范围：±25°+<br />
                检测置信度：低<br />
                不建议使用
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
