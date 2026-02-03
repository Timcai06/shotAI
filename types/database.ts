export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          nickname: string | null
          avatar_url: string | null
          height_cm: number | null
          weight_kg: number | null
          position: string | null
          preferred_language: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          nickname?: string | null
          avatar_url?: string | null
          height_cm?: number | null
          weight_kg?: number | null
          position?: string | null
          preferred_language?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          nickname?: string | null
          avatar_url?: string | null
          height_cm?: number | null
          weight_kg?: number | null
          position?: string | null
          preferred_language?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      analysis_tasks: {
        Row: {
          id: string
          user_id: string
          status: string
          video_url: string
          video_duration: number | null
          camera_angle: string | null
          lighting_condition: string | null
          results: Json | null
          is_paid: boolean
          paid_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: string
          video_url: string
          video_duration?: number | null
          camera_angle?: string | null
          lighting_condition?: string | null
          results?: Json | null
          is_paid?: boolean
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: string
          video_url?: string
          video_duration?: number | null
          camera_angle?: string | null
          lighting_condition?: string | null
          results?: Json | null
          is_paid?: boolean
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "analysis_tasks_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      shooting_records: {
        Row: {
          id: string
          user_id: string
          analysis_id: string | null
          session_date: string
          total_attempts: number
          made_shots: number
          shooting_percentage: number
          mechanics_score: number | null
          consistency_knee: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          analysis_id?: string | null
          session_date: string
          total_attempts: number
          made_shots: number
          shooting_percentage: number
          mechanics_score?: number | null
          consistency_knee?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          analysis_id?: string | null
          session_date?: string
          total_attempts?: number
          made_shots?: number
          shooting_percentage?: number
          mechanics_score?: number | null
          consistency_knee?: number | null
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shooting_records_analysis_id_fkey"
            columns: ["analysis_id"]
            referencedRelation: "analysis_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shooting_records_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      orders: {
        Row: {
          id: string
          user_id: string
          analysis_id: string | null
          amount_cny: number
          status: string
          payment_method: string | null
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          analysis_id?: string | null
          amount_cny: number
          status?: string
          payment_method?: string | null
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          analysis_id?: string | null
          amount_cny?: number
          status?: string
          payment_method?: string | null
          paid_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_analysis_id_fkey"
            columns: ["analysis_id"]
            referencedRelation: "analysis_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
