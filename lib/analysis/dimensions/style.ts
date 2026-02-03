/**
 * Shooting Style Analysis - 投篮风格识别
 * 
 * 区分One-motion（一段式）和Two-motion（二段式）投篮
 * 
 * One-motion: 流畅连贯，从下蹲到出手一气呵成
 * Two-motion: 有停顿，到达出手点后停顿再出手
 */

import type { PoseSequence, ShootingStyleAnalysis, ShootingStyle, JointType } from '@/types/analysis'
import { calculateAllJointAngles, getJointDefinition } from '../angle-calculator'
import { findPeaks, findValleys, mean, standardDeviation } from '../math-utils'

// 风格识别配置
const STYLE_CONFIG = {
  // 停顿检测阈值
  pauseThreshold: 150,      // 毫秒，超过此值认为是停顿
  
  // 肘关节角度变化阈值
  oneMotionElbowChange: 30,   // 一段式肘关节总变化角度较小
  twoMotionElbowChange: 50,   // 二段式肘关节总变化角度较大
  
  // 出手时间占比
  oneMotionReleaseTimeRatio: 0.15,  // 一段式出手快
  twoMotionReleaseTimeRatio: 0.25,  // 二段式出手慢（停顿）
}

/**
 * 分析投篮风格
 * 
 * @param sequence MediaPipe姿态序列
 * @returns 投篮风格分析结果
 */
export function analyzeShootingStyle(sequence: PoseSequence): ShootingStyleAnalysis {
  // 计算主导侧肘关节角度变化
  const allJointAngles = calculateAllJointAngles(sequence)
  const dominantSide = detectDominantSide(allJointAngles)
  
  const dominantElbow = dominantSide === 'right'
    ? allJointAngles.get('right_elbow' as JointType)
    : allJointAngles.get('left_elbow' as JointType)
  
  const dominantWrist = dominantSide === 'right'
    ? allJointAngles.get('right_wrist' as JointType)
    : allJointAngles.get('left_wrist' as JointType)
  
  if (!dominantElbow || !dominantWrist) {
    return {
      style: 'hybrid' as ShootingStyle,
      confidence: 0.5,
      characteristics: {
        has_pause_at_set_point: false,
        release_smoothness: 0.5,
        elbow_extension_timing: 0,
      },
    }
  }
  
  // 分析特征
  const hasPause = detectPauseInMotion(sequence, dominantElbow.angles)
  const smoothness = calculateReleaseSmoothness(dominantWrist.angles)
  const timing = calculateElbowExtensionTiming(dominantElbow.angles, dominantWrist.angles)
  
  // 肘关节角度总变化
  const elbowRange = dominantElbow.max - dominantElbow.min
  
  // 计算出手时间占比
  const releaseDuration = calculateReleaseDuration(dominantWrist.angles, sequence.fps)
  const releaseRatio = releaseDuration / sequence.frames.length
  
  // 风格识别逻辑
  let style: ShootingStyle
  let confidence: number
  
  // 二段式特征
  if (hasPause && elbowRange > STYLE_CONFIG.twoMotionElbowChange * 0.8) {
    style = 'two_motion' as ShootingStyle
    // 置信度基于停顿明显程度
    confidence = Math.min(0.95, 0.6 + (smoothness < 0.5 ? 0.3 : 0))
  }
  // 一段式特征
  else if (!hasPause && smoothness > 0.7 && releaseRatio < STYLE_CONFIG.oneMotionReleaseTimeRatio * 1.5) {
    style = 'one_motion' as ShootingStyle
    confidence = Math.min(0.95, 0.7 + (smoothness > 0.8 ? 0.2 : 0))
  }
  // 混合型或无法明确识别
  else {
    style = 'hybrid' as ShootingStyle
    confidence = 0.6
  }
  
  return {
    style,
    confidence: Math.round(confidence * 100) / 100,
    characteristics: {
      has_pause_at_set_point: hasPause,
      release_smoothness: Math.round(smoothness * 100) / 100,
      elbow_extension_timing: Math.round(timing * 100) / 100,
    },
  }
}

/**
 * 检测动作中是否有停顿
 * 
 * 通过分析肘关节角度变化的平稳段来检测停顿
 * 
 * @param sequence 姿态序列
 * @param elbowAngles 肘关节角度数组
 * @returns 是否有停顿
 */
function detectPauseInMotion(sequence: PoseSequence, elbowAngles: number[]): boolean {
  if (elbowAngles.length < 10) return false
  
  // 寻找角度变化平缓的区域
  let consecutiveStableFrames = 0
  const stabilityThreshold = 2  // 角度变化小于2度认为是稳定
  const minPauseFrames = Math.max(3, Math.floor(sequence.fps * STYLE_CONFIG.pauseThreshold / 1000))
  
  for (let i = 1; i < elbowAngles.length; i++) {
    const change = Math.abs(elbowAngles[i] - elbowAngles[i - 1])
    
    if (change < stabilityThreshold) {
      consecutiveStableFrames++
      if (consecutiveStableFrames >= minPauseFrames) {
        return true
      }
    } else {
      consecutiveStableFrames = 0
    }
  }
  
  return false
}

/**
 * 计算出手流畅度
 * 
 * 通过手腕角度变化的标准差评估流畅度
 * 标准差越小，动作越流畅
 * 
 * @param wristAngles 腕关节角度数组
 * @returns 流畅度分数（0-1）
 */
function calculateReleaseSmoothness(wristAngles: number[]): number {
  if (wristAngles.length < 5) return 0.5
  
  // 计算角度变化率
  const changes: number[] = []
  for (let i = 1; i < wristAngles.length; i++) {
    changes.push(Math.abs(wristAngles[i] - wristAngles[i - 1]))
  }
  
  // 变化率的标准差
  const changeStd = standardDeviation(changes)
  
  // 标准差越小越流畅
  // 阈值：标准差 < 3度/帧为非常流畅，> 10度/帧为不流畅
  const smoothness = Math.max(0, 1 - (changeStd / 10))
  
  return Math.min(1, smoothness)
}

/**
 * 计算肘关节伸展时机
 * 
 * 分析肘关节开始伸展与手腕释放的时间关系
 * 
 * @param elbowAngles 肘关节角度
 * @param wristAngles 腕关节角度
 * @returns 时机分数（0-1，1为最佳时机）
 */
function calculateElbowExtensionTiming(elbowAngles: number[], wristAngles: number[]): number {
  if (elbowAngles.length < 5 || wristAngles.length < 5) return 0.5
  
  // 找出肘关节最大角度（最伸展）的位置
  const maxElbowIndex = elbowAngles.indexOf(Math.max(...elbowAngles))
  
  // 找出手腕释放位置（角度变化最快的点）
  let maxWristChangeIndex = 0
  let maxChange = 0
  
  for (let i = 1; i < wristAngles.length; i++) {
    const change = Math.abs(wristAngles[i] - wristAngles[i - 1])
    if (change > maxChange) {
      maxChange = change
      maxWristChangeIndex = i
    }
  }
  
  // 理想情况：肘关节完全伸展后，手腕立即释放
  // 时间差在2-3帧内为最佳
  const timeDiff = Math.abs(maxElbowIndex - maxWristChangeIndex)
  const idealDiff = 2
  
  if (timeDiff <= idealDiff) {
    return 1.0
  } else if (timeDiff <= idealDiff + 3) {
    return 0.7
  } else if (timeDiff <= idealDiff + 5) {
    return 0.4
  } else {
    return 0.2
  }
}

/**
 * 计算出手持续时间
 * 
 * 从手腕开始动作到结束动作的帧数
 * 
 * @param wristAngles 腕关节角度
 * @param fps 帧率
 * @returns 出手持续帧数
 */
function calculateReleaseDuration(wristAngles: number[], fps: number): number {
  if (wristAngles.length < 3) return 0
  
  // 找出变化最大的连续区域
  const changes: number[] = []
  for (let i = 1; i < wristAngles.length; i++) {
    changes.push(Math.abs(wristAngles[i] - wristAngles[i - 1]))
  }
  
  // 找到主要动作区域（变化最大的部分）
  const threshold = mean(changes) + standardDeviation(changes)
  let startFrame = 0
  let endFrame = wristAngles.length - 1
  
  // 找到开始点
  for (let i = 0; i < changes.length; i++) {
    if (changes[i] > threshold) {
      startFrame = i
      break
    }
  }
  
  // 找到结束点
  for (let i = changes.length - 1; i >= 0; i--) {
    if (changes[i] > threshold) {
      endFrame = i + 1
      break
    }
  }
  
  return endFrame - startFrame
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
 * 生成风格相关建议
 */
export function generateStyleRecommendations(analysis: ShootingStyleAnalysis): string[] {
  const recommendations: string[] = []
  
  if (analysis.style === 'one_motion') {
    recommendations.push(
      '您的投篮风格为一段式（One-motion），特点是流畅连贯，适合快速出手。建议保持当前节奏，同时确保力量传递充分。'
    )
    
    if (analysis.characteristics.release_smoothness < 0.7) {
      recommendations.push(
        '一段式投篮流畅度可以进一步提升，建议练习无球模拟，感受力量从下肢到上肢的连贯传递。'
      )
    }
  } else if (analysis.style === 'two_motion') {
    recommendations.push(
      '您的投篮风格为二段式（Two-motion），特点是稳定可控，适合远距离投篮。建议在停顿点保持肘部稳定，确保出手点一致性。'
    )
    
    if (analysis.characteristics.has_pause_at_set_point && analysis.characteristics.elbow_extension_timing < 0.6) {
      recommendations.push(
        '二段式投篮在停顿后肘部伸展时机需要调整，建议练习在停顿点后快速连贯地完成出手动作。'
      )
    }
  } else {
    recommendations.push(
      '您的投篮风格介于一段式和二段式之间。建议根据投篮距离选择风格：近距离用一段式，远距离用二段式。'
    )
  }
  
  return recommendations
}
