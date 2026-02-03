/**
 * Math Utils - 数学计算工具函数
 * 
 * 提供向量计算、角度计算、统计计算等基础数学工具
 */

// 3D向量
export interface Vector3 {
  x: number
  y: number
  z: number
}

// 向量减法: a - b
export function vectorSubtract(a: Vector3, b: Vector3): Vector3 {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z,
  }
}

// 向量点积
export function vectorDot(a: Vector3, b: Vector3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z
}

// 向量叉积
export function vectorCross(a: Vector3, b: Vector3): Vector3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  }
}

// 向量长度（模）
export function vectorMagnitude(v: Vector3): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
}

// 向量归一化
export function vectorNormalize(v: Vector3): Vector3 {
  const mag = vectorMagnitude(v)
  if (mag === 0) return { x: 0, y: 0, z: 0 }
  return {
    x: v.x / mag,
    y: v.y / mag,
    z: v.z / mag,
  }
}

// 计算两向量夹角（弧度）
export function angleBetweenVectors(a: Vector3, b: Vector3): number {
  const dot = vectorDot(a, b)
  const magA = vectorMagnitude(a)
  const magB = vectorMagnitude(b)
  
  if (magA === 0 || magB === 0) return 0
  
  // 防止浮点误差导致值超出 [-1, 1]
  const cos = Math.max(-1, Math.min(1, dot / (magA * magB)))
  return Math.acos(cos)
}

// 弧度转角度
export function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI
}

// 角度转弧度
export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

// 计算三点形成的角度（顶点在中间）
// 返回角度值（0-180度）
export function calculateAngle3D(
  prev: Vector3,
  current: Vector3,
  next: Vector3
): number {
  // 创建从当前点指向前后点的向量
  const v1 = vectorSubtract(prev, current)
  const v2 = vectorSubtract(next, current)
  
  // 计算两向量夹角
  const radians = angleBetweenVectors(v1, v2)
  return radiansToDegrees(radians)
}

// 2D版本（忽略Z轴）
export function calculateAngle2D(
  prev: { x: number; y: number },
  current: { x: number; y: number },
  next: { x: number; y: number }
): number {
  const v1 = { x: prev.x - current.x, y: prev.y - current.y, z: 0 }
  const v2 = { x: next.x - current.x, y: next.y - current.y, z: 0 }
  const radians = angleBetweenVectors(v1, v2)
  return radiansToDegrees(radians)
}

// 统计计算

// 计算平均值
export function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

// 计算标准差
export function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0
  const avg = mean(values)
  const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length
  return Math.sqrt(variance)
}

// 计算变异系数 (CV) - 标准差/平均值，用于一致性评估
export function coefficientOfVariation(values: number[]): number {
  if (values.length === 0) return 0
  const avg = mean(values)
  if (avg === 0) return 0
  return standardDeviation(values) / Math.abs(avg)
}

// 计算最小值和最大值
export function minMax(values: number[]): { min: number; max: number } {
  if (values.length === 0) return { min: 0, max: 0 }
  return {
    min: Math.min(...values),
    max: Math.max(...values),
  }
}

// 计算范围（最大值-最小值）
export function range(values: number[]): number {
  const { min, max } = minMax(values)
  return max - min
}

// 移动平均平滑
export function movingAverage(values: number[], windowSize: number): number[] {
  if (windowSize <= 1 || values.length < windowSize) return values
  
  const result: number[] = []
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2))
    const end = Math.min(values.length, start + windowSize)
    const window = values.slice(start, end)
    result.push(mean(window))
  }
  return result
}

// 找出数据中的峰值（局部最大值）
export function findPeaks(
  values: number[],
  minPeakHeight: number = 0,
  minPeakDistance: number = 1
): number[] {
  const peaks: number[] = []
  
  for (let i = 1; i < values.length - 1; i++) {
    if (values[i] > values[i - 1] && values[i] > values[i + 1]) {
      if (values[i] >= minPeakHeight) {
        // 检查距离
        if (peaks.length === 0 || i - peaks[peaks.length - 1] >= minPeakDistance) {
          peaks.push(i)
        }
      }
    }
  }
  
  return peaks
}

// 找出数据中的谷值（局部最小值）
export function findValleys(
  values: number[],
  maxValleyHeight: number = Infinity,
  minValleyDistance: number = 1
): number[] {
  const valleys: number[] = []
  
  for (let i = 1; i < values.length - 1; i++) {
    if (values[i] < values[i - 1] && values[i] < values[i + 1]) {
      if (values[i] <= maxValleyHeight) {
        if (valleys.length === 0 || i - valleys[valleys.length - 1] >= minValleyDistance) {
          valleys.push(i)
        }
      }
    }
  }
  
  return valleys
}

// 线性插值
export function linearInterpolation(x: number, x0: number, x1: number, y0: number, y1: number): number {
  if (x1 === x0) return y0
  return y0 + ((x - x0) * (y1 - y0)) / (x1 - x0)
}

// 计算两个序列的相关系数 (Pearson)
export function correlation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0
  
  const meanX = mean(x)
  const meanY = mean(y)
  
  let numerator = 0
  let denomX = 0
  let denomY = 0
  
  for (let i = 0; i < x.length; i++) {
    const diffX = x[i] - meanX
    const diffY = y[i] - meanY
    numerator += diffX * diffY
    denomX += diffX * diffX
    denomY += diffY * diffY
  }
  
  const denominator = Math.sqrt(denomX * denomY)
  if (denominator === 0) return 0
  
  return numerator / denominator
}

// 计算百分比变化
export function percentageChange(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

// 将分数转换为等级
export function scoreToGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

// 限制数值在范围内
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

// 计算误差范围（根据置信度和视角）
export function calculateErrorMargin(
  cameraAngle: 'side' | 'front' | 'other',
  detectionConfidence: number
): number {
  // 基础误差
  const baseError = {
    side: 15,    // ±15°
    front: 20,   // ±20°
    other: 25,   // ±25°
  }
  
  // 根据检测置信度调整（置信度越低，误差越大）
  const confidenceMultiplier = 1 + (1 - detectionConfidence) * 0.5
  
  return baseError[cameraAngle] * confidenceMultiplier
}
