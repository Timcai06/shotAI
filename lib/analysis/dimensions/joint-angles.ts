/**
 * Joint Angles Analysis - 关节角度分析
 * 
 * 分析各关节角度是否在最优范围内
 * 计算各关节与最优角度的偏差
 */

import type { PoseSequence, JointAnglesAnalysis, JointType } from '@/types/analysis'
import type { ErrorMargin } from '@/types/analysis'
import { calculateAllJointAngles, getJointDefinition } from '../angle-calculator'
import { mean, standardDeviation } from '../math-utils'

// 职业球员关节角度参考数据
// 基于研究文献的统计数据
const OPTIMAL_ANGLES: Record<JointType, { min: number; max: number; target: number }> = {
  'left_knee': { min: 100, max: 140, target: 120 },
  'right_knee': { min: 100, max: 140, target: 120 },
  'left_hip': { min: 80, max: 120, target: 100 },
  'right_hip': { min: 80, max: 120, target: 100 },
  'left_shoulder': { min: 70, max: 110, target: 90 },
  'right_shoulder': { min: 70, max: 110, target: 90 },
  'left_elbow': { min: 140, max: 180, target: 165 },
  'right_elbow': { min: 140, max: 180, target: 165 },
  'left_wrist': { min: 150, max: 180, target: 170 },
  'right_wrist': { min: 150, max: 180, target: 170 },
}

// 评分权重（主导侧权重更高）
const JOINT_WEIGHTS = {
  knee: 0.25,      // 下肢稳定性
  hip: 0.15,       // 核心力量
  shoulder: 0.20,  // 上肢起始
  elbow: 0.25,     // 出手关键
  wrist: 0.15,     // 最后释放
}

/**
 * 分析关节角度
 * 
 * @param sequence MediaPipe姿态序列
 * @param cameraAngle 拍摄角度
 * @returns 关节角度分析结果
 */
export function analyzeJointAngles(
  sequence: PoseSequence,
  cameraAngle: 'side' | 'front' | 'other'
): JointAnglesAnalysis {
  // 计算所有关节角度
  const allJointAngles = calculateAllJointAngles(sequence)
  const dominantSide = detectDominantSide(allJointAngles)
  
  // 分析各关节
  const jointAnalysis: JointAnglesAnalysis['angles'] = {} as any
  let totalScore = 0
  let totalWeight = 0
  
  for (const [jointType, series] of Array.from(allJointAngles.entries())) {
    if (series.angles.length === 0) continue
    
    const optimal = OPTIMAL_ANGLES[jointType as JointType]
    if (!optimal) continue
    
    const isDominant = jointType.includes(dominantSide)
    const weight = isDominant ? 1.5 : 1.0  // 主导侧权重更高
    
    // 计算关节得分
    const jointScore = calculateJointScore(series.mean, optimal)
    
    jointAnalysis[jointType as JointType] = {
      mean: Math.round(series.mean * 10) / 10,
      min: Math.round(series.min * 10) / 10,
      max: Math.round(series.max * 10) / 10,
      optimal_range: [optimal.min, optimal.max],
      deviation_from_optimal: Math.round((series.mean - optimal.target) * 10) / 10,
    }
    
    // 根据关节类型加权
    const jointWeight = getJointWeight(jointType) * weight
    totalScore += jointScore * jointWeight
    totalWeight += jointWeight
  }
  
  // 归一化总分
  const finalScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 50
  
  // 计算误差范围
  const errorMargin = calculateErrorMargin(cameraAngle)
  
  return {
    score: finalScore,
    angles: jointAnalysis,
    error_margin: errorMargin,
  }
}

/**
 * 计算单个关节的得分
 * 
 * @param actualAngle 实际平均角度
 * @param optimal 最优角度范围
 * @returns 0-100得分
 */
function calculateJointScore(
  actualAngle: number,
  optimal: { min: number; max: number; target: number }
): number {
  // 在最优范围内，给满分
  if (actualAngle >= optimal.min && actualAngle <= optimal.max) {
    return 100
  }
  
  // 计算与最优范围的偏差
  let deviation: number
  if (actualAngle < optimal.min) {
    deviation = optimal.min - actualAngle
  } else {
    deviation = actualAngle - optimal.max
  }
  
  // 允许的最大偏差（超出此范围得0分）
  const maxDeviation = 30
  
  // 线性插值
  const score = Math.max(0, 100 - (deviation / maxDeviation) * 100)
  return Math.round(score)
}

/**
 * 获取关节权重
 * 
 * @param jointType 关节类型
 * @returns 权重值
 */
function getJointWeight(jointType: string): number {
  if (jointType.includes('knee')) return JOINT_WEIGHTS.knee
  if (jointType.includes('hip')) return JOINT_WEIGHTS.hip
  if (jointType.includes('shoulder')) return JOINT_WEIGHTS.shoulder
  if (jointType.includes('elbow')) return JOINT_WEIGHTS.elbow
  if (jointType.includes('wrist')) return JOINT_WEIGHTS.wrist
  return 0.1
}

/**
 * 检测主导侧
 * 
 * @param jointAngles 所有关节角度
 * @returns 'left' | 'right'
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
 * 计算误差范围
 * 
 * @param cameraAngle 拍摄角度
 * @returns 误差范围对象
 */
function calculateErrorMargin(cameraAngle: 'side' | 'front' | 'other'): ErrorMargin {
  const errorValues = {
    side: 15,    // 侧面视角误差最小
    front: 20,   // 正面视角
    other: 25,   // 其他角度误差最大
  }
  
  const conditions = {
    side: '侧面视角，关节角度最准确',
    front: '正面视角，深度信息受限',
    other: '其他角度，测量误差较大',
  }
  
  return {
    value: errorValues[cameraAngle],
    unit: 'degrees',
    condition: conditions[cameraAngle],
  }
}

/**
 * 生成关节角度改进建议
 * 
 * @param analysis 关节角度分析结果
 * @returns 改进建议数组
 */
export function generateJointAngleRecommendations(analysis: JointAnglesAnalysis): string[] {
  const recommendations: string[] = []
  
  for (const [joint, data] of Object.entries(analysis.angles)) {
    const deviation = data.deviation_from_optimal
    const jointName = getJointName(joint)
    
    if (Math.abs(deviation) > 15) {
      const direction = deviation > 0 ? '过大' : '过小'
      recommendations.push(
        `${jointName}角度${direction}（偏差${Math.abs(deviation).toFixed(1)}°），建议调整至${data.optimal_range[0]}-${data.optimal_range[1]}°范围`
      )
    }
  }
  
  if (analysis.score >= 80) {
    recommendations.push(
      '关节角度整体良好，各关节活动范围合理，建议保持当前投篮姿势'
    )
  }
  
  return recommendations
}

/**
 * 获取关节中文名称
 */
function getJointName(jointType: string): string {
  const names: Record<string, string> = {
    'left_knee': '左膝关节',
    'right_knee': '右膝关节',
    'left_hip': '左髋关节',
    'right_hip': '右髋关节',
    'left_shoulder': '左肩关节',
    'right_shoulder': '右肩关节',
    'left_elbow': '左肘关节',
    'right_elbow': '右肘关节',
    'left_wrist': '左腕关节',
    'right_wrist': '右腕关节',
  }
  return names[jointType] || jointType
}
