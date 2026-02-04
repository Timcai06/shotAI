'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Download, Share2, AlertCircle, CheckCircle } from 'lucide-react'
import type { CompleteAnalysisResult, PoseSequence } from '@/types/analysis'
import { 
  Skeleton3DViewer, 
  DimensionRadarChart, 
  JointAnglesChart,
  PhaseDistributionChart,
  ConsistencyComparisonChart 
} from '@/components/visualization'

export default function ResultPage() {
  const params = useParams()
  const router = useRouter()
  const taskId = params.task_id as string

  const [result, setResult] = useState<CompleteAnalysisResult | null>(null)
  const [poseSequence, setPoseSequence] = useState<PoseSequence | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'timeline'>('overview')

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await fetch(`/api/analysis/${taskId}/status`)
        const data = await response.json()

        if (data.status === 'completed' && data.results) {
          setResult(data.results)
          // Generate mock pose sequence for visualization demo
          setPoseSequence({
            frames: generateMockFrames(30),
            fps: 30,
            duration_ms: 1000,
            total_frames: 30
          })
        } else if (data.status === 'failed') {
          setError(data.error || '分析失败')
        } else {
          setError('分析结果不可用')
        }
      } catch (err) {
        setError('获取结果失败')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchResult()
  }, [taskId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载分析结果中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/" className="flex items-center gap-2 text-primary-600 hover:text-primary-700">
              <ChevronLeft className="w-5 h-5" />
              返回首页
            </Link>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-900 mb-2">分析失败</h2>
            <p className="text-red-700 mb-6">{error}</p>
            <Link
              href="/upload"
              className="inline-block bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              重新上传
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <p className="text-gray-600">无法加载分析结果</p>
      </div>
    )
  }

  const { overall_score, nine_dimensions, confidence_interval, metadata } = result

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f2785] to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-12 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary-600 hover:text-primary-700">
            <ChevronLeft className="w-5 h-5" />
            返回
          </Link>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Download className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-12 py-12">
        {/* Overall Score Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">投篮动作分析结果</h1>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Overall Score */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-6">
              <p className="text-gray-600 text-sm font-medium mb-2">综合评分</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-primary-600">{overall_score}</span>
                <span className="text-gray-600">/100</span>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                置信区间: {confidence_interval[0].toFixed(0)} - {confidence_interval[1].toFixed(0)}
              </p>
            </div>

            {/* Detection Confidence */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
              <p className="text-gray-600 text-sm font-medium mb-2">检测置信度</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-blue-600">
                  {(metadata.detection_confidence * 100).toFixed(0)}
                </span>
                <span className="text-gray-600">%</span>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                误差范围: ±{metadata.error_margins.side_view}°
              </p>
            </div>

            {/* Video Info */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
              <p className="text-gray-600 text-sm font-medium mb-2">视频信息</p>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="text-gray-600">时长:</span>
                  <span className="font-semibold ml-2">
                    {(metadata.video_duration_ms / 1000).toFixed(1)}秒
                  </span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-600">帧数:</span>
                  <span className="font-semibold ml-2">{metadata.total_frames_analyzed}</span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-600">视角:</span>
                  <span className="font-semibold ml-2">{metadata.camera_angle}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          {(['overview', 'details', 'timeline'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? 'text-primary-600 border-primary-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              {tab === 'overview' && '📊 总体概览'}
              {tab === 'details' && '📈 详细分析'}
              {tab === 'timeline' && '⏱️ 时序分析'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 3D Skeleton Viewer */}
            {poseSequence && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">🎮 3D 动作回放</h2>
                <Skeleton3DViewer 
                  poseSequence={poseSequence} 
                  width={800}
                  height={500}
                />
              </div>
            )}

            {/* Radar Chart */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📊 9维度分析雷达图</h2>
              <div className="flex justify-center">
                <DimensionRadarChart 
                  dimensions={nine_dimensions}
                  width={500}
                  height={400}
                />
              </div>
            </div>

            {/* 9 Dimensions Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <DimensionCard
                title="一致性"
                score={nine_dimensions.consistency.score}
                description="动作重复性和稳定性"
                color="blue"
              />
              <DimensionCard
                title="关节角度"
                score={nine_dimensions.joint_angles.score}
                description="各关节角度是否在最优范围"
                color="green"
              />
              <DimensionCard
                title="对称性"
                score={nine_dimensions.symmetry.score}
                description="左右身体的协调性"
                color="purple"
              />
              <DimensionCard
                title="投篮风格"
                score={nine_dimensions.shooting_style.score}
                description={nine_dimensions.shooting_style.style === 'one_motion' ? '一段式' : '二段式'}
                color="amber"
              />
              <DimensionCard
                title="时序分析"
                score={nine_dimensions.timing.score}
                description="各阶段时长和节奏"
                color="red"
              />
              <DimensionCard
                title="稳定性"
                score={nine_dimensions.stability.score}
                description="下肢和上肢的稳定性"
                color="cyan"
              />
              <DimensionCard
                title="协调性"
                score={nine_dimensions.coordination.score}
                description="关节间的同步性"
                color="pink"
              />
              <DimensionCard
                title="动力链"
                score={nine_dimensions.kinetic_chain.score}
                description="力量传递效率"
                color="lime"
              />
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* Consistency Analysis */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">🎯 一致性分析</h2>
              <p className="text-gray-600 mb-4">
                一致性是命中率的最强预测因子。您的一致性得分为 {nine_dimensions.consistency.score} 分。
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ConsistencyComparisonChart 
                  consistency={nine_dimensions.consistency}
                  width={400}
                  height={300}
                />
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded p-4">
                    <p className="text-sm text-gray-600">膝关节标准差</p>
                    <p className="text-xl font-bold text-blue-600">
                      ±{nine_dimensions.consistency.knee_angle_std.toFixed(1)}°
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded p-4">
                    <p className="text-sm text-gray-600">肘关节标准差</p>
                    <p className="text-xl font-bold text-green-600">
                      ±{nine_dimensions.consistency.elbow_angle_std.toFixed(1)}°
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded p-4">
                    <p className="text-sm text-gray-600">腕关节标准差</p>
                    <p className="text-xl font-bold text-amber-600">
                      ±{nine_dimensions.consistency.wrist_angle_std.toFixed(1)}°
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Shooting Style */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">🏀 投篮风格</h2>
              <p className="text-gray-600 mb-4">
                您的投篮风格为{' '}
                <span className="font-semibold">
                  {nine_dimensions.shooting_style.style === 'one_motion' ? '一段式（One-motion）' : '二段式（Two-motion）'}
                </span>
                ，置信度 {(nine_dimensions.shooting_style.confidence * 100).toFixed(0)}%。
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded p-4">
                  <p className="text-sm text-gray-600">流畅度</p>
                  <p className="text-xl font-bold text-blue-600">
                    {(nine_dimensions.shooting_style.characteristics.release_smoothness * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="bg-gray-50 rounded p-4">
                  <p className="text-sm text-gray-600">肘部伸展时机</p>
                  <p className="text-xl font-bold text-green-600">
                    {(nine_dimensions.shooting_style.characteristics.elbow_extension_timing * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Kinetic Chain */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">⚡ 动力链分析</h2>
              <p className="text-gray-600 mb-4">
                力量传递效率: {(nine_dimensions.kinetic_chain.force_transfer_efficiency * 100).toFixed(0)}%
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className={`rounded p-4 ${nine_dimensions.kinetic_chain.phases.hip_initiation ? 'bg-green-100' : 'bg-red-100'}`}>
                  <p className="text-sm text-gray-600">髋部启动</p>
                  <p className="text-xl font-bold">{nine_dimensions.kinetic_chain.phases.hip_initiation ? '✓' : '✗'}</p>
                </div>
                <div className={`rounded p-4 ${nine_dimensions.kinetic_chain.phases.knee_follow_through ? 'bg-green-100' : 'bg-red-100'}`}>
                  <p className="text-sm text-gray-600">膝部跟随</p>
                  <p className="text-xl font-bold">{nine_dimensions.kinetic_chain.phases.knee_follow_through ? '✓' : '✗'}</p>
                </div>
                <div className={`rounded p-4 ${nine_dimensions.kinetic_chain.phases.elbow_extension ? 'bg-green-100' : 'bg-red-100'}`}>
                  <p className="text-sm text-gray-600">肘部伸展</p>
                  <p className="text-xl font-bold">{nine_dimensions.kinetic_chain.phases.elbow_extension ? '✓' : '✗'}</p>
                </div>
                <div className={`rounded p-4 ${nine_dimensions.kinetic_chain.phases.wrist_snap ? 'bg-green-100' : 'bg-red-100'}`}>
                  <p className="text-sm text-gray-600">手腕下压</p>
                  <p className="text-xl font-bold">{nine_dimensions.kinetic_chain.phases.wrist_snap ? '✓' : '✗'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-6">
            {/* Phase Distribution */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">⏱️ 各阶段时间占比</h2>
              <p className="text-gray-600 mb-4">
                总投篮时长: {(nine_dimensions.timing.total_duration_ms / 1000).toFixed(2)} 秒
              </p>
              <PhaseDistributionChart 
                timing={nine_dimensions.timing}
                width={600}
                height={300}
              />
              <div className="grid grid-cols-4 gap-4 mt-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">准备阶段</p>
                  <p className="text-lg font-bold text-blue-600">
                    {nine_dimensions.timing.phases.setup.percentage.toFixed(1)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">蓄力阶段</p>
                  <p className="text-lg font-bold text-green-600">
                    {nine_dimensions.timing.phases.load.percentage.toFixed(1)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">出手阶段</p>
                  <p className="text-lg font-bold text-amber-600">
                    {nine_dimensions.timing.phases.release.percentage.toFixed(1)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">随挥阶段</p>
                  <p className="text-lg font-bold text-red-600">
                    {nine_dimensions.timing.phases.follow_through.percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Joint Angles Over Time */}
            {poseSequence && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">📈 关节角度变化</h2>
                <JointAnglesChart 
                  poseSequence={poseSequence}
                  width={700}
                  height={300}
                />
              </div>
            )}
          </div>
        )}

        {/* AI Report */}
        {result.ai_report && (
          <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">🤖 AI 分析报告</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">总体评价</h3>
                <p className="text-gray-700 leading-relaxed">{result.ai_report.summary}</p>
              </div>

              {result.ai_report.problems.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">需要改进的地方</h3>
                  <ul className="space-y-2">
                    {result.ai_report.problems.map((problem, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="text-red-600 font-bold">•</span>
                        <span className="text-gray-700">{problem}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.ai_report.recommendations.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">改进建议</h3>
                  <ul className="space-y-2">
                    {result.ai_report.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="text-green-600 font-bold">✓</span>
                        <span className="text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.ai_report.disclaimer && (
                <div className="bg-amber-50 border border-amber-200 rounded p-4">
                  <p className="text-sm text-amber-800">{result.ai_report.disclaimer}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center mt-8">
          <Link
            href="/upload"
            className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            再次分析
          </Link>
          <Link
            href="/"
            className="bg-gray-200 text-gray-900 px-8 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            返回首页
          </Link>
        </div>
      </main>
    </div>
  )
}

interface DimensionCardProps {
  title: string
  score: number
  description: string
  color: 'blue' | 'green' | 'purple' | 'amber' | 'red' | 'cyan' | 'pink' | 'lime'
}

function DimensionCard({ title, score, description, color }: DimensionCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    green: 'text-green-600 bg-green-50 border-green-200',
    purple: 'text-purple-600 bg-purple-50 border-purple-200',
    amber: 'text-amber-600 bg-amber-50 border-amber-200',
    red: 'text-red-600 bg-red-50 border-red-200',
    cyan: 'text-cyan-600 bg-cyan-50 border-cyan-200',
    pink: 'text-pink-600 bg-pink-50 border-pink-200',
    lime: 'text-lime-600 bg-lime-50 border-lime-200',
  }

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-green-600'
    if (s >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBg = (s: number) => {
    if (s >= 80) return 'bg-green-50'
    if (s >= 60) return 'bg-yellow-50'
    return 'bg-red-50'
  }

  return (
    <div className={`rounded-lg p-4 border ${colorClasses[color]}`}>
      <p className="text-sm text-gray-600 font-medium">{title}</p>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
      <div className="flex items-baseline gap-1 mt-2">
        <span className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}</span>
        <span className="text-gray-600 text-sm">/100</span>
      </div>
    </div>
  )
}

// Mock data generator for demo
function generateMockFrames(count: number) {
  const frames = []
  for (let i = 0; i < count; i++) {
    const progress = i / count
    const phase = progress < 0.25 ? 'setup' : progress < 0.5 ? 'load' : progress < 0.75 ? 'release' : 'follow_through'
    
    const landmarks = []
    for (let j = 0; j < 33; j++) {
      let x = 0.5
      let y = 0.5
      let z = 0
      let visibility = 1
      
      const kneeBend = phase === 'load' ? 0.3 : phase === 'release' ? 0.15 : 0.1
      const elbowAngle = phase === 'load' ? 90 : phase === 'release' ? 150 : 120
      
      switch (j) {
        case 0: y = 0.15; break
        case 11: x = 0.4; y = 0.25; break
        case 12: x = 0.6; y = 0.25; break
        case 13: x = 0.35; y = 0.4 - (elbowAngle / 1000); break
        case 14: x = 0.65; y = 0.4 - (elbowAngle / 1000); break
        case 15: x = phase === 'release' ? 0.5 : 0.3; y = phase === 'follow_through' ? 0.2 : 0.35; z = phase === 'release' ? 0.2 : 0; break
        case 16: x = phase === 'release' ? 0.5 : 0.7; y = phase === 'follow_through' ? 0.2 : 0.35; z = phase === 'release' ? 0.2 : 0; break
        case 23: x = 0.42; y = 0.5 + kneeBend * 0.3; break
        case 24: x = 0.58; y = 0.5 + kneeBend * 0.3; break
        case 25: x = 0.4; y = 0.7 + kneeBend * 0.2; break
        case 26: x = 0.6; y = 0.7 + kneeBend * 0.2; break
        case 27: x = 0.4; y = 0.9; break
        case 28: x = 0.6; y = 0.9; break
        default:
          x = 0.3 + Math.random() * 0.4
          y = 0.2 + Math.random() * 0.6
          visibility = 0.7 + Math.random() * 0.3
      }
      
      landmarks.push({ x, y, z, visibility })
    }
    
    frames.push({
      landmarks,
      timestamp: (i / 30) * 1000,
    })
  }
  return frames
}
