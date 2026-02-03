/**
 * Coordination Analysis - 动作协调性分析
 * 
 * 分析关节间的同步性和协调性
 * 计算关节同步系数（0-1），1表示完美同步
 */

import type { PoseSequence, CoordinationAnalysis, JointAngleSeries, JointType } from '@/types/analysis'
import { calculateAllJointAngles } from '../angle-calculator'
import { correlation, mean, standardDeviation } from '../math-utils'

// 协调性评估配置
const COORDINATION_CONFIG = {
  // 协调性权重
  weights: {
    hip_knee: 0.5,      // 髋膝协调（下肢动力链）
    elbow_wrist: 0.5,   // 肘腕协调（上肢释放）
  },
  
  // 理想延迟（帧数）
  idealDelay: {
    hip_to_knee: 0,     // 髋膝同步
    elbow_to_wrist: 1,  // 肘伸展后手腕释放，延迟1帧
  },
  
  // 相关性阈值
  minCorrelation: 0.5,
}

/**
 * 分析动作协调性
 * 
 * @param sequence MediaPipe姿态序列
 * @returns 协调性分析结果
 */
export function analyzeCoordination(sequence: PoseSequence): CoordinationAnalysis {
  // 计算所有关节角度
  const allJointAngles = calculateAllJointAngles(sequence)
  const dominantSide = detectDominantSide(allJointAngles)
  
  // 髋膝协调性
  const hipKneeCoord = calculateHipKneeCoordination(allJointAngles, dominantSide)
  
  // 肘腕协调性
  const elbowWristCoord = calculateElbowWristCoordination(allJointAngles, dominantSide)
  
  // 计算整体同步系数
  const syncCoefficient = calculateSyncCoefficient(allJointAngles, dominantSide)
  
  // 综合评分
  const totalScore = Math.round(
    hipKneeCoord * COORDINATION_CONFIG.weights.hip_knee +
    elbowWristCoord * COORDINATION_CONFIG.weights.elbow_wrist
  )
  
  return {
    score: totalScore,
    joint_sync_coefficient: Math.round(syncCoefficient * 100) / 100,
    hip_knee_coordination: Math.round(hipKneeCoord),
    elbow_wrist_coordination: Math.round(elbowWristCoord),
  }
}

/**
 * 计算髋膝协调性
 * 
 * 评估髋关节和膝关节动作的同步程度
 * 
 * @param jointAngles 所有关节角度
 * @param dominantSide 主导侧
 * @returns 0-100协调性得分
 */
function calculateHipKneeCoordination(
  jointAngles: Map<string, any>,
  dominantSide: 'left' | 'right'
): number {
  const hip = dominantSide === 'right'
    ? jointAngles.get('right_hip' as JointType)
    : jointAngles.get('left_hip' as JointType)
  
  const knee = dominantSide === 'right'
    ? jointAngles.get('right_knee' as JointType)
    : jointAngles.get('left_knee' as JointType)
  
  if (!hip || !knee || hip.angles.length < 5 || knee.angles.length < 5) {
    return 50
  }
  
  // 方法1：时序相关性
  const minLength = Math.min(hip.angles.length, knee.angles.length)
  const hipSlice = hip.angles.slice(0, minLength)
  const kneeSlice = knee.angles.slice(0, minLength)
  
  const corr = Math.abs(correlation(hipSlice, kneeSlice))
  
  // 方法2：动作范围比例
  const hipRange = hip.max - hip.min
  const kneeRange = knee.max - knee.min
  const rangeRatio = Math.min(hipRange, kneeRange) / Math.max(hipRange, kneeRange, 1)
  
  // 综合评分（相关性60%，动作范围比例40%）
  const score = corr * 60 + rangeRatio * 40
  
  return score
}

/**
 * 计算肘腕协调性
 * 
 * 评估肘关节伸展和手腕释放的时机配合
 * 
 * @param jointAngles 所有关节角度
 * @param dominantSide 主导侧
 * @returns 0-100协调性得分
 */
function calculateElbowWristCoordination(
  jointAngles: Map<string, any>,
  dominantSide: 'left' | 'right'
): number {
  const elbow = dominantSide === 'right'
    ? jointAngles.get('right_elbow' as JointType)
    : jointAngles.get('left_elbow' as JointType)
  
  const wrist = dominantSide === 'right'
    ? jointAngles.get('right_wrist' as JointType)
    : jointAngles.get('left_wrist' as JointType)
  
  if (!elbow || !wrist || elbow.angles.length < 5 || wrist.angles.length < 5) {
    return 50
  }
  
  // 找到肘关节最大角度（最伸展）的位置
  const maxElbowIndex = elbow.angles.indexOf(Math.max(...elbow.angles))
  
  // 找到手腕最大角度（释放）的位置
  const maxWristIndex = wrist.angles.indexOf(Math.max(...wrist.angles))
  
  // 理想情况：肘关节完全伸展后，手腕立即释放（延迟1-2帧）
  const idealDelay = COORDINATION_CONFIG.idealDelay.elbow_to_wrist
  const actualDelay = Math.abs(maxWristIndex - maxElbowIndex)
  const delayDiff = Math.abs(actualDelay - idealDelay)
  
  // 时机得分（延迟差异越小越好）
  const timingScore = Math.max(0, 100 - (delayDiff * 20))
  
  // 流畅度得分（通过相关性评估）
  const minLength = Math.min(elbow.angles.length, wrist.angles.length)
  const elbowSlice = elbow.angles.slice(0, minLength)
  const wristSlice = wrist.angles.slice(0, minLength)
  
  const corr = Math.abs(correlation(elbowSlice, wristSlice))
  const flowScore = corr * 100
  
  // 综合评分（时机50%，流畅度50%）
  return timingScore * 0.5 + flowScore * 0.5
}

/**
 * 计算整体关节同步系数
 * 
 * 评估所有关键关节的同步程度
 * 
 * @param jointAngles 所有关节角度
 * @param dominantSide 主导侧
 * @returns 0-1同步系数
 */
function calculateSyncCoefficient(
  jointAngles: Map<string, any>,
  dominantSide: 'left' | 'right'
): number {
  const keyJoints = dominantSide === 'right'
    ? ['right_hip', 'right_knee', 'right_shoulder', 'right_elbow', 'right_wrist']
    : ['left_hip', 'left_knee', 'left_shoulder', 'left_elbow', 'left_wrist']
  
  const correlations: number[] = []
  
  // 计算相邻关节的相关性
  for (let i = 0; i < keyJoints.length - 1; i++) {
    const joint1 = jointAngles.get(keyJoints[i])
    const joint2 = jointAngles.get(keyJoints[i + 1])
    
    if (joint1 && joint2 && joint1.angles.length > 5 && joint2.angles.length > 5) {
      const minLength = Math.min(joint1.angles.length, joint2.angles.length)
      const corr = Math.abs(correlation(
        joint1.angles.slice(0, minLength),
        joint2.angles.slice(0, minLength)
      ))
      correlations.push(corr)
    }
  }
  
  if (correlations.length === 0) return 0.5
  
  // 平均相关性作为同步系数
  return mean(correlations)
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
 * 生成协调性改进建议
 */
export function generateCoordinationRecommendations(analysis: CoordinationAnalysis): string[] {
  const recommendations: string[] = []
  
  if (analysis.joint_sync_coefficient < 0.6) {
    recommendations.push(
      `关节同步性不足（系数${analysis.joint_sync_coefficient.toFixed(2)}），建议练习全身协调动作，感受力量从下肢到上肢的传递链。`
    )
  }
  
  if (analysis.hip_knee_coordination < 60) {
    recommendations.push(
      `髋膝协调性需改善（${analysis.hip_knee_coordination}分），下蹲时髋部和膝盖应同步屈曲，避免仅屈膝不屈髋。推荐练习：同步深蹲。`
    )
  }
  
  if (analysis.elbow_wrist_coordination < 60) {
    recommendations.push(
      `肘腕协调性需加强（${analysis.elbow_wrist_coordination}分），肘部伸展和手腕下压应流畅衔接。推荐练习：近距离无球模拟出手。`
    )
  }
  
  if (analysis.score >= 75) {
    recommendations.push(
      '动作协调性优秀！各关节配合流畅，动力链传递高效。'
    )
  }
  
  return recommendations
}
