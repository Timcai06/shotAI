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
  
  // Step 7: 生成AI报告
  const aiReport = generateAIReport(nineDimensions, overallScore)
  
  return {
    overall_score: overallScore,
    confidence_interval: confidenceInterval,
    detection_confidence: Math.round(detectionConfidence * 100) / 100,
    nine_dimensions: nineDimensions,
    metadata,
    ai_report: aiReport,
  }
}

/**
 * 执行所有9维度分析
 * 
 * @param sequence 姿态序列
 * @param cameraAngle 拍摄角度
 * @returns 9维度分析结果
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
 * 
 * @param dimensions 9维度结果
 * @returns 0-100综合得分
 */
function calculateOverallScore(dimensions: NineDimensionsResult): number {
  let weightedScore = 0
  
  for (const [dimension, weight] of Object.entries(ENGINE_CONFIG.dimensionWeights)) {
    const score = dimensions[dimension as keyof NineDimensionsResult]?.score || 0
    weightedScore += score * weight
  }
  
  return Math.round(weightedScore)
}

/**
 * 生成AI报告
 * 
 * @param dimensions 9维度分析结果
 * @param overallScore 综合得分
 * @returns AI报告
 */
function generateAIReport(dimensions: NineDimensionsResult, overallScore: number) {
  // 收集所有问题
  const allProblems: string[] = []
  const allRecommendations: string[] = []
  
  // 一致性
  const consistencyRecs = generateConsistencyRecommendations(dimensions.consistency)
  if (dimensions.consistency.overall_consistency !== 'high') {
    allProblems.push('动作一致性有待提高')
  }
  allRecommendations.push(...consistencyRecs)
  
  // 关节角度
  const angleRecs = generateJointAngleRecommendations(dimensions.joint_angles)
  if (dimensions.joint_angles.score < 70) {
    allProblems.push('部分关节角度偏离最优范围')
  }
  allRecommendations.push(...angleRecs)
  
  // 对称性
  const symmetryRecs = generateSymmetryRecommendations(dimensions.symmetry)
  if (dimensions.symmetry.score < 65) {
    allProblems.push('身体对称性需要改善')
  }
  allRecommendations.push(...symmetryRecs)
  
  // 投篮风格
  const styleRecs = generateStyleRecommendations(dimensions.shooting_style)
  allRecommendations.push(...styleRecs)
  
  // 时序
  const timingRecs = generateTimingRecommendations(dimensions.timing)
  if (dimensions.timing.score < 65) {
    allProblems.push('投篮节奏需要调整')
  }
  allRecommendations.push(...timingRecs)
  
  // 稳定性
  const stabilityRecs = generateStabilityRecommendations(dimensions.stability)
  if (dimensions.stability.score < 65) {
    allProblems.push('投篮稳定性不足')
  }
  allRecommendations.push(...stabilityRecs)
  
  // 协调性
  const coordinationRecs = generateCoordinationRecommendations(dimensions.coordination)
  if (dimensions.coordination.score < 65) {
    allProblems.push('关节协调性需要加强')
  }
  allRecommendations.push(...coordinationRecs)
  
  // 动力链
  const kineticRecs = generateKineticChainRecommendations(dimensions.kinetic_chain)
  if (dimensions.kinetic_chain.score < 65) {
    allProblems.push('发力顺序需要优化')
  }
  allRecommendations.push(...kineticRecs)
  
  // 去重
  const uniqueProblems = [...new Set(allProblems)].slice(0, 5)
  const uniqueRecommendations = [...new Set(allRecommendations)].slice(0, 8)
  
  // 生成总结
  const summary = generateSummary(dimensions, overallScore)
  
  // 生成训练计划
  const trainingPlan = generateTrainingPlan(dimensions, overallScore)
  
  return {
    summary,
    problems: uniqueProblems,
    recommendations: uniqueRecommendations,
    training_plan: trainingPlan,
    disclaimer: generateDisclaimer(),
  }
}

/**
 * 生成总结
 */
function generateSummary(dimensions: NineDimensionsResult, overallScore: number): string {
  let summary = ''
  
  if (overallScore >= 80) {
    summary = `您的投篮动作整体表现优秀（${overallScore}分）。`
  } else if (overallScore >= 65) {
    summary = `您的投篮动作表现良好（${overallScore}分），仍有提升空间。`
  } else if (overallScore >= 50) {
    summary = `您的投篮动作表现一般（${overallScore}分），建议针对性改进。`
  } else {
    summary = `您的投篮动作需要显著改进（${overallScore}分），建议从基础训练开始。`
  }
  
  // 添加维度亮点
  const topDimensions: string[] = []
  if (dimensions.consistency.score >= 75) topDimensions.push('动作一致性')
  if (dimensions.stability.score >= 75) topDimensions.push('稳定性')
  if (dimensions.kinetic_chain.score >= 75) topDimensions.push('动力链协调')
  
  if (topDimensions.length > 0) {
    summary += ` 您的优势维度：${topDimensions.join('、')}。`
  }
  
  // 添加需要改进的维度
  const weakDimensions: string[] = []
  if (dimensions.consistency.score < 60) weakDimensions.push('动作一致性')
  if (dimensions.stability.score < 60) weakDimensions.push('稳定性')
  if (dimensions.kinetic_chain.score < 60) weakDimensions.push('动力链协调')
  
  if (weakDimensions.length > 0) {
    summary += ` 建议优先改进：${weakDimensions.join('、')}。`
  }
  
  return summary
}

/**
 * 生成训练计划
 */
function generateTrainingPlan(dimensions: NineDimensionsResult, overallScore: number) {
  const exercises: Array<{ name: string; description: string; sets?: number; reps?: number; duration?: string }> = []
  
  // 根据弱项添加针对性练习
  if (dimensions.consistency.score < 70) {
    exercises.push({
      name: '定点投篮练习',
      description: '固定投篮位置，连续投篮10次，感受相同的动作节奏',
      sets: 3,
      reps: 10,
    })
  }
  
  if (dimensions.stability.score < 70) {
    exercises.push({
      name: '单脚平衡练习',
      description: '投篮脚单脚站立，保持平衡30秒，增强下肢稳定性',
      duration: '30秒 x 3组',
    })
  }
  
  if (dimensions.kinetic_chain.score < 70) {
    exercises.push({
      name: '髋部主导深蹲',
      description: '下蹲时髋部先启动，感受力量从下肢传递',
      sets: 3,
      reps: 10,
    })
  }
  
  if (dimensions.timing.score < 70) {
    exercises.push({
      name: '节拍器投篮',
      description: '使用节拍器，每2秒完成一次投篮，培养稳定节奏',
      duration: '5分钟',
    })
  }
  
  // 通用练习
  exercises.push({
    name: '近距离投篮',
    description: '在罚球线内一步距离练习投篮，专注于动作质量而非距离',
    sets: 3,
    reps: 15,
  })
  
  return {
    title: '个性化训练计划',
    description: `基于您的分析结果（${overallScore}分）制定的针对性训练计划`,
    exercises,
    duration_weeks: 4,
  }
}

/**
 * 生成免责声明
 */
function generateDisclaimer(): string {
  return `重要声明：
1. 本分析基于计算机视觉技术，所有测量结果均标注误差范围（±15°-25°）。
2. 分析结果仅供参考，不构成专业医疗或训练建议。
3. 投篮动作没有"唯一正确"的标准，职业球员间角度差异可达50°以上。
4. 机械改进不保证命中率提升，心理因素、防守压力等同样重要。
5. 如有身体不适，请咨询专业医生或教练。

科学依据：本分析基于运动学研究（Slegers et al. 2021; Cabarkapa et al. 2022），使用计算机视觉进行运动学分析（Kinematics），而非动力学（Kinetics）测量。`
}

// 导出引擎配置
export { ENGINE_CONFIG }
