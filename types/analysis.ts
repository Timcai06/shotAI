/**
 * Analysis Types - Week 7-8 9维度分析类型定义
 * 
 * 定义 MediaPipe 33关键点、关节角度、以及9维度分析结果的数据结构
 */

// MediaPipe Pose 33关键点索引定义
// 参考: https://developers.google.com/mediapipe/solutions/vision/pose_landmarker
export enum PoseLandmark {
  // 面部 (0-10)
  NOSE = 0,
  LEFT_EYE_INNER = 1,
  LEFT_EYE = 2,
  LEFT_EYE_OUTER = 3,
  RIGHT_EYE_INNER = 4,
  RIGHT_EYE = 5,
  RIGHT_EYE_OUTER = 6,
  LEFT_EAR = 7,
  RIGHT_EAR = 8,
  MOUTH_LEFT = 9,
  MOUTH_RIGHT = 10,
  
  // 肩膀和手臂 (11-22)
  LEFT_SHOULDER = 11,
  RIGHT_SHOULDER = 12,
  LEFT_ELBOW = 13,
  RIGHT_ELBOW = 14,
  LEFT_WRIST = 15,
  RIGHT_WRIST = 16,
  LEFT_PINKY = 17,
  RIGHT_PINKY = 18,
  LEFT_INDEX = 19,
  RIGHT_INDEX = 20,
  LEFT_THUMB = 21,
  RIGHT_THUMB = 22,
  
  // 躯干 (23-28)
  LEFT_HIP = 23,
  RIGHT_HIP = 24,
  LEFT_KNEE = 25,
  RIGHT_KNEE = 26,
  LEFT_ANKLE = 27,
  RIGHT_ANKLE = 28,
  
  // 脚 (29-32)
  LEFT_HEEL = 29,
  RIGHT_HEEL = 30,
  LEFT_FOOT_INDEX = 31,
  RIGHT_FOOT_INDEX = 32,
}

// 关键点数据结构
export interface Landmark {
  x: number  // 0-1 归一化坐标
  y: number
  z: number
  visibility?: number  // 0-1 可见度
}

// 一帧的姿态数据
export interface PoseFrame {
  landmarks: Landmark[]  // 33个关键点
  timestamp: number  // 毫秒
}

// 完整的姿态序列（视频分析结果）
export interface PoseSequence {
  frames: PoseFrame[]
  fps: number
  duration_ms: number
  total_frames: number
}

// 关节角度定义
export enum JointType {
  LEFT_KNEE = 'left_knee',
  RIGHT_KNEE = 'right_knee',
  LEFT_HIP = 'left_hip',
  RIGHT_HIP = 'right_hip',
  LEFT_SHOULDER = 'left_shoulder',
  RIGHT_SHOULDER = 'right_shoulder',
  LEFT_ELBOW = 'left_elbow',
  RIGHT_ELBOW = 'right_elbow',
  LEFT_WRIST = 'left_wrist',
  RIGHT_WRIST = 'right_wrist',
}

// 单帧关节角度
export interface JointAngle {
  joint: JointType
  angle: number  // 角度 (0-180)
  confidence: number  // 置信度 (0-1)
}

// 关节角度时间序列
export interface JointAngleSeries {
  joint: JointType
  angles: number[]
  timestamps: number[]
  mean: number
  min: number
  max: number
  std_dev: number  // 标准差（用于一致性计算）
}

// 投篮阶段定义
export enum ShootingPhase {
  SETUP = 'setup',           // 准备姿势
  LOAD = 'load',             // 蓄力下蹲
  RELEASE = 'release',       // 出手
  FOLLOW_THROUGH = 'follow_through',  // 随挥
}

// 单阶段数据
export interface PhaseData {
  phase: ShootingPhase
  start_frame: number
  end_frame: number
  duration_ms: number
  key_angles: Record<JointType, number[]>
}

// 投篮风格
export enum ShootingStyle {
  ONE_MOTION = 'one_motion',    // 一段式（流畅连贯）
  TWO_MOTION = 'two_motion',    // 二段式（停顿后出手）
  HYBRID = 'hybrid',            // 混合型
}

// 误差范围定义
export interface ErrorMargin {
  value: number  // 误差角度值
  unit: 'degrees'
  condition: string  // 适用条件（如"侧面视角"）
}

// 9维度详细结果
export interface ConsistencyAnalysis {
  score: number  // 0-100
  knee_angle_std: number
  elbow_angle_std: number
  wrist_angle_std: number
  overall_consistency: 'high' | 'medium' | 'low'
  error_margin: ErrorMargin
  details: {
    knee_angles: number[]
    elbow_angles: number[]
    wrist_angles: number[]
  }
}

export interface JointAnglesAnalysis {
  score: number
  angles: Record<JointType, {
    mean: number
    min: number
    max: number
    optimal_range: [number, number]
    deviation_from_optimal: number
  }>
  error_margin: ErrorMargin
}

export interface SymmetryAnalysis {
  score: number
  left_right_balance: number  // 左右平衡度 0-100
  knee_symmetry: number
  elbow_symmetry: number
  shoulder_symmetry: number
  error_margin: ErrorMargin
}

export interface ShootingStyleAnalysis {
  style: ShootingStyle
  confidence: number
  score: number
  characteristics: {
    has_pause_at_set_point: boolean
    release_smoothness: number
    elbow_extension_timing: number
  }
}

export interface TimingAnalysis {
  score: number
  phases: Record<ShootingPhase, {
    duration_ms: number
    percentage: number  // 占总时长百分比
  }>
  total_duration_ms: number
  rhythm_consistency: number
}

export interface StabilityAnalysis {
  score: number
  base_stability: number  // 下肢稳定性
  upper_body_stability: number
  release_point_consistency: number
}

export interface CoordinationAnalysis {
  score: number
  joint_sync_coefficient: number  // 关节同步系数 0-1
  hip_knee_coordination: number
  elbow_wrist_coordination: number
}

export interface KineticChainAnalysis {
  score: number
  force_transfer_efficiency: number
  sequence_score: number  // 发力顺序流畅度
  timing_score: number
  phases: {
    hip_initiation: boolean
    knee_follow_through: boolean
    elbow_extension: boolean
    wrist_snap: boolean
  }
}

// 完整的9维度分析结果
export interface NineDimensionsResult {
  consistency: ConsistencyAnalysis
  joint_angles: JointAnglesAnalysis
  symmetry: SymmetryAnalysis
  shooting_style: ShootingStyleAnalysis
  timing: TimingAnalysis
  stability: StabilityAnalysis
  coordination: CoordinationAnalysis
  kinetic_chain: KineticChainAnalysis
  // progress维度从历史数据计算
}

// 分析元数据
export interface AnalysisMetadata {
  video_duration_ms: number
  fps: number
  total_frames_analyzed: number
  camera_angle: 'side' | 'front' | 'other'
  detection_confidence: number
  processing_timestamp: string
  error_margins: {
    side_view: number  // ±15°
    front_view: number  // ±20°
    other_view: number  // ±25°
  }
}

// 完整分析结果（用于存储到数据库）
export interface CompleteAnalysisResult {
  overall_score: number
  confidence_interval: [number, number]
  detection_confidence: number
  nine_dimensions: NineDimensionsResult
  metadata: AnalysisMetadata
  ai_report?: {
    summary: string
    problems: string[]
    recommendations: string[]
    training_plan: {
      title: string
      description: string
      exercises: Array<{
        name: string
        description: string
        sets?: number
        reps?: number
        duration?: string
      }>
      duration_weeks: number
    }
    disclaimer: string
  }
}
