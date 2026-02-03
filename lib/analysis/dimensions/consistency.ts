/**
 * Consistency Analysis - 一致性分析（核心维度）
 * 
 * 根据 Slegers et al. (2021) 研究：
 * 动作一致性是命中率的最强预测因子（r=-0.96）
 * 
 * 计算膝关节、肘关节、腕关节角度的波动范围（标准差）
 */

import type { PoseSequence, JointType, JointAngleSeries, ConsistencyAnalysis } from '@/types/analysis'
import type { ErrorMargin } from '@/types/analysis'
import { calculateAllJointAngles, getJointDefinition } from '../angle-calculator'
import { standardDeviation, mean } from '../math-utils'

// 一致性评估配置
const CONSISTENCY_CONFIG = {
  // 标准差阈值（角度）
  kneeThreshold: 8,      // 膝关节一致性阈值
  elbowThreshold: 6,     // 肘关节一致性阈值
  wristThreshold: 4,     // 腕关节一致性阈值
  
  // 评分权重
  weights: {
    knee: 0.35,      // 下肢稳定性重要
    elbow: 0.35,     // 出手轨迹重要
    wrist: 0.30,     // 最后释放重要
  },
  
  // 最优一致性范围（变异系数 CV）
  optimalCV: 0.05,   // 5%变异系数为最优
  maxAcceptableCV: 0.15,  // 15%为可接受上限
}

/**
 * 分析动作一致性
 * 
 * @param sequence MediaPipe姿态序列
 * @param cameraAngle 拍摄角度（影响误差范围）
 * @returns 一致性分析结果
 */
export function analyzeConsistency(
  sequence: PoseSequence,
  cameraAngle: 'side' | 'front' | 'other'
): ConsistencyAnalysis {
  // 计算所有关节角度序列
  const allJointAngles = calculateAllJointAngles(sequence)
  
  // 获取主导手
  const dominantSide = detectDominantSide(allJointAngles)
  
  // 提取关键关节的角度序列
  const dominantKnee = dominantSide === 'right' 
    ? allJointAngles.get('right_knee' as JointType)
    : allJointAngles.get('left_knee' as JointType)
  
  const dominantElbow = dominantSide === 'right'
    ? allJointAngles.get('right_elbow' as JointType)
    : allJointAngles.get('left_elbow' as JointType)
  
  const dominantWrist = dominantSide === 'right'
    ? allJointAngles.get('right_wrist' as JointType)
    : allJointAngles.get('left_wrist' as JointType)
  
  // 计算标准差
  const kneeStd = dominantKnee?.std_dev || 0
  const elbowStd = dominantElbow?.std_dev || 0
  const wristStd = dominantWrist?.std_dev || 0
  
  // 计算变异系数（CV = 标准差/平均值）
  const kneeCV = dominantKnee ? kneeStd / dominantKnee.mean : 0
  const elbowCV = dominantElbow ? elbowStd / dominantElbow.mean : 0
  const wristCV = dominantWrist ? wristStd / dominantWrist.mean : 0
  
  // 计算各项得分（0-100）
  const kneeScore = calculateConsistencyScore(kneeCV, CONSISTENCY_CONFIG.optimalCV, CONSISTENCY_CONFIG.maxAcceptableCV)
  const elbowScore = calculateConsistencyScore(elbowCV, CONSISTENCY_CONFIG.optimalCV, CONSISTENCY_CONFIG.maxAcceptableCV)
  const wristScore = calculateConsistencyScore(wristCV, CONSISTENCY_CONFIG.optimalCV, CONSISTENCY_CONFIG.maxAcceptableCV)
  
  // 加权总分
  const totalScore = Math.round(
    kneeScore * CONSISTENCY_CONFIG.weights.knee +
    elbowScore * CONSISTENCY_CONFIG.weights.elbow +
    wristScore * CONSISTENCY_CONFIG.weights.wrist
  )
  
  // 确定一致性等级
  const avgCV = (kneeCV + elbowCV + wristCV) / 3
  let overallConsistency: 'high' | 'medium' | 'low'
  if (avgCV <= 0.08) {
    overallConsistency = 'high'
  } else if (avgCV <= 0.15) {
    overallConsistency = 'medium'
  } else {
    overallConsistency = 'low'
  }
  
  // 计算误差范围
  const errorMargin = calculateErrorMargin(cameraAngle)
  
  return {
    score: totalScore,
    knee_angle_std: Math.round(kneeStd * 10) / 10,
    elbow_angle_std: Math.round(elbowStd * 10) / 10,
    wrist_angle_std: Math.round(wristStd * 10) / 10,
    overall_consistency: overallConsistency,
    error_margin: errorMargin,
    details: {
      knee_angles: dominantKnee?.angles || [],
      elbow_angles: dominantElbow?.angles || [],
      wrist_angles: dominantWrist?.angles || [],
    },
  }
}

/**
 * 计算一致性得分
 * 
 * 使用线性插值将变异系数映射到0-100分
 * 
 * @param cv 变异系数
 * @param optimal 最优CV值
 * @param maxAcceptable 最大可接受CV值
 * @returns 0-100的得分
 */
function calculateConsistencyScore(cv: number, optimal: number, maxAcceptable: number): number {
  if (cv <= optimal) {
    // 优于最优值，给满分
    return 100
  }
  
  if (cv >= maxAcceptable) {
    // 超过最大可接受值，给0分
    return 0
  }
  
  // 线性插值
  const score = 100 - ((cv - optimal) / (maxAcceptable - optimal)) * 100
  return Math.max(0, Math.min(100, Math.round(score)))
}

/**
 * 检测主导侧（哪只手投篮）
 * 
 * 通过比较手腕活动范围判断
 * 
 * @param jointAngles 所有关节角度序列
 * @returns 'left' | 'right'
 */
function detectDominantSide(jointAngles: Map<JointType, JointAngleSeries>): 'left' | 'right' {
  const leftWrist = jointAngles.get('left_wrist' as JointType)
  const rightWrist = jointAngles.get('right_wrist' as JointType)
  
  if (!leftWrist || !rightWrist) return 'right'
  
  // 计算活动范围
  const leftRange = leftWrist.max - leftWrist.min
  const rightRange = rightWrist.max - rightWrist.min
  
  return rightRange > leftRange ? 'right' : 'left'
}

/**
 * 计算误差范围
 * 
 * 根据拍摄角度确定误差范围
 * 
 * @param cameraAngle 拍摄角度
 * @returns 误差范围对象
 */
function calculateErrorMargin(cameraAngle: 'side' | 'front' | 'other'): ErrorMargin {
  const errorValues = {
    side: 15,
    front: 20,
    other: 25,
  }
  
  const conditions = {
    side: '侧面视角，全身可见',
    front: '正面视角，对称性较好',
    other: '其他角度，深度信息受限',
  }
  
  return {
    value: errorValues[cameraAngle],
    unit: 'degrees',
    condition: conditions[cameraAngle],
  }
}

/**
 * 生成一致性改进建议
 * 
 * @param analysis 一致性分析结果
 * @returns 改进建议数组
 */
export function generateConsistencyRecommendations(analysis: ConsistencyAnalysis): string[] {
  const recommendations: string[] = []
  
  if (analysis.knee_angle_std > CONSISTENCY_CONFIG.kneeThreshold) {
    recommendations.push(
      `膝关节一致性较差（标准差±${analysis.knee_angle_std.toFixed(1)}°），建议进行基础力量训练，增强下肢稳定性`
    )
  }
  
  if (analysis.elbow_angle_std > CONSISTENCY_CONFIG.elbowThreshold) {
    recommendations.push(
      `肘关节轨迹不稳定（标准差±${analysis.elbow_angle_std.toFixed(1)}°），建议练习固定点出手，减少手臂摆动`
    )
  }
  
  if (analysis.wrist_angle_std > CONSISTENCY_CONFIG.wristThreshold) {
    recommendations.push(
      `手腕释放点不一致（标准差±${analysis.wrist_angle_std.toFixed(1)}°），建议加强手腕柔韧性训练和标准化出手动作`
    )
  }
  
  if (analysis.overall_consistency === 'high') {
    recommendations.push(
      '动作一致性优秀！建议保持当前训练节奏，并通过增加训练强度来提升命中率'
    )
  }
  
  return recommendations
}
