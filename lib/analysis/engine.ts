/**
 * Analysis Engine - 分析引擎主入口
 * 
 * 整合所有9维度分析模块，执行完整的投篮动作分析
 * 生成完整的分析结果和AI报告
 */

import type {
  PoseSequence,
  CompleteAnalysisResult,
  NineDimensionsResult,
  AnalysisMetadata,
} from '@/types/analysis'
import { poseDetector } from './pose-detector'
import { calculateErrorMargin } from './math-utils'

// 导入各维度分析模块
import { analyzeConsistency, generateConsistencyRecommendations } from './dimensions/consistency'
import { analyzeJointAngles, generateJointAngleRecommendations } from './dimensions/joint-angles'
import { analyzeSymmetry, generateSymmetryRecommendations } from './dimensions/symmetry'
import { analyzeShootingStyle, generateStyleRecommendations } from './dimensions/style'
import { analyzeTiming, generateTimingRecommendations } from './dimensions/timing'
import { analyzeStability, generateStabilityRecommendations } from './dimensions/stability'
import { analyzeCoordination, generateCoordinationRecommendations } from './dimensions/coordination'
import { analyzeKineticChain, generateKineticChainRecommendations } from './dimensions/kinetic-chain'

// 分析引擎配置
const ENGINE_CONFIG = {
  // 9维度权重（用于计算总分）
  dimensionWeights: {
    consistency: 0.20,      // 一致性（命中率最强预测因子）
    joint_angles: 0.15,     // 关节角度
    symmetry: 0.10,         // 对称性
    shooting_style: 0.10,   // 投篮风格
    timing: 0.10,           // 时序
    stability: 0.15,        // 稳定性
    coordination: 0.10,     // 协调性
    kinetic_chain: 0.10,   // 动力链
  },
}

/**
 * 执行完整的投篮动作分析
 * 
 * @param videoUrl 视频URL
 * @param cameraAngle 拍摄角度
 * @returns 完整的分析结果
 */
export async function analyzeShootingForm(
  videoUrl: string,
  cameraAngle: 'side' | 'front' | 'other'
): Promise<CompleteAnalysisResult> {
  // Step 1: 使用MediaPipe检测姿态
  const poseSequence = await poseDetector.detectVideo(videoUrl)
  
  // Step 2: 计算检测置信度
  const detectionConfidence = poseDetector.calculateDetectionConfidence(poseSequence)
  
  // Step 3: 执行9维度分析
  const nineDimensions = analyzeAllDimensions(poseSequence, cameraAngle)
  
  // Step 4: 计算综合得分
  const overallScore = calculateOverallScore(nineDimensions)
  
  // Step 5: 计算置信区间
  const errorMargin = calculateErrorMargin(cameraAngle, detectionConfidence)
  const confidenceInterval: [number, number] = [
    Math.max(0, overallScore - errorMargin),
    Math.min(100, overallScore + errorMargin),
  ]
  
  // Step 6: 生成元数据
  const metadata: AnalysisMetadata = {
    video_duration_ms: poseSequence.duration_ms,
    fps: poseSequence.fps,
    total_frames_analyzed: poseSequence.total_frames,
    camera_angle: cameraAngle,
    detection_confidence: Math.round(detectionConfidence * 100) / 100,
    processing_timestamp: new Date().toISOString(),
    error_margins: {
      side_view: 15,
      front_view: 20,
      other_view: 25,
    },
  }
  
  // Step 7: 生成AI报告 (调用 DeepSeek API)
  const aiReport = await generateAIReport(nineDimensions, overallScore, cameraAngle)
  
  return {
    overall_score: overallScore,
    confidence_interval: confidenceInterval,
    detection_confidence: detectionConfidence,
    nine_dimensions: nineDimensions,
    metadata,
    ai_report: aiReport,
  }
}

/**
 * 执行所有9维度分析
 */
function analyzeAllDimensions(
  sequence: PoseSequence,
  cameraAngle: 'side' | 'front' | 'other'
): NineDimensionsResult {
  return {
    consistency: analyzeConsistency(sequence, cameraAngle),
    joint_angles: analyzeJointAngles(sequence, cameraAngle),
    symmetry: analyzeSymmetry(sequence, cameraAngle),
    shooting_style: analyzeShootingStyle(sequence),
    timing: analyzeTiming(sequence),
    stability: analyzeStability(sequence),
    coordination: analyzeCoordination(sequence),
    kinetic_chain: analyzeKineticChain(sequence),
  }
}

/**
 * 计算综合得分
 */
function calculateOverallScore(nineDimensions: NineDimensionsResult): number {
  const scores = {
    consistency: nineDimensions.consistency.score,
    joint_angles: nineDimensions.joint_angles.score,
    symmetry: nineDimensions.symmetry.score,
    shooting_style: nineDimensions.shooting_style.score,
    timing: nineDimensions.timing.score,
    stability: nineDimensions.stability.score,
    coordination: nineDimensions.coordination.score,
    kinetic_chain: nineDimensions.kinetic_chain.score,
  }
  
  let totalScore = 0
  for (const [dimension, weight] of Object.entries(ENGINE_CONFIG.dimensionWeights)) {
    totalScore += scores[dimension as keyof typeof scores] * weight
  }
  
  return Math.round(totalScore)
}

/**
 * 调用 DeepSeek API 生成 AI 分析报告
 */
async function generateAIReport(
  nineDimensions: NineDimensionsResult,
  overallScore: number,
  cameraAngle: string
): Promise<CompleteAnalysisResult['ai_report']> {
  const apiKey = process.env.DEEPSEEK_API_KEY
  
  if (!apiKey) {
    console.warn('DeepSeek API key not configured, using local fallback')
    return generateLocalReport(nineDimensions, overallScore)
  }

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `你是专业的篮球投篮动作分析师。根据用户的投篮动作分析数据，生成个性化、易于理解的AI分析报告。

请生成JSON格式报告，包含字段：
- summary: 总体评价（字符串）
- problems: 需要改进的地方（字符串数组，最多5条）
- recommendations: 改进建议（字符串数组，最多8条）
- training_plan: 训练计划（对象：title, description, exercises数组, duration_weeks）
- disclaimer: 免责声明`
          },
          {
            role: 'user',
            content: `投篮数据：
- 综合得分: ${overallScore}/100
- 拍摄视角: ${cameraAngle}
- 各维度得分:
  - 一致性: ${nineDimensions.consistency.score}/100
  - 关节角度: ${nineDimensions.joint_angles.score}/100
  - 对称性: ${nineDimensions.symmetry.score}/100
  - 投篮风格: ${nineDimensions.shooting_style.score}/100 (${nineDimensions.shooting_style.style})
  - 时序分析: ${nineDimensions.timing.score}/100
  - 稳定性: ${nineDimensions.stability.score}/100
  - 协调性: ${nineDimensions.coordination.score}/100
  - 动力链: ${nineDimensions.kinetic_chain.score}/100

请生成专业的中文分析报告。`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    
    if (!content) {
      throw new Error('No content in response')
    }

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    const report = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content)

    return {
      summary: report.summary || '分析完成',
      problems: Array.isArray(report.problems) ? report.problems : [],
      recommendations: Array.isArray(report.recommendations) ? report.recommendations : [],
      training_plan: report.training_plan || {
        title: '投篮改进计划',
        description: '建议进行针对性训练',
        exercises: [],
        duration_weeks: 4,
      },
      disclaimer: report.disclaimer || '本分析基于AI视觉识别技术，存在±15-25°的误差范围。建议结合专业教练指导进行训练。',
    }
  } catch (error) {
    console.error('DeepSeek API error:', error)
    return generateLocalReport(nineDimensions, overallScore)
  }
}

/**
 * 本地回退报告生成
 */
function generateLocalReport(
  nineDimensions: NineDimensionsResult,
  overallScore: number
): CompleteAnalysisResult['ai_report'] {
  const allProblems: string[] = []
  const allRecommendations: string[] = []
  
  if (nineDimensions.consistency.score < 70) allProblems.push('动作一致性不足，重复性差')
  if (nineDimensions.joint_angles.score < 70) allProblems.push('关节角度偏离最优范围')
  if (nineDimensions.symmetry.score < 60) allProblems.push('左右身体不够协调')
  if (nineDimensions.timing.score < 70) allProblems.push('投篮节奏不够稳定')
  if (nineDimensions.stability.score < 70) allProblems.push('身体稳定性不足')
  if (nineDimensions.coordination.score < 70) allProblems.push('关节协调性需要改善')
  if (nineDimensions.kinetic_chain.score < 70) allProblems.push('动力链传递效率低')
  
  allRecommendations.push(...generateConsistencyRecommendations(nineDimensions.consistency))
  allRecommendations.push(...generateJointAngleRecommendations(nineDimensions.joint_angles))
  allRecommendations.push(...generateSymmetryRecommendations(nineDimensions.symmetry))
  allRecommendations.push(...generateTimingRecommendations(nineDimensions.timing))
  allRecommendations.push(...generateStabilityRecommendations(nineDimensions.stability))
  allRecommendations.push(...generateCoordinationRecommendations(nineDimensions.coordination))
  allRecommendations.push(...generateKineticChainRecommendations(nineDimensions.kinetic_chain))
  
  const summary = generateSummary(overallScore, nineDimensions)
  const trainingPlan = generateTrainingPlan(nineDimensions, overallScore)
  
  return {
    summary,
    problems: [...new Set(allProblems)].slice(0, 5),
    recommendations: [...new Set(allRecommendations)].slice(0, 8),
    training_plan: trainingPlan,
    disclaimer: '本分析基于AI视觉识别技术，存在±15-25°的误差范围。建议结合专业教练指导进行训练。',
  }
}

/**
 * 生成总体评价
 */
function generateSummary(
  overallScore: number,
  nineDimensions: NineDimensionsResult
): string {
  let summary = ''
  
  if (overallScore >= 85) {
    summary = `您的投篮动作表现优秀（${overallScore}分）！`
    summary += '各项指标均衡发展，特别是一致性和稳定性表现突出。'
    summary += '建议继续保持当前训练强度，可以尝试增加投篮距离或难度。'
  } else if (overallScore >= 70) {
    summary = `您的投篮动作良好（${overallScore}分）。`
    summary += '基础动作已经成型，建议针对薄弱环节进行针对性训练。'
    summary += '特别关注一致性和稳定性的提升，这将直接提高命中率。'
  } else if (overallScore >= 55) {
    summary = `您的投篮动作有改进空间（${overallScore}分）。`
    summary += '建议从基础动作开始规范，重点加强下肢力量和核心稳定性。'
    summary += '通过系统训练，您的投篮水平会有显著提升。'
  } else {
    summary = `您的投篮动作需要重新调整（${overallScore}分）。`
    summary += '建议在专业教练指导下重新学习标准投篮动作。'
    summary += '从基础的站姿、握球、出手点开始逐步改进。'
  }
  
  return summary
}

/**
 * 生成训练计划
 */
function generateTrainingPlan(
  nineDimensions: NineDimensionsResult,
  overallScore: number
): NonNullable<CompleteAnalysisResult['ai_report']>['training_plan'] {
  const exercises: Array<{
    name: string
    description: string
    sets?: number
    reps?: number
    duration?: string
  }> = []
  
  // 根据分析结果推荐训练
  
  // 一致性训练
  if (nineDimensions.consistency.score < 75) {
    exercises.push({
      name: '定点投篮练习',
      description: '在同一位置连续投篮50次，记录命中数。重点是保持动作一致性。',
      sets: 3,
      reps: 50,
    })
  }
  
  // 稳定性训练
  if (nineDimensions.stability.score < 75) {
    exercises.push({
      name: '单脚站立投篮',
      description: '单脚站立，进行投篮练习。增强下肢稳定性和核心力量。',
      sets: 3,
      reps: 20,
    })
  }
  
  // 协调性训练
  if (nineDimensions.coordination.score < 75) {
    exercises.push({
      name: '连续跳投',
      description: '快速连续进行跳投，重点是保持身体协调和节奏稳定。',
      sets: 3,
      reps: 15,
    })
  }
  
  // 动力链训练
  if (nineDimensions.kinetic_chain.score < 75) {
    exercises.push({
      name: '深蹲跳',
      description: '从深蹲位置快速起跳，感受下肢力量向上传递。',
      sets: 3,
      reps: 12,
    })
  }
  
  // 基础训练
  exercises.push({
    name: '无球模拟投篮',
    description: '不持球，进行完整的投篮动作模拟。建立肌肉记忆。',
    sets: 3,
    duration: '5分钟',
  })
  
  exercises.push({
    name: '投篮基础训练',
    description: '从近距离开始，逐步增加投篮距离。每个距离投篮10次。',
    sets: 5,
    reps: 10,
  })
  
  // 确定训练周期
  let durationWeeks = 4
  if (overallScore < 60) {
    durationWeeks = 8
  } else if (overallScore < 75) {
    durationWeeks = 6
  }
  
  return {
    title: `${durationWeeks}周投篮改进计划`,
    description: `根据您的分析结果，我们为您制定了${durationWeeks}周的个性化训练计划。建议每周训练3-4次，每次30-45分钟。`,
    exercises: exercises as any,
    duration_weeks: durationWeeks,
  }
}
