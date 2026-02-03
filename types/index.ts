export type CameraAngle = 'side' | 'front' | 'other'
export type LightingCondition = 'good' | 'moderate' | 'poor'
export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type OrderStatus = 'pending' | 'paid' | 'refunded'
export type PlayerPosition = 'point_guard' | 'shooting_guard' | 'small_forward' | 'power_forward' | 'center'

export interface User {
  id: string
  email: string
  nickname?: string
  avatar_url?: string
  height_cm?: number
  weight_kg?: number
  position?: PlayerPosition
  preferred_language: string
  created_at: string
  updated_at: string
}

export interface AnalysisTask {
  id: string
  user_id: string
  status: AnalysisStatus
  video_url: string
  video_duration?: number
  camera_angle?: CameraAngle
  lighting_condition?: LightingCondition
  results?: AnalysisResults
  is_paid: boolean
  paid_at?: string
  created_at: string
  updated_at: string
}

export interface AnalysisResults {
  overall_score: number
  confidence_interval: [number, number]
  detection_confidence: number
  dimensions: {
    consistency: DimensionScore
    joint_angles: DimensionScore
    symmetry: DimensionScore
    shooting_style: DimensionScore
    timing: DimensionScore
    stability: DimensionScore
    progress: DimensionScore
    coordination: DimensionScore
    kinetic_chain: DimensionScore
  }
  ai_report: AIReport
}

export interface DimensionScore {
  score: number
  details: Record<string, unknown>
}

export interface AIReport {
  overall_score: number
  problems: string[]
  recommendations: string[]
  training_plan: TrainingPlan
  disclaimer: string
}

export interface TrainingPlan {
  title: string
  description: string
  exercises: Exercise[]
  duration_weeks: number
}

export interface Exercise {
  name: string
  description: string
  sets?: number
  reps?: number
  duration?: string
}

export interface ShootingRecord {
  id: string
  user_id: string
  analysis_id?: string
  session_date: string
  total_attempts: number
  made_shots: number
  shooting_percentage: number
  mechanics_score?: number
  consistency_knee?: number
  notes?: string
  created_at: string
}

export interface Order {
  id: string
  user_id: string
  analysis_id?: string
  amount_cny: number
  status: OrderStatus
  payment_method?: string
  paid_at?: string
  created_at: string
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface AnalysisProgress {
  task_id: string
  status: AnalysisStatus
  progress: number
  stage: string
  message: string
}
