'use client'

import { useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { PoseSequence, PoseFrame, Landmark } from '@/types/analysis'

const POSE_CONNECTIONS = [
  [11, 12], [11, 23], [12, 24], [23, 24],
  [23, 25], [25, 27], [27, 29], [27, 31],
  [24, 26], [26, 28], [28, 30], [28, 32],
  [11, 13], [13, 15], [15, 17], [15, 19], [15, 21],
  [12, 14], [14, 16], [16, 18], [16, 20], [16, 22],
]

const JOINT_COLOR = '#3B82F6'
const BONE_COLOR = '#1E40AF'

interface Skeleton3DViewerProps {
  poseSequence: PoseSequence
  width?: number
  height?: number
}

function SkeletonScene({ 
  poseSequence, 
  isPlaying, 
  currentFrame 
}: { 
  poseSequence: PoseSequence
  isPlaying: boolean
  currentFrame: number
}) {
  const [frameIndex, setFrameIndex] = useState(currentFrame)
  
  useFrame((state) => {
    if (isPlaying && poseSequence.frames.length > 1) {
      const fps = poseSequence.fps
      const delta = state.clock.getDelta()
      const frameDelta = Math.floor(delta * fps)
      
      setFrameIndex(prev => {
        const next = prev + frameDelta
        if (next >= poseSequence.frames.length) {
          return 0
        }
        return next
      })
    }
  })
  
  const frame = poseSequence.frames[frameIndex] || poseSequence.frames[0]
  
  const landmarks = frame.landmarks.map(l => ({
    x: l.x,
    y: 1 - l.y,
    z: l.z
  }))
  
  return (
    <group>
      {POSE_CONNECTIONS.map(([startIdx, endIdx], idx) => {
        const start = landmarks[startIdx]
        const end = landmarks[endIdx]
        
        const startVec = new THREE.Vector3(start.x, start.y, start.z)
        const endVec = new THREE.Vector3(end.x, end.y, end.z)
        const direction = new THREE.Vector3().subVectors(endVec, startVec)
        const length = direction.length()
        const center = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5)
        
        const quaternion = new THREE.Quaternion()
        const up = new THREE.Vector3(0, 1, 0)
        quaternion.setFromUnitVectors(up, direction.normalize())
        
        return (
          <mesh 
            key={idx}
            position={center}
            quaternion={quaternion}
          >
            <cylinderGeometry args={[0.008, 0.008, length, 8]} />
            <meshStandardMaterial color={BONE_COLOR} />
          </mesh>
        )
      })}
      
      {landmarks.map((landmark, idx) => (
        <mesh key={`joint-${idx}`} position={[landmark.x, landmark.y, landmark.z]}>
          <sphereGeometry args={[0.025, 16, 16]} />
          <meshStandardMaterial color={JOINT_COLOR} emissive={JOINT_COLOR} emissiveIntensity={0.3} />
        </mesh>
      ))}
    </group>
  )
}

export function Skeleton3DViewer({ 
  poseSequence, 
  width = 800, 
  height = 500 
}: Skeleton3DViewerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentFrame, setCurrentFrame] = useState(0)
  
  const handlePrevious = () => {
    setCurrentFrame(prev => Math.max(0, prev - 1))
    setIsPlaying(false)
  }
  
  const handleNext = () => {
    setCurrentFrame(prev => Math.min(poseSequence.frames.length - 1, prev + 1))
    setIsPlaying(false)
  }
  
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentFrame(parseInt(e.target.value))
    setIsPlaying(false)
  }
  
  const formatTime = (frameIndex: number) => {
    const timeMs = (frameIndex / poseSequence.fps) * 1000
    return `${(timeMs / 1000).toFixed(2)}s`
  }
  
  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ width, height }}>
      <Canvas
        camera={{ position: [0.5, 1, 1.5], fov: 50 }}
        frameloop="demand"
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[1, 2, 1]} intensity={0.8} />
        <pointLight position={[-1, 2, -1]} intensity={0.4} />
        
        <SkeletonScene
          poseSequence={poseSequence}
          isPlaying={isPlaying}
          currentFrame={currentFrame}
        />
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={0.5}
          maxDistance={3}
        />
        
        <gridHelper args={[2, 20, '#444', '#222']} position={[0.5, 0, 0.5]} />
      </Canvas>
      
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="mb-3">
          <input
            type="range"
            min={0}
            max={poseSequence.frames.length - 1}
            value={currentFrame}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevious}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>
            
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              {isPlaying ? (
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            
            <button
              onClick={handleNext}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>
          </div>
          
          <div className="text-white text-sm">
            <span className="font-mono">{formatTime(currentFrame)}</span>
            <span className="mx-2 text-gray-400">/</span>
            <span className="font-mono">{formatTime(poseSequence.frames.length - 1)}</span>
          </div>
        </div>
      </div>
      
      <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
        {currentFrame + 1} / {poseSequence.frames.length} 帧
      </div>
      
      <div className="absolute top-4 left-4 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
        拖动旋转 | 滚轮缩放
      </div>
    </div>
  )
}

export function SkeletonStaticView({ 
  poseSequence, 
  frameIndex = 0,
  width = 400,
  height = 400
}: { 
  poseSequence: PoseSequence
  frameIndex?: number
  width?: number
  height?: number
}) {
  const frame = poseSequence.frames[frameIndex] || poseSequence.frames[0]
  
  const landmarks = frame.landmarks.map(l => ({
    x: l.x,
    y: 1 - l.y,
    z: l.z
  }))
  
  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ width, height }}>
      <Canvas
        camera={{ position: [0.5, 1, 1.5], fov: 50 }}
        frameloop="demand"
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[1, 2, 1]} intensity={0.8} />
        
        <group>
          {POSE_CONNECTIONS.map(([startIdx, endIdx], idx) => {
            const start = landmarks[startIdx]
            const end = landmarks[endIdx]
            
            const startVec = new THREE.Vector3(start.x, start.y, start.z)
            const endVec = new THREE.Vector3(end.x, end.y, end.z)
            const direction = new THREE.Vector3().subVectors(endVec, startVec)
            const length = direction.length()
            const center = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5)
            
            const quaternion = new THREE.Quaternion()
            const up = new THREE.Vector3(0, 1, 0)
            quaternion.setFromUnitVectors(up, direction.normalize())
            
            return (
              <mesh 
                key={idx}
                position={center}
                quaternion={quaternion}
              >
                <cylinderGeometry args={[0.008, 0.008, length, 8]} />
                <meshStandardMaterial color={BONE_COLOR} />
              </mesh>
            )
          })}
          
          {landmarks.map((landmark, idx) => (
            <mesh key={`joint-${idx}`} position={[landmark.x, landmark.y, landmark.z]}>
              <sphereGeometry args={[0.025, 16, 16]} />
              <meshStandardMaterial color={JOINT_COLOR} emissive={JOINT_COLOR} emissiveIntensity={0.3} />
            </mesh>
          ))}
        </group>
        
        <OrbitControls enableZoom={false} enableRotate={true} />
        <gridHelper args={[2, 20, '#444', '#222']} position={[0.5, 0, 0.5]} />
      </Canvas>
    </div>
  )
}
