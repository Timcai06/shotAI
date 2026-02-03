/**
 * Kinetic Chain Analysis - 动力链协调性分析
 * 
 * 分析动力链传递效率：地面 → 髋部 → 躯干 → 肩部 → 肘部 → 手腕
 * 
 * 理想的发力顺序：髋部启动 → 膝部跟随 → 躯干旋转 → 肩部 → 肘部伸展 → 手腕释放
 */

import type { PoseSequence, KineticChainAnalysis, JointType } from '@/types/analysis'
import { calculateAllJointAngles } from '../angle-calculator'
import { findPeaks, mean } from '../math-utils'

// 动力链分析配置
const KINETIC_CONFIG = {
  // 理想的发力顺序延迟（相对于前一环节）
  idealSequenceDelays: {
    hip: 0,      // 髋部首先启动
    knee: 2,     // 膝部延迟2帧
    shoulder: 4, // 肩部延迟4帧
    elbow: 6,    // 肘部延迟6帧
    wrist: 8,    // 手腕延迟8帧
  },
  
  // 评分权重
  weights: {
    sequence: 0.4,    // 发力顺序
    timing: 0.35,     // 时机协调
    efficiency: 0.25, // 传递效率
  },
}

/**
 * 分析动力链协调性
 * 
 * @param sequence MediaPipe姿态序列
 * @returns 动力链分析结果
 */
export function analyzeKineticChain(sequence: PoseSequence): KineticChainAnalysis {
  // 计算所有关节角度
  const allJointAngles = calculateAllJointAngles(sequence)
  const dominantSide = detectDominantSide(allJointAngles)
  
  // 获取关键关节数据
  const hip = dominantSide === 'right'
    ? allJointAngles.get('right_hip' as JointType)
    : allJointAngles.get('left_hip' as JointType)
  
  const knee = dominantSide === 'right'
    ? allJointAngles.get('right_knee' as JointType)
    : allJointAngles.get('left_knee' as JointType)
  
  const shoulder = dominantSide === 'right'
    ? allJointAngles.get('right_shoulder' as JointType)
    : allJointAngles.get('left_shoulder' as JointType)
  
  const elbow = dominantSide === 'right'
    ? allJointAngles.get('right_elbow' as JointType)
    : allJointAngles.get('left_elbow' as JointType)
  
  const wrist = dominantSide === 'right'
    ? allJointAngles.get('right_wrist' as JointType)
    : allJointAngles.get('left_wrist' as JointType)
  
  if (!hip || !knee || !shoulder || !elbow || !wrist) {
    return createEmptyKineticChainAnalysis()
  }
  
  // 分析发力顺序
  const sequenceResult = analyzeSequenceTiming({
    hip,
    knee,
    shoulder,
    elbow,
    wrist,
  })
  
  // 分析时机协调
  const timingResult = analyzeTimingCoordination({
    hip,
    knee,
    shoulder,
    elbow,
    wrist,
  })
  
  // 分析传递效率
  const efficiencyResult = analyzeTransferEfficiency({
    hip,
    knee,
    shoulder,
    elbow,
    wrist,
  })
  
  // 综合评分
  const totalScore = Math.round(
    sequenceResult.score * KINETIC_CONFIG.weights.sequence +
    timingResult.score * KINETIC_CONFIG.weights.timing +
    efficiencyResult.score * KINETIC_CONFIG.weights.efficiency
  )
  
  return {
    score: totalScore,
    force_transfer_efficiency: Math.round(efficiencyResult.efficiency * 100) / 100,
    sequence_score: Math.round(sequenceResult.score),
    timing_score: Math.round(timingResult.score),
    phases: {
      hip_initiation: sequenceResult.phases.hip,
      knee_follow_through: sequenceResult.phases.knee,
      elbow_extension: sequenceResult.phases.elbow,
      wrist_snap: sequenceResult.phases.wrist,
    },
  }
}

/**
 * 分析发力顺序
 * 
 * 检查各关节的启动顺序是否符合理想动力链
 * 
 * @param joints 关节数据
 * @returns 顺序分析结果
 */
function analyzeSequenceTiming(joints: {
  hip: any
  knee: any
  shoulder: any
  elbow: any
  wrist: any
}): { score: number; phases: Record<string, boolean> } {
  // 找到各关节开始动作的位置（角度变化开始加速的点）
  const hipStart = findAccelerationStart(joints.hip.angles)
  const kneeStart = findAccelerationStart(joints.knee.angles)
  const shoulderStart = findAccelerationStart(joints.shoulder.angles)
  const elbowStart = findAccelerationStart(joints.elbow.angles)
  const wristStart = findAccelerationStart(joints.wrist.angles)
  
  // 检查顺序：髋 → 膝 → 肩 → 肘 → 腕
  const phases = {
    hip: true,  // 髋部总是第一个
    knee: kneeStart > hipStart,
    shoulder: shoulderStart > kneeStart,
    elbow: elbowStart > shoulderStart,
    wrist: wristStart > elbowStart,
  }
  
  // 计算顺序得分
  const correctPhases = Object.values(phases).filter(Boolean).length
  const sequenceScore = (correctPhases / 5) * 100
  
  // 检查延迟是否符合理想范围
  const delays = {
    knee: kneeStart - hipStart,
    shoulder: shoulderStart - kneeStart,
    elbow: elbowStart - shoulderStart,
    wrist: wristStart - elbowStart,
  }
  
  let timingScore = 100
  for (const [joint, delay] of Object.entries(delays)) {
    const idealDelay = KINETIC_CONFIG.idealSequenceDelays[joint as keyof typeof KINETIC_CONFIG.idealSequenceDelays]
    const diff = Math.abs(delay - idealDelay)
    timingScore -= Math.min(25, diff * 5)  // 每帧差异扣5分，最多扣25分
  }
  
  // 综合评分（顺序60%，时机40%）
  const totalScore = sequenceScore * 0.6 + Math.max(0, timingScore) * 0.4
  
  return {
    score: totalScore,
    phases,
  }
}

/**
 * 分析时机协调
 * 
 * 评估各关节动作的时机配合
 * 
 * @param joints 关节数据
 * @returns 时机分析结果
 */
function analyzeTimingCoordination(joints: {
  hip: any
  knee: any
  shoulder: any
  elbow: any
  wrist: any
}): { score: number } {
  // 找到各关节达到最大速度的位置
  const hipMaxSpeed = findMaxVelocityIndex(joints.hip.angles)
  const kneeMaxSpeed = findMaxVelocityIndex(joints.knee.angles)
  const shoulderMaxSpeed = findMaxVelocityIndex(joints.shoulder.angles)
  const elbowMaxSpeed = findMaxVelocityIndex(joints.elbow.angles)
  const wristMaxSpeed = findMaxVelocityIndex(joints.wrist.angles)
  
  // 理想的峰值速度顺序应该与发力顺序一致
  const idealOrder = [
    hipMaxSpeed,
    kneeMaxSpeed,
    shoulderMaxSpeed,
    elbowMaxSpeed,
    wristMaxSpeed,
  ]
  
  // 检查是否按顺序递增
  let correctOrderCount = 1  // 髋部总是第一个
  for (let i = 1; i < idealOrder.length; i++) {
    if (idealOrder[i] > idealOrder[i - 1]) {
      correctOrderCount++
    }
  }
  
  const orderScore = (correctOrderCount / 5) * 100
  
  // 计算间隔均匀度
  const intervals: number[] = []
  for (let i = 1; i < idealOrder.length; i++) {
    intervals.push(idealOrder[i] - idealOrder[i - 1])
  }
  
  const avgInterval = mean(intervals)
  const intervalVariance = mean(intervals.map(i => Math.abs(i - avgInterval)))
  const uniformityScore = Math.max(0, 100 - (intervalVariance * 10))
  
  // 综合评分（顺序60%，均匀度40%）
  return {
    score: orderScore * 0.6 + uniformityScore * 0.4,
  }
}

/**
 * 分析传递效率
 * 
 * 评估力量从下肢传递到上肢的效率
 * 
 * @param joints 关节数据
 * @returns 效率分析结果
 */
function analyzeTransferEfficiency(joints: {
  hip: any
  knee: any
  shoulder: any
  elbow: any
  wrist: any
}): { score: number; efficiency: number } {
  // 计算各关节的动作范围
  const ranges = {
    hip: joints.hip.max - joints.hip.min,
    knee: joints.knee.max - joints.knee.min,
    shoulder: joints.shoulder.max - joints.shoulder.min,
    elbow: joints.elbow.max - joints.elbow.min,
    wrist: joints.wrist.max - joints.wrist.min,
  }
  
  // 理想范围比例（基于动力链传递衰减）
  // 下肢动作幅度大，上肢逐渐减小
  const idealRatios = {
    hip: 1.0,
    knee: 0.9,
    shoulder: 0.7,
    elbow: 0.8,
    wrist: 0.6,
  }
  
  // 计算实际比例（相对于髋部）
  const actualRatios = {
    hip: 1.0,
    knee: ranges.knee / ranges.hip,
    shoulder: ranges.shoulder / ranges.hip,
    elbow: ranges.elbow / ranges.hip,
    wrist: ranges.wrist / ranges.hip,
  }
  
  // 计算各关节的效率得分
  const jointScores: number[] = []
  for (const [joint, actualRatio] of Object.entries(actualRatios)) {
    if (joint === 'hip') continue
    const idealRatio = idealRatios[joint as keyof typeof idealRatios]
    const diff = Math.abs(actualRatio - idealRatio)
    const score = Math.max(0, 100 - (diff * 100))
    jointScores.push(score)
  }
  
  // 综合效率得分
  const efficiency = mean(jointScores) / 100
  const score = mean(jointScores)
  
  return { score, efficiency }
}

/**
 * 找到角度开始加速的位置
 * 
 * 通过分析角度变化率找到动作加速的起始点
 * 
 * @param angles 角度数组
 * @returns 加速开始的索引
 */
function findAccelerationStart(angles: number[]): number {
  if (angles.length < 5) return 0
  
  // 计算角度变化率
  const velocities: number[] = []
  for (let i = 1; i < angles.length; i++) {
    velocities.push(Math.abs(angles[i] - angles[i - 1]))
  }
  
  // 找到变化率首次超过平均值的点
  const avgVelocity = mean(velocities)
  for (let i = 0; i < velocities.length; i++) {
    if (velocities[i] > avgVelocity * 1.5) {
      return i
    }
  }
  
  return 0
}

/**
 * 找到最大速度的位置
 * 
 * @param angles 角度数组
 * @returns 最大速度索引
 */
function findMaxVelocityIndex(angles: number[]): number {
  if (angles.length < 3) return 0
  
  const velocities: number[] = []
  for (let i = 1; i < angles.length; i++) {
    velocities.push(Math.abs(angles[i] - angles[i - 1]))
  }
  
  let maxIndex = 0
  let maxVelocity = velocities[0]
  
  for (let i = 1; i < velocities.length; i++) {
    if (velocities[i] > maxVelocity) {
      maxVelocity = velocities[i]
      maxIndex = i
    }
  }
  
  return maxIndex
}

/**
 * 检测主导侧
 */
function detectDominantSide(jointAngles: Map<string, any>): 'left' | 'right' {
  const leftWrist = jointAngles.get('left_wrist' as JointType)
  const rightWrist = jointAngles.get('right_wrist' as JointType)
  
  if (!leftWrist || !rightWrist) return 'right'
  
  const leftRange = leftWrist.max - leftWrist.min
  const rightRange = rightWrist.max - rightWrist.min
  
  return rightRange > leftRange ? 'right' : 'left'
}

/**
 * 创建空动力链分析结果
 */
function createEmptyKineticChainAnalysis(): KineticChainAnalysis {
  return {
    score: 50,
    force_transfer_efficiency: 0.5,
    sequence_score: 50,
    timing_score: 50,
    phases: {
      hip_initiation: false,
      knee_follow_through: false,
      elbow_extension: false,
      wrist_snap: false,
    },
  }
}

/**
 * 生成动力链改进建议
 */
export function generateKineticChainRecommendations(analysis: KineticChainAnalysis): string[] {
  const recommendations: string[] = []
  
  if (!analysis.phases.hip_initiation) {
    recommendations.push(
      '髋部启动不明显，建议加强下肢发力意识，投篮时主动用髋部带动身体上升。推荐练习：髋部主导深蹲跳。'
    )
  }
  
  if (!analysis.phases.knee_follow_through) {
    recommendations.push(
      '膝部跟随不充分，髋部启动后膝盖应自然伸展传递力量。推荐练习：连续蹲跳，感受膝部伸展节奏。'
    )
  }
  
  if (!analysis.phases.elbow_extension) {
    recommendations.push(
      '肘部伸展时机不当，应在身体上升最高点时完成伸展。推荐练习：墙壁出手练习，固定肘部伸展时机。'
    )
  }
  
  if (!analysis.phases.wrist_snap) {
    recommendations.push(
      '手腕下压时机需调整，应在肘部完全伸展后立即下压。推荐练习：近距离压腕练习，建立正确时机。'
    )
  }
  
  if (analysis.force_transfer_efficiency < 0.6) {
    recommendations.push(
      `动力链传递效率偏低（${(analysis.force_transfer_efficiency * 100).toFixed(0)}%），建议进行全身协调训练，确保力量从下肢到上肢的流畅传递。`
    )
  }
  
  if (analysis.score >= 75) {
    recommendations.push(
      '动力链协调性优秀！发力顺序正确，力量传递高效，这是远距离投篮的关键。'
    )
  }
  
  return recommendations
}
