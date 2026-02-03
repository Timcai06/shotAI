/**
 * Stability Analysis - 稳定性分析
 * 
 * 分析下肢基础稳定性和上肢控制稳定性
 * 稳定性是投篮一致性的基础
 */

import type { PoseSequence, StabilityAnalysis, JointType } from '@/types/analysis'
import { calculateAllJointAngles } from '../angle-calculator'
import { standardDeviation, mean, coefficientOfVariation } from '../math-utils'

// 稳定性评估配置
const STABILITY_CONFIG = {
  // 评分权重
  weights: {
    base: 0.4,        // 下肢稳定性
    upper_body: 0.35, // 上肢稳定性
    release_point: 0.25, // 出手点一致性
  },
  
  // 稳定性阈值（标准差）
  thresholds: {
    ankle: 3,      // 脚踝晃动阈值（度）
    hip: 4,        // 髋部晃动阈值
    shoulder: 5,   // 肩部晃动阈值
    wrist: 2,      // 手腕释放点阈值
  },
}

/**
 * 分析投篮稳定性
 * 
 * @param sequence MediaPipe姿态序列
 * @returns 稳定性分析结果
 */
export function analyzeStability(sequence: PoseSequence): StabilityAnalysis {
  // 计算所有关节角度
  const allJointAngles = calculateAllJointAngles(sequence)
  const dominantSide = detectDominantSide(allJointAngles)
  
  // 下肢稳定性
  const baseStability = calculateBaseStability(allJointAngles, sequence)
  
  // 上肢稳定性
  const upperBodyStability = calculateUpperBodyStability(allJointAngles, dominantSide)
  
  // 出手点一致性
  const releasePointConsistency = calculateReleasePointConsistency(allJointAngles, dominantSide)
  
  // 综合评分
  const totalScore = Math.round(
    baseStability * STABILITY_CONFIG.weights.base +
    upperBodyStability * STABILITY_CONFIG.weights.upper_body +
    releasePointConsistency * STABILITY_CONFIG.weights.release_point
  )
  
  return {
    score: totalScore,
    base_stability: Math.round(baseStability),
    upper_body_stability: Math.round(upperBodyStability),
    release_point_consistency: Math.round(releasePointConsistency),
  }
}

/**
 * 计算下肢基础稳定性
 * 
 * 通过脚踝、膝盖、髋部的晃动程度评估
 * 
 * @param jointAngles 所有关节角度
 * @param sequence 姿态序列
 * @returns 0-100稳定性得分
 */
function calculateBaseStability(
  jointAngles: Map<string, any>,
  sequence: PoseSequence
): number {
  // 获取左右膝关节
  const leftKnee = jointAngles.get('left_knee' as JointType)
  const rightKnee = jointAngles.get('right_knee' as JointType)
  
  // 计算左右平衡度
  let balanceScore = 100
  if (leftKnee && rightKnee) {
    const leftStd = leftKnee.std_dev
    const rightStd = rightKnee.std_dev
    const balance = 1 - Math.abs(leftStd - rightStd) / Math.max(leftStd + rightStd, 0.1)
    balanceScore = balance * 100
  }
  
  // 计算下肢晃动程度
  let movementScore = 100
  if (leftKnee && rightKnee) {
    const avgStd = (leftKnee.std_dev + rightKnee.std_dev) / 2
    // 标准差 < 5度为优秀，> 15度为差
    movementScore = Math.max(0, 100 - ((avgStd - 5) / 10) * 100)
  }
  
  // 综合评分（平衡度40%，晃动程度60%）
  return balanceScore * 0.4 + movementScore * 0.6
}

/**
 * 计算上肢稳定性
 * 
 * 通过肩部晃动程度评估
 * 
 * @param jointAngles 所有关节角度
 * @param dominantSide 主导侧
 * @returns 0-100稳定性得分
 */
function calculateUpperBodyStability(
  jointAngles: Map<string, any>,
  dominantSide: 'left' | 'right'
): number {
  const shoulder = dominantSide === 'right'
    ? jointAngles.get('right_shoulder' as JointType)
    : jointAngles.get('left_shoulder' as JointType)
  
  if (!shoulder) return 50
  
  // 肩部晃动标准差
  const shoulderStd = shoulder.std_dev
  
  // 标准差 < 3度为优秀，> 10度为差
  const score = Math.max(0, 100 - ((shoulderStd - 3) / 7) * 100)
  
  return score
}

/**
 * 计算出手点一致性
 * 
 * 通过手腕释放时的角度一致性评估
 * 
 * @param jointAngles 所有关节角度
 * @param dominantSide 主导侧
 * @returns 0-100一致性得分
 */
function calculateReleasePointConsistency(
  jointAngles: Map<string, any>,
  dominantSide: 'left' | 'right'
): number {
  const wrist = dominantSide === 'right'
    ? jointAngles.get('right_wrist' as JointType)
    : jointAngles.get('left_wrist' as JointType)
  
  if (!wrist || wrist.angles.length < 3) return 50
  
  // 找到出手点附近的角度（手腕角度最大的区域）
  const maxAngleIndex = wrist.angles.indexOf(Math.max(...wrist.angles))
  
  // 取出手点前后各2帧，计算释放阶段的一致性
  const startIdx = Math.max(0, maxAngleIndex - 2)
  const endIdx = Math.min(wrist.angles.length - 1, maxAngleIndex + 2)
  
  const releaseAngles = wrist.angles.slice(startIdx, endIdx + 1)
  
  // 计算释放阶段的标准差
  const releaseStd = standardDeviation(releaseAngles)
  
  // 标准差 < 2度为优秀，> 8度为差
  const score = Math.max(0, 100 - ((releaseStd - 2) / 6) * 100)
  
  return score
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
 * 生成稳定性改进建议
 */
export function generateStabilityRecommendations(analysis: StabilityAnalysis): string[] {
  const recommendations: string[] = []
  
  if (analysis.base_stability < 60) {
    recommendations.push(
      `下肢基础稳定性不足（${analysis.base_stability}分），建议加强核心力量训练，提升平衡能力。推荐练习：单脚站立、深蹲。`
    )
  }
  
  if (analysis.upper_body_stability < 60) {
    recommendations.push(
      `上肢控制稳定性需改善（${analysis.upper_body_stability}分），投篮时保持肩部稳定，避免耸肩或晃动。推荐练习：墙壁俯卧撑保持。`
    )
  }
  
  if (analysis.release_point_consistency < 65) {
    recommendations.push(
      `出手点一致性较差（${analysis.release_point_consistency}分），建议固定出手点位置，建立肌肉记忆。推荐练习：定点投篮练习。`
    )
  }
  
  if (analysis.score >= 75) {
    recommendations.push(
      '稳定性表现优秀！这是高质量投篮的基础，继续保持并尝试增加投篮距离。'
    )
  }
  
  return recommendations
}
