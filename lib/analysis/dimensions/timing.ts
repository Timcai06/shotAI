/**
 * Timing Analysis - 时序分析
 * 
 * 分析投篮各阶段的时长和节奏
 * 阶段：准备(Setup) → 蓄力(Load) → 出手(Release) → 随挥(Follow-through)
 * 
 * 参考: Cabarkapa et al. (2022) 投篮时序研究
 */

import type { PoseSequence, TimingAnalysis, ShootingPhase, PhaseData, JointType } from '@/types/analysis'
import { calculateAllJointAngles } from '../angle-calculator'
import { findPeaks, findValleys, mean, standardDeviation } from '../math-utils'

// 时序分析配置
const TIMING_CONFIG = {
  // 各阶段时间占比的理想范围
  idealPhaseRatios: {
    setup: { min: 0.15, max: 0.25, weight: 0.2 },      // 准备 15-25%
    load: { min: 0.25, max: 0.35, weight: 0.3 },       // 蓄力 25-35%
    release: { min: 0.15, max: 0.25, weight: 0.3 },    // 出手 15-25%
    follow_through: { min: 0.20, max: 0.30, weight: 0.2 }, // 随挥 20-30%
  },
  
  // 总时长范围（毫秒）
  idealTotalDuration: { min: 800, max: 2000 },
  
  // 节奏一致性阈值
  rhythmThreshold: 0.1,  // 变异系数阈值
}

/**
 * 分析投篮时序
 * 
 * @param sequence MediaPipe姿态序列
 * @returns 时序分析结果
 */
export function analyzeTiming(sequence: PoseSequence): TimingAnalysis {
  // 计算主导侧膝关节角度变化，用于划分阶段
  const allJointAngles = calculateAllJointAngles(sequence)
  const dominantSide = detectDominantSide(allJointAngles)
  
  const kneeSeries = dominantSide === 'right'
    ? allJointAngles.get('right_knee' as JointType)
    : allJointAngles.get('left_knee' as JointType)
  
  const elbowSeries = dominantSide === 'right'
    ? allJointAngles.get('right_elbow' as JointType)
    : allJointAngles.get('left_elbow' as JointType)
  
  if (!kneeSeries || !elbowSeries) {
    return createEmptyTimingAnalysis(sequence.duration_ms)
  }
  
  // 识别阶段边界
  const phaseBoundaries = identifyPhaseBoundaries(kneeSeries.angles, elbowSeries.angles)
  
  // 计算各阶段时长
  const phases = calculatePhaseDurations(phaseBoundaries, sequence.duration_ms, sequence.fps)
  
  // 计算总时长得分
  const totalDuration = sequence.duration_ms
  const durationScore = calculateDurationScore(totalDuration)
  
  // 计算各阶段比例得分
  const phaseScores = calculatePhaseScores(phases, totalDuration)
  
  // 计算节奏一致性
  const rhythmConsistency = calculateRhythmConsistency(phases, kneeSeries.angles, elbowSeries.angles)
  
  // 综合评分
  const totalScore = Math.round(
    durationScore * 0.25 +
    phaseScores.setup * TIMING_CONFIG.idealPhaseRatios.setup.weight +
    phaseScores.load * TIMING_CONFIG.idealPhaseRatios.load.weight +
    phaseScores.release * TIMING_CONFIG.idealPhaseRatios.release.weight +
    phaseScores.follow_through * TIMING_CONFIG.idealPhaseRatios.follow_through.weight +
    rhythmConsistency * 0.15
  )
  
  return {
    score: totalScore,
    phases: {
      setup: { duration_ms: phases.setup, percentage: Math.round((phases.setup / totalDuration) * 100) },
      load: { duration_ms: phases.load, percentage: Math.round((phases.load / totalDuration) * 100) },
      release: { duration_ms: phases.release, percentage: Math.round((phases.release / totalDuration) * 100) },
      follow_through: { duration_ms: phases.follow_through, percentage: Math.round((phases.follow_through / totalDuration) * 100) },
    },
    total_duration_ms: totalDuration,
    rhythm_consistency: Math.round(rhythmConsistency * 100) / 100,
  }
}

/**
 * 识别投篮阶段边界
 * 
 * 通过膝关节角度变化识别下蹲（Load）和起身
 * 通过肘关节角度变化识别出手
 * 
 * @param kneeAngles 膝关节角度序列
 * @param elbowAngles 肘关节角度序列
 * @returns 阶段边界帧索引
 */
function identifyPhaseBoundaries(kneeAngles: number[], elbowAngles: number[]): {
  setup_end: number
  load_end: number
  release_end: number
} {
  const totalFrames = kneeAngles.length
  
  // 找到膝关节最小角度（下蹲最深）
  const minKneeIndex = kneeAngles.indexOf(Math.min(...kneeAngles))
  
  // 找到肘关节最大角度（最伸展）
  const maxElbowIndex = elbowAngles.indexOf(Math.max(...elbowAngles))
  
  // 找到膝关节最大角度（最直）
  const maxKneeIndex = kneeAngles.indexOf(Math.max(...kneeAngles))
  
  // 阶段划分
  const setup_end = Math.max(1, Math.floor(minKneeIndex * 0.4))
  const load_end = minKneeIndex
  const release_end = maxElbowIndex
  
  return {
    setup_end,
    load_end,
    release_end: Math.min(release_end, totalFrames - 2),
  }
}

/**
 * 计算各阶段时长
 * 
 * @param boundaries 阶段边界
 * @param totalDuration 总时长（毫秒）
 * @param fps 帧率
 * @returns 各阶段时长（毫秒）
 */
function calculatePhaseDurations(
  boundaries: { setup_end: number; load_end: number; release_end: number },
  totalDuration: number,
  fps: number
): Record<ShootingPhase, number> {
  const msPerFrame = 1000 / fps
  
  const setup = boundaries.setup_end * msPerFrame
  const load = (boundaries.load_end - boundaries.setup_end) * msPerFrame
  const release = (boundaries.release_end - boundaries.load_end) * msPerFrame
  const follow_through = totalDuration - (boundaries.release_end * msPerFrame)
  
  return {
    setup: Math.max(0, setup),
    load: Math.max(0, load),
    release: Math.max(0, release),
    follow_through: Math.max(0, follow_through),
  }
}

/**
 * 计算总时长得分
 * 
 * @param duration 总时长（毫秒）
 * @returns 0-100得分
 */
function calculateDurationScore(duration: number): number {
  const { min, max } = TIMING_CONFIG.idealTotalDuration
  
  if (duration >= min && duration <= max) {
    return 100
  }
  
  if (duration < min) {
    // 太快
    return Math.max(0, 100 - ((min - duration) / min) * 100)
  }
  
  // 太慢
  return Math.max(0, 100 - ((duration - max) / max) * 50)
}

/**
 * 计算各阶段比例得分
 * 
 * @param phases 各阶段时长
 * @param totalDuration 总时长
 * @returns 各阶段得分
 */
function calculatePhaseScores(
  phases: Record<ShootingPhase, number>,
  totalDuration: number
): Record<ShootingPhase, number> {
  const scores: Partial<Record<ShootingPhase, number>> = {}
  
  for (const [phase, duration] of Object.entries(phases)) {
    const ratio = duration / totalDuration
    const config = TIMING_CONFIG.idealPhaseRatios[phase as ShootingPhase]
    
    if (ratio >= config.min && ratio <= config.max) {
      scores[phase as ShootingPhase] = 100
    } else if (ratio < config.min) {
      scores[phase as ShootingPhase] = Math.max(0, 100 - ((config.min - ratio) / config.min) * 100)
    } else {
      scores[phase as ShootingPhase] = Math.max(0, 100 - ((ratio - config.max) / config.max) * 100)
    }
  }
  
  return scores as Record<ShootingPhase, number>
}

/**
 * 计算节奏一致性
 * 
 * 评估动作节奏的稳定性和连贯性
 * 
 * @param phases 各阶段时长
 * @param kneeAngles 膝关节角度
 * @param elbowAngles 肘关节角度
 * @returns 0-1一致性分数
 */
function calculateRhythmConsistency(
  phases: Record<ShootingPhase, number>,
  kneeAngles: number[],
  elbowAngles: number[]
): number {
  // 方法1：阶段时长变异系数
  const phaseDurations = Object.values(phases)
  const phaseCV = standardDeviation(phaseDurations) / mean(phaseDurations)
  
  // 方法2：关键关节角度变化平滑度
  const kneeChanges: number[] = []
  const elbowChanges: number[] = []
  
  for (let i = 1; i < kneeAngles.length; i++) {
    kneeChanges.push(Math.abs(kneeAngles[i] - kneeAngles[i - 1]))
    elbowChanges.push(Math.abs(elbowAngles[i] - elbowAngles[i - 1]))
  }
  
  const kneeCV = kneeChanges.length > 0 ? standardDeviation(kneeChanges) / mean(kneeChanges) : 1
  const elbowCV = elbowChanges.length > 0 ? standardDeviation(elbowChanges) / mean(elbowChanges) : 1
  
  // 综合评分（变异系数越小越一致）
  const avgCV = (phaseCV + kneeCV + elbowCV) / 3
  const consistency = Math.max(0, 1 - (avgCV / 0.5))  // 0.5是阈值
  
  return consistency
}

/**
 * 创建空时序分析结果
 */
function createEmptyTimingAnalysis(totalDuration: number): TimingAnalysis {
  const phaseDuration = totalDuration / 4
  
  return {
    score: 50,
    phases: {
      setup: { duration_ms: phaseDuration, percentage: 25 },
      load: { duration_ms: phaseDuration, percentage: 25 },
      release: { duration_ms: phaseDuration, percentage: 25 },
      follow_through: { duration_ms: phaseDuration, percentage: 25 },
    },
    total_duration_ms: totalDuration,
    rhythm_consistency: 0.5,
  }
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
 * 生成时序改进建议
 */
export function generateTimingRecommendations(analysis: TimingAnalysis): string[] {
  const recommendations: string[] = []
  const { phases, total_duration_ms, rhythm_consistency } = analysis
  
  // 总时长评估
  if (total_duration_ms < 800) {
    recommendations.push(
      `投篮动作过快（${(total_duration_ms / 1000).toFixed(2)}秒），建议放慢节奏，确保力量充分传递。理想时长为0.8-2.0秒。`
    )
  } else if (total_duration_ms > 2000) {
    recommendations.push(
      `投篮动作偏慢（${(total_duration_ms / 1000).toFixed(2)}秒），建议提高效率，避免防守干扰。`
    )
  }
  
  // 各阶段比例评估
  if (phases.setup.percentage > 30) {
    recommendations.push(
      `准备阶段过长（${phases.setup.percentage}%），建议简化准备动作，更快进入发力阶段。`
    )
  }
  
  if (phases.load.percentage < 20) {
    recommendations.push(
      `蓄力阶段过短（${phases.load.percentage}%），建议增加下蹲深度，充分利用下肢力量。`
    )
  }
  
  if (phases.release.percentage > 30) {
    recommendations.push(
      `出手阶段过长（${phases.release.percentage}%），建议加快出手速度，提高突然性。`
    )
  }
  
  // 节奏一致性
  if (rhythm_consistency < 0.6) {
    recommendations.push(
      `投篮节奏不够连贯（一致度${(rhythm_consistency * 100).toFixed(0)}%），建议练习连续投篮，建立稳定节奏。`
    )
  }
  
  return recommendations
}
