import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { video_duration, camera_angle, lighting_condition, resolution } = body

    const qualityEstimate = estimateQuality({
      video_duration,
      camera_angle,
      lighting_condition,
      resolution,
    })

    return NextResponse.json({
      quality_score: qualityEstimate.score,
      confidence_level: qualityEstimate.confidence,
      error_margin: qualityEstimate.errorMargin,
      recommendations: qualityEstimate.recommendations,
    })

  } catch (error) {
    console.error('质量预估错误:', error)
    return NextResponse.json(
      { error: '评估失败' },
      { status: 500 }
    )
  }
}

interface QualityParams {
  video_duration?: number
  camera_angle?: string
  lighting_condition?: string
  resolution?: { width: number; height: number }
}

interface QualityEstimate {
  score: number
  confidence: 'high' | 'medium' | 'low'
  errorMargin: string
  recommendations: string[]
}

function estimateQuality(params: QualityParams): QualityEstimate {
  let score = 70
  const recommendations: string[] = []

  if (params.camera_angle === 'side') {
    score += 15
  } else if (params.camera_angle === 'front') {
    score += 5
    recommendations.push('侧面视角可获得更准确的分析结果')
  } else {
    score -= 10
    recommendations.push('建议从侧面拍摄以获得最佳效果')
  }

  if (params.lighting_condition === 'good') {
    score += 10
  } else if (params.lighting_condition === 'moderate') {
    score += 5
    recommendations.push('光线充足可提高检测精度')
  } else {
    score -= 15
    recommendations.push('光线不足会显著影响分析准确性')
  }

  if (params.resolution) {
    const minDimension = Math.min(params.resolution.width, params.resolution.height)
    if (minDimension >= 1080) {
      score += 5
    } else if (minDimension < 720) {
      score -= 10
      recommendations.push('建议使用更高分辨率拍摄')
    }
  }

  score = Math.max(0, Math.min(100, score))

  let confidence: 'high' | 'medium' | 'low'
  let errorMargin: string

  if (score >= 80) {
    confidence = 'high'
    errorMargin = params.camera_angle === 'side' ? '±15°' : '±20°'
  } else if (score >= 60) {
    confidence = 'medium'
    errorMargin = '±20°'
  } else {
    confidence = 'low'
    errorMargin = '±25°+'
  }

  return {
    score,
    confidence,
    errorMargin,
    recommendations,
  }
}
