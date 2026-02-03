'use client'

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { PoseSequence, TimingAnalysis, ConsistencyAnalysis } from '@/types/analysis'

interface TimingLineChartProps {
  poseSequence: PoseSequence
  jointAngles?: {
    knee: number[]
    elbow: number[]
    wrist: number[]
  }
  width?: number
  height?: number
}

export function JointAnglesChart({ 
  poseSequence, 
  jointAngles,
  width = 600, 
  height = 300 
}: TimingLineChartProps) {
  const frames = poseSequence.frames.map((frame, idx) => ({
    frame: idx,
    time: (frame.timestamp / 1000).toFixed(2),
    knee: jointAngles?.knee[idx] || 0,
    elbow: jointAngles?.elbow[idx] || 0,
    wrist: jointAngles?.wrist[idx] || 0,
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">帧 {label}</p>
          <p className="text-xs text-gray-500">{payload[0].payload.time}s</p>
          {payload.map((entry: any, idx: number) => (
            <p key={idx} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value?.toFixed(1)}°
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={frames} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="frame" 
            label={{ value: '帧', position: 'insideBottomRight', offset: -5 }}
            tick={{ fill: '#6B7280', fontSize: 11 }}
          />
          <YAxis 
            label={{ value: '角度 (°)', angle: -90, position: 'insideLeft' }}
            domain={[0, 180]}
            tick={{ fill: '#6B7280', fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="knee"
            name="膝关节"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="elbow"
            name="肘关节"
            stroke="#10B981"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="wrist"
            name="腕关节"
            stroke="#F59E0B"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

interface PhaseChartProps {
  timing: TimingAnalysis
  width?: number
  height?: number
}

export function PhaseDistributionChart({ 
  timing, 
  width = 400, 
  height = 300 
}: PhaseChartProps) {
  const phaseData = [
    { name: '准备', value: timing.phases.setup.percentage, color: '#3B82F6' },
    { name: '蓄力', value: timing.phases.load.percentage, color: '#10B981' },
    { name: '出手', value: timing.phases.release.percentage, color: '#F59E0B' },
    { name: '随挥', value: timing.phases.follow_through.percentage, color: '#EF4444' },
  ]

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={phaseData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} />
          <YAxis 
            label={{ value: '占比 (%)', angle: -90, position: 'insideLeft' }}
            domain={[0, 100]}
            tick={{ fill: '#6B7280', fontSize: 11 }}
          />
          <Tooltip 
            formatter={(value: number) => [`${value.toFixed(1)}%`, '占比']}
            contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
          />
          {phaseData.map((phase, idx) => (
            <Area
              key={idx}
              dataKey="value"
              stroke={phase.color}
              strokeWidth={2}
              fill={phase.color}
              fillOpacity={0.3}
              baseValue="dataMin"
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

interface ConsistencyChartProps {
  consistency: ConsistencyAnalysis
  width?: number
  height?: number
}

export function ConsistencyComparisonChart({ 
  consistency, 
  width = 400, 
  height = 300 
}: ConsistencyChartProps) {
  const data = [
    { name: '膝关节', value: consistency.knee_angle_std, threshold: 8, color: '#3B82F6' },
    { name: '肘关节', value: consistency.elbow_angle_std, threshold: 6, color: '#10B981' },
    { name: '腕关节', value: consistency.wrist_angle_std, threshold: 4, color: '#F59E0B' },
  ]

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{item.name}</p>
          <p className="text-sm">
            标准差: <span className="font-bold" style={{ color: item.color }}>±{item.value.toFixed(1)}°</span>
          </p>
          <p className="text-xs text-gray-500">
            建议阈值: ±{item.threshold}°
          </p>
          <p className={`text-xs font-medium ${item.value <= item.threshold ? 'text-green-600' : 'text-red-600'}`}>
            {item.value <= item.threshold ? '✓ 达标' : '✗ 需改进'}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} />
          <YAxis 
            label={{ value: '标准差 (°)', angle: -90, position: 'insideLeft' }}
            domain={[0, 15]}
            tick={{ fill: '#6B7280', fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            name="实际标准差"
            stroke="#3B82F6"
            strokeWidth={3}
            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
            activeDot={{ r: 8 }}
          />
          <Line
            type="monotone"
            dataKey="threshold"
            name="建议阈值"
            stroke="#EF4444"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

interface TimelineChartProps {
  poseSequence: PoseSequence
  width?: number
  height?: number
}

export function ShootingTimelineChart({ 
  poseSequence, 
  width = 600, 
  height = 200 
}: TimelineChartProps) {
  const totalDuration = poseSequence.duration_ms
  const frames = poseSequence.frames.map((frame, idx) => ({
    frame: idx,
    time: frame.timestamp,
    progress: (frame.timestamp / totalDuration) * 100,
  }))

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={frames} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
          <defs>
            <linearGradient id="timelineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
              <stop offset="50%" stopColor="#10B981" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="time"
            tickFormatter={(value) => `${(value / 1000).toFixed(1)}s`}
            label={{ value: '时间 (秒)', position: 'insideBottomRight', offset: -5 }}
            tick={{ fill: '#6B7280', fontSize: 11 }}
          />
          <YAxis 
            tick={false}
            label={{ value: '帧进度', angle: 90, position: 'insideLeft' }}
          />
          <Tooltip 
            formatter={(value: number, name: string) => [
              name === 'time' ? `${(value / 1000).toFixed(2)}s` : `${value.toFixed(1)}%`,
              name === 'time' ? '时间' : '进度'
            ]}
            contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
          />
          <Area
            type="monotone"
            dataKey="progress"
            stroke="#3B82F6"
            strokeWidth={2}
            fill="url(#timelineGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
