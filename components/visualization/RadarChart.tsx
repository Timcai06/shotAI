'use client'

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'
import type { NineDimensionsResult } from '@/types/analysis'

interface RadarChartProps {
  dimensions: NineDimensionsResult
  width?: number
  height?: number
  showLegend?: boolean
}

const DIMENSION_LABELS = {
  consistency: '一致性',
  joint_angles: '关节角度',
  symmetry: '对称性',
  shooting_style: '投篮风格',
  timing: '时序分析',
  stability: '稳定性',
  coordination: '协调性',
  kinetic_chain: '动力链',
}

const DIMENSION_COLORS = {
  consistency: '#3B82F6',
  joint_angles: '#10B981',
  symmetry: '#8B5CF6',
  shooting_style: '#F59E0B',
  timing: '#EF4444',
  stability: '#06B6D4',
  coordination: '#EC4899',
  kinetic_chain: '#84CC16',
}

export function DimensionRadarChart({ 
  dimensions, 
  width = 500, 
  height = 400,
  showLegend = true 
}: RadarChartProps) {
  const data = [
    { subject: DIMENSION_LABELS.consistency, score: dimensions.consistency.score, fullMark: 100 },
    { subject: DIMENSION_LABELS.joint_angles, score: dimensions.joint_angles.score, fullMark: 100 },
    { subject: DIMENSION_LABELS.symmetry, score: dimensions.symmetry.score, fullMark: 100 },
    { subject: DIMENSION_LABELS.shooting_style, score: dimensions.shooting_style.score, fullMark: 100 },
    { subject: DIMENSION_LABELS.timing, score: dimensions.timing.score, fullMark: 100 },
    { subject: DIMENSION_LABELS.stability, score: dimensions.stability.score, fullMark: 100 },
    { subject: DIMENSION_LABELS.coordination, score: dimensions.coordination.score, fullMark: 100 },
    { subject: DIMENSION_LABELS.kinetic_chain, score: dimensions.kinetic_chain.score, fullMark: 100 },
  ]

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{payload[0].payload.subject}</p>
          <p className="text-sm text-gray-600">
            得分: <span className="font-bold" style={{ color: payload[0].color }}>{payload[0].value}</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#E5E7EB" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#4B5563', fontSize: 12 }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]} 
            tick={{ fill: '#9CA3AF', fontSize: 10 }}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <Radar
            name="得分"
            dataKey="score"
            stroke="#3B82F6"
            fill="#3B82F6"
            fillOpacity={0.5}
            strokeWidth={2}
          />
          {showLegend && <Legend />}
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

interface MultiPlayerRadarChartProps {
  dimensions: NineDimensionsResult
  previousDimensions?: NineDimensionsResult
  width?: number
  height?: number
}

export function ComparisonRadarChart({ 
  dimensions, 
  previousDimensions,
  width = 500, 
  height = 400 
}: MultiPlayerRadarChartProps) {
  const currentData = [
    { subject: DIMENSION_LABELS.consistency, score: dimensions.consistency.score, fullMark: 100 },
    { subject: DIMENSION_LABELS.joint_angles, score: dimensions.joint_angles.score, fullMark: 100 },
    { subject: DIMENSION_LABELS.symmetry, score: dimensions.symmetry.score, fullMark: 100 },
    { subject: DIMENSION_LABELS.shooting_style, score: dimensions.shooting_style.score, fullMark: 100 },
    { subject: DIMENSION_LABELS.timing, score: dimensions.timing.score, fullMark: 100 },
    { subject: DIMENSION_LABELS.stability, score: dimensions.stability.score, fullMark: 100 },
    { subject: DIMENSION_LABELS.coordination, score: dimensions.coordination.score, fullMark: 100 },
    { subject: DIMENSION_LABELS.kinetic_chain, score: dimensions.kinetic_chain.score, fullMark: 100 },
  ]

  const previousData = previousDimensions ? [
    { subject: DIMENSION_LABELS.consistency, score: previousDimensions.consistency.score, fullMark: 100 },
    { subject: DIMENSION_LABELS.joint_angles, score: previousDimensions.joint_angles.score, fullMark: 100 },
    { subject: DIMENSION_LABELS.symmetry, score: previousDimensions.symmetry.score, fullMark: 100 },
    { subject: DIMENSION_LABELS.shooting_style, score: previousDimensions.shooting_style.score, fullMark: 100 },
    { subject: DIMENSION_LABELS.timing, score: previousDimensions.timing.score, fullMark: 100 },
    { subject: DIMENSION_LABELS.stability, score: previousDimensions.stability.score, fullMark: 100 },
    { subject: DIMENSION_LABELS.coordination, score: previousDimensions.coordination.score, fullMark: 100 },
    { subject: DIMENSION_LABELS.kinetic_chain, score: previousDimensions.kinetic_chain.score, fullMark: 100 },
  ] : []

  const data = currentData.map((item, idx) => ({
    ...item,
    previous: previousData[idx]?.score || 0,
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const current = payload.find((p: any) => p.dataKey === 'score')
      const previous = payload.find((p: any) => p.dataKey === 'previous')
      
      if (current) {
        const diff = current.value - (previous?.value || 0)
        const diffColor = diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-gray-600'
        const diffSymbol = diff > 0 ? '↑' : diff < 0 ? '↓' : '→'
        
        return (
          <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
            <p className="font-semibold text-gray-900">{current.payload.subject}</p>
            <p className="text-sm text-gray-600">
              本次: <span className="font-bold text-blue-600">{current.value}</span>
            </p>
            {previous && (
              <p className="text-sm text-gray-600">
                上次: <span className="font-bold text-gray-500">{previous.value}</span>
              </p>
            )}
            {diff !== 0 && (
              <p className={`text-sm font-medium ${diffColor}`}>
                {diffSymbol} {Math.abs(diff)} 分
              </p>
            )}
          </div>
        )
      }
    }
    return null
  }

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#E5E7EB" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#4B5563', fontSize: 11 }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]} 
            tick={{ fill: '#9CA3AF', fontSize: 10 }}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <Radar
            name="本次分析"
            dataKey="score"
            stroke="#3B82F6"
            fill="#3B82F6"
            fillOpacity={0.5}
            strokeWidth={2}
          />
          {previousDimensions && (
            <Radar
              name="上次分析"
              dataKey="previous"
              stroke="#9CA3AF"
              fill="#9CA3AF"
              fillOpacity={0.2}
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          )}
          <Legend />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

interface ScoreGaugeProps {
  score: number
  size?: number
  label?: string
}

export function ScoreGauge({ score, size = 200, label }: ScoreGaugeProps) {
  const getScoreColor = (s: number) => {
    if (s >= 80) return '#10B981'
    if (s >= 60) return '#F59E0B'
    return '#EF4444'
  }

  const getScoreLevel = (s: number) => {
    if (s >= 80) return '优秀'
    if (s >= 60) return '良好'
    if (s >= 40) return '一般'
    return '需改进'
  }

  return (
    <div className="flex flex-col items-center">
      <div style={{ width: size, height: size * 0.6 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="100%" outerRadius={size / 2 - 10} data={[{ subject: '得分', A: score, fullMark: 100 }]}>
            <PolarGrid stroke="#E5E7EB" />
            <PolarAngleAxis dataKey="subject" tick={false} />
            <PolarRadiusAxis 
              angle={180} 
              domain={[0, 100]} 
              tick={{ fill: '#9CA3AF', fontSize: 10 }}
              axisLine={false}
            />
            <Radar
              name="得分"
              dataKey="A"
              stroke={getScoreColor(score)}
              fill={getScoreColor(score)}
              fillOpacity={0.8}
              strokeWidth={3}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center -mt-8">
        <p className="text-3xl font-bold" style={{ color: getScoreColor(score) }}>
          {score}
        </p>
        <p className="text-sm text-gray-600">{getScoreLevel(score)}</p>
        {label && <p className="text-xs text-gray-500">{label}</p>}
      </div>
    </div>
  )
}
