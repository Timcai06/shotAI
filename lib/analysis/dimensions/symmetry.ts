/**
 * Symmetry Analysis - 对称性分析
 * 
 * 分析左右侧身体的对称性
 * 投篮动作的理想状态是左右协调但不必完全对称
 */

import type { PoseSequence, JointAngleSeries, SymmetryAnalysis } from '@/types/analysis'
import type { ErrorMargin, JointType } from '@/types/analysis'
import { calculateAllJointAngles } from '../angle-calculator'
import { correlation, mean, standardDeviation } from '../math-utils'

// 对称性评估配置
const SYMMETRY_CONFIG = {
  // 对称性权重
  weights: {
    knee: 0.30,      // 下肢稳定性
    elbow: 0.30,     // 上肢对称
    shoulder: 0.40,  // 肩部对齐重要
  },
  
  // 可接受的角度差异范围
  acceptableDiff: {
    knee: 15,     // 膝关节可接受±15°差异
    elbow: 10,    // 肘关节可接受±10°差异
    shoulder: 8,  // 肩关节可接受±8°差异
  },
}

/**
 * 分析身体对称性
 * 
 * @param sequence MediaPipe姿态序列
 * @param cameraAngle 拍摄角度
 * @returns 对称性分析结果
 */
export function analyzeSymmetry(
  sequence: PoseSequence,
  cameraAngle: 'side' | 'front' | 'other'
): SymmetryAnalysis {
  // 计算所有关节角度
  const allJointAngles = calculateAllJointAngles(sequence)
  
  // 获取左右关节对
  const leftKnee = allJointAngles.get('left_knee' as JointType)
  const rightKnee = allJointAngles.get('right_knee' as JointType)
  const leftElbow = allJointAngles.get('left_elbow' as JointType)
  const rightElbow = allJointAngles.get('right_elbow' as JointType)
  const leftShoulder = allJointAngles.get('left_shoulder' as JointType)
  const rightShoulder = allJointAngles.get('right_shoulder' as JointType)
  
  // 计算各项对称性得分
  const kneeSymmetry = calculatePairSymmetry(leftKnee, rightKnee, SYMMETRY_CONFIG.acceptableDiff.knee)
  const elbowSymmetry = calculatePairSymmetry(leftElbow, rightElbow, SYMMETRY_CONFIG.acceptableDiff.elbow)
  const shoulderSymmetry = calculatePairSymmetry(leftShoulder, rightShoulder, SYMMETRY_CONFIG.acceptableDiff.shoulder)
  
  // 计算左右平衡度（基于相关系数）
  const balanceScores: number[] = []
  
  // 膝关节平衡
  if (leftKnee && rightKnee && leftKnee.angles.length > 0 && rightKnee.angles.length > 0) {
    const kneeCorr = correlation(leftKnee.angles.slice(0, rightKnee.angles.length), rightKnee.angles)
    balanceScores.push(Math.abs(kneeCorr) * 100)
  }
  
  // 肘关节平衡
  if (leftElbow && rightElbow && leftElbow.angles.length > 0 && rightElbow.angles.length > 0) {
    const elbowCorr = correlation(leftElbow.angles.slice(0, rightElbow.angles.length), rightElbow.angles)
    balanceScores.push(Math.abs(elbowCorr) * 100)
  }
  
  // 计算总平衡度
  const leftRightBalance = balanceScores.length > 0
    ? Math.round(mean(balanceScores))
    : 50
  
  // 加权总分
  const totalScore = Math.round(
    kneeSymmetry * SYMMETRY_CONFIG.weights.knee +
    elbowSymmetry * SYMMETRY_CONFIG.weights.elbow +
    shoulderSymmetry * SYMMETRY_CONFIG.weights.shoulder
  )
  
  // 计算误差范围
  const errorMargin = calculateErrorMargin(cameraAngle)
  
  return {
    score: totalScore,
    left_right_balance: leftRightBalance,
    knee_symmetry: Math.round(kneeSymmetry),
    elbow_symmetry: Math.round(elbowSymmetry),
    shoulder_symmetry: Math.round(shoulderSymmetry),
    error_margin: errorMargin,
  }
}

/**
 * 计算一对关节的对称性得分
 * 
 * @param left 左侧关节数据
 * @param right 右侧关节数据
 * @param acceptableDiff 可接受的最大角度差异
 * @returns 0-100的对称性得分
 */
function calculatePairSymmetry(
  left: JointAngleSeries | undefined,
  right: JointAngleSeries | undefined,
  acceptableDiff: number
): number {
  if (!left || !right) return 50  // 数据缺失，给中等分数
  
  // 方法1：比较平均角度差异
  const meanDiff = Math.abs(left.mean - right.mean)
  
  // 方法2：比较标准差差异（动作范围）
  const rangeDiff = Math.abs((left.max - left.min) - (right.max - right.min))
  
  // 方法3：时序相关性
  const minLength = Math.min(left.angles.length, right.angles.length)
  let correlation = 0
  if (minLength > 5) {
    const leftSlice = left.angles.slice(0, minLength)
    const rightSlice = right.angles.slice(0, minLength)
    correlation = Math.abs(calculatePairCorrelation(leftSlice, rightSlice))
  }
  
  // 综合评分
  // 平均角度差异权重：40%
  // 动作范围差异权重：30%
  // 时序相关性权重：30%
  
  const meanScore = Math.max(0, 100 - (meanDiff / acceptableDiff) * 100)
  const rangeScore = Math.max(0, 100 - (rangeDiff / acceptableDiff) * 100)
  const corrScore = correlation * 100
  
  return meanScore * 0.4 + rangeScore * 0.3 + corrScore * 0.3
}

/**
 * 计算两个序列的简单相关性
 * （简化版的Pearson相关系数）
 */
function calculatePairCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0
  
  const n = x.length
  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0)
  const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0)
  const sumY2 = y.reduce((acc, yi) => acc + yi * yi, 0)
  
  const numerator = n * sumXY - sumX * sumY
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))
  
  if (denominator === 0) return 0
  
  return numerator / denominator
}

/**
 * 计算误差范围
 */
function calculateErrorMargin(cameraAngle: 'side' | 'front' | 'other'): ErrorMargin {
  const errorValues = {
    side: 15,
    front: 15,  // 正面视角更适合对称性分析
    other: 20,
  }
  
  const conditions = {
    side: '侧面视角，深度信息受限',
    front: '正面视角，适合对称性评估',
    other: '其他角度，对称性评估不准确',
  }
  
  return {
    value: errorValues[cameraAngle],
    unit: 'degrees',
    condition: conditions[cameraAngle],
  }
}

/**
 * 生成对称性改进建议
 */
export function generateSymmetryRecommendations(analysis: SymmetryAnalysis): string[] {
  const recommendations: string[] = []
  
  if (analysis.knee_symmetry < 60) {
    recommendations.push(
      `下肢对称性较差（${analysis.knee_symmetry}分），建议加强非投篮侧腿部力量训练，提升整体稳定性`
    )
  }
  
  if (analysis.elbow_symmetry < 60) {
    recommendations.push(
      `上肢对称性需改善（${analysis.elbow_symmetry}分），投篮时辅助手臂应保持稳定，避免过度摆动`
    )
  }
  
  if (analysis.shoulder_symmetry < 70) {
    recommendations.push(
      `肩部对齐需要调整（${analysis.shoulder_symmetry}分），确保投篮时双肩水平，避免高低肩`
    )
  }
  
  if (analysis.left_right_balance < 60) {
    recommendations.push(
      `左右协调性不足（平衡度${analysis.left_right_balance}%），建议进行镜像练习，增强双侧协调`
    )
  }
  
  if (analysis.score >= 80) {
    recommendations.push(
      '身体对称性良好！保持目前的身体姿态，这是稳定投篮的重要基础'
    )
  }
  
  return recommendations
}
