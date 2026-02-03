/**
 * Angle Calculator - 关节角度计算模块
 * 
 * 从MediaPipe关键点计算膝、髋、肩、肘、腕关节角度
 * 支持3D空间角度计算和2D投影角度计算
 */

import { PoseLandmark, type Landmark, type JointType, type JointAngle, type JointAngleSeries, type PoseFrame, type PoseSequence } from '@/types/analysis'
import { calculateAngle3D, vectorSubtract, vectorMagnitude, type Vector3 } from './math-utils'

// 关节定义 - 指定组成每个关节的三个关键点
export interface JointDefinition {
  joint: JointType
  prev: PoseLandmark  // 前一个点（近端）
  current: PoseLandmark  // 关节中心点
  next: PoseLandmark  // 后一个点（远端）
  name: string
  optimalRange?: [number, number]  // 最优角度范围
}

// 所有关节定义
export const JOINT_DEFINITIONS: JointDefinition[] = [
  // 膝关节
  {
    joint: 'left_knee' as JointType,
    prev: PoseLandmark.LEFT_HIP,
    current: PoseLandmark.LEFT_KNEE,
    next: PoseLandmark.LEFT_ANKLE,
    name: '左膝关节',
    optimalRange: [100, 140],  // 投篮时屈膝角度
  },
  {
    joint: 'right_knee' as JointType,
    prev: PoseLandmark.RIGHT_HIP,
    current: PoseLandmark.RIGHT_KNEE,
    next: PoseLandmark.RIGHT_ANKLE,
    name: '右膝关节',
    optimalRange: [100, 140],
  },
  // 髋关节
  {
    joint: 'left_hip' as JointType,
    prev: PoseLandmark.LEFT_SHOULDER,
    current: PoseLandmark.LEFT_HIP,
    next: PoseLandmark.LEFT_KNEE,
    name: '左髋关节',
    optimalRange: [80, 120],
  },
  {
    joint: 'right_hip' as JointType,
    prev: PoseLandmark.RIGHT_SHOULDER,
    current: PoseLandmark.RIGHT_HIP,
    next: PoseLandmark.RIGHT_KNEE,
    name: '右髋关节',
    optimalRange: [80, 120],
  },
  // 肩关节
  {
    joint: 'left_shoulder' as JointType,
    prev: PoseLandmark.LEFT_HIP,
    current: PoseLandmark.LEFT_SHOULDER,
    next: PoseLandmark.LEFT_ELBOW,
    name: '左肩关节',
    optimalRange: [70, 110],
  },
  {
    joint: 'right_shoulder' as JointType,
    prev: PoseLandmark.RIGHT_HIP,
    current: PoseLandmark.RIGHT_SHOULDER,
    next: PoseLandmark.RIGHT_ELBOW,
    name: '右肩关节',
    optimalRange: [70, 110],
  },
  // 肘关节
  {
    joint: 'left_elbow' as JointType,
    prev: PoseLandmark.LEFT_SHOULDER,
    current: PoseLandmark.LEFT_ELBOW,
    next: PoseLandmark.LEFT_WRIST,
    name: '左肘关节',
    optimalRange: [140, 180],  // 投篮时接近伸直
  },
  {
    joint: 'right_elbow' as JointType,
    prev: PoseLandmark.RIGHT_SHOULDER,
    current: PoseLandmark.RIGHT_ELBOW,
    next: PoseLandmark.RIGHT_WRIST,
    name: '右肘关节',
    optimalRange: [140, 180],
  },
  // 腕关节
  {
    joint: 'left_wrist' as JointType,
    prev: PoseLandmark.LEFT_ELBOW,
    current: PoseLandmark.LEFT_WRIST,
    next: PoseLandmark.LEFT_INDEX,
    name: '左腕关节',
    optimalRange: [150, 180],
  },
  {
    joint: 'right_wrist' as JointType,
    prev: PoseLandmark.RIGHT_ELBOW,
    current: PoseLandmark.RIGHT_WRIST,
    next: PoseLandmark.RIGHT_INDEX,
    name: '右腕关节',
    optimalRange: [150, 180],
  },
]

// 将MediaPipe Landmark转换为Vector3
function landmarkToVector3(landmark: Landmark): Vector3 {
  return { x: landmark.x, y: landmark.y, z: landmark.z }
}

// 计算单帧中指定关节的角度
export function calculateJointAngle(
  frame: PoseFrame,
  jointDef: JointDefinition
): JointAngle {
  const prev = frame.landmarks[jointDef.prev]
  const current = frame.landmarks[jointDef.current]
  const next = frame.landmarks[jointDef.next]
  
  // 检查关键点是否存在且有足够的可见度
  const minVisibility = 0.5
  const prevVisible = prev?.visibility ?? 1
  const currentVisible = current?.visibility ?? 1
  const nextVisible = next?.visibility ?? 1
  
  const confidence = Math.min(prevVisible, currentVisible, nextVisible)
  
  if (!prev || !current || !next || confidence < minVisibility) {
    return {
      joint: jointDef.joint,
      angle: 0,
      confidence: 0,
    }
  }
  
  // 计算角度
  const angle = calculateAngle3D(
    landmarkToVector3(prev),
    landmarkToVector3(current),
    landmarkToVector3(next)
  )
  
  return {
    joint: jointDef.joint,
    angle: Math.round(angle * 10) / 10,  // 保留一位小数
    confidence,
  }
}

// 计算姿态序列中指定关节的角度时间序列
export function calculateJointAngleSeries(
  sequence: PoseSequence,
  jointDef: JointDefinition
): JointAngleSeries {
  const angles: number[] = []
  const timestamps: number[] = []
  
  for (const frame of sequence.frames) {
    const jointAngle = calculateJointAngle(frame, jointDef)
    
    // 只使用置信度足够的数据点
    if (jointAngle.confidence >= 0.5) {
      angles.push(jointAngle.angle)
      timestamps.push(frame.timestamp)
    }
  }
  
  // 计算统计数据
  const mean = angles.length > 0
    ? angles.reduce((sum, a) => sum + a, 0) / angles.length
    : 0
  
  const min = angles.length > 0 ? Math.min(...angles) : 0
  const max = angles.length > 0 ? Math.max(...angles) : 0
  
  // 计算标准差
  let stdDev = 0
  if (angles.length > 1) {
    const variance = angles.reduce((sum, a) => sum + Math.pow(a - mean, 2), 0) / angles.length
    stdDev = Math.sqrt(variance)
  }
  
  return {
    joint: jointDef.joint,
    angles,
    timestamps,
    mean: Math.round(mean * 10) / 10,
    min: Math.round(min * 10) / 10,
    max: Math.round(max * 10) / 10,
    std_dev: Math.round(stdDev * 10) / 10,
  }
}

// 计算所有关节的角度序列
export function calculateAllJointAngles(sequence: PoseSequence): Map<JointType, JointAngleSeries> {
  const result = new Map<JointType, JointAngleSeries>()
  
  for (const jointDef of JOINT_DEFINITIONS) {
    const series = calculateJointAngleSeries(sequence, jointDef)
    result.set(jointDef.joint, series)
  }
  
  return result
}

// 识别主导手（投篮手）
export function detectDominantHand(sequence: PoseSequence): 'left' | 'right' {
  // 通过比较手腕活动范围来判断主导手
  const leftWristDef = JOINT_DEFINITIONS.find(j => j.joint === 'left_wrist')
  const rightWristDef = JOINT_DEFINITIONS.find(j => j.joint === 'right_wrist')
  
  if (!leftWristDef || !rightWristDef) return 'right'
  
  const leftSeries = calculateJointAngleSeries(sequence, leftWristDef)
  const rightSeries = calculateJointAngleSeries(sequence, rightWristDef)
  
  // 比较角度变化范围，范围更大的通常是投篮手
  const leftRange = leftSeries.max - leftSeries.min
  const rightRange = rightSeries.max - rightSeries.min
  
  return rightRange > leftRange ? 'right' : 'left'
}

// 获取关节定义
export function getJointDefinition(jointType: JointType): JointDefinition | undefined {
  return JOINT_DEFINITIONS.find(j => j.joint === jointType)
}

// 获取关节中文名称
export function getJointName(jointType: JointType): string {
  const def = getJointDefinition(jointType)
  return def?.name || jointType
}

// 计算关节角度与最优范围的偏差
export function calculateJointDeviation(
  angle: number,
  optimalRange: [number, number]
): { deviation: number; withinRange: boolean } {
  const [min, max] = optimalRange
  
  if (angle >= min && angle <= max) {
    return { deviation: 0, withinRange: true }
  }
  
  if (angle < min) {
    return { deviation: angle - min, withinRange: false }
  }
  
  return { deviation: angle - max, withinRange: false }
}
