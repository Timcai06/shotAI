'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Upload, X, Video, AlertCircle, ChevronLeft, CheckCircle } from 'lucide-react'
import { cn, formatFileSize } from '@/lib/utils'
import type { CameraAngle, LightingCondition } from '@/types'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const ALLOWED_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v']

export default function UploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [cameraAngle, setCameraAngle] = useState<CameraAngle>('side')
  const [lightingCondition, setLightingCondition] = useState<LightingCondition>('good')

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return '不支持的文件格式。请上传 MP4, MOV, 或 WebM 格式的视频。'
    }
    if (file.size > MAX_FILE_SIZE) {
      return `文件过大 (${formatFileSize(file.size)})。最大支持 50MB。`
    }
    return null
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    setError(null)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      const validationError = validateFile(droppedFile)
      if (validationError) {
        setError(validationError)
      } else {
        setFile(droppedFile)
      }
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      const validationError = validateFile(selectedFile)
      if (validationError) {
        setError(validationError)
      } else {
        setFile(selectedFile)
      }
    }
  }, [])

  const clearFile = () => {
    setFile(null)
    setError(null)
    setUploadProgress(0)
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('video', file)
      formData.append('camera_angle', cameraAngle)
      formData.append('lighting_condition', lightingCondition)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '上传失败')
      }

      const data = await response.json()
      
      router.push(`/analysis/${data.task_id}/waiting`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传过程中出现错误')
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="w-5 h-5" />
            返回首页
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">
          上传视频
        </h1>
        <p className="text-gray-600 text-center mb-8">
          上传您的投篮视频，AI将自动分析您的动作
        </p>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Upload Area */}
        <div
          className={cn(
            "relative border-2 border-dashed rounded-2xl p-12 text-center transition-all",
            dragActive
              ? "border-primary-500 bg-primary-50"
              : file
              ? "border-green-500 bg-green-50"
              : "border-gray-300 bg-white hover:border-gray-400"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="video/mp4,video/quicktime,video/webm,video/x-m4v"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading}
          />

          {file ? (
            <div className="relative">
              <button
                onClick={clearFile}
                disabled={uploading}
                className="absolute -top-2 -right-2 w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
              <Video className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">{file.name}</p>
              <p className="text-sm text-gray-500">
                {formatFileSize(file.size)}
              </p>
            </div>
          ) : (
            <>
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                拖拽视频文件到此处
              </p>
              <p className="text-sm text-gray-500 mb-4">或点击选择文件</p>
              <p className="text-xs text-gray-400">
                支持 MP4, MOV, WebM · 最大 50MB
              </p>
            </>
          )}
        </div>

        {/* Upload Options */}
        {file && !uploading && (
          <div className="mt-8 space-y-6">
            {/* Camera Angle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                拍摄角度 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'side', label: '侧面视角', recommended: true },
                  { value: 'front', label: '正面视角' },
                  { value: 'other', label: '其他角度' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setCameraAngle(option.value as CameraAngle)}
                    className={cn(
                      "relative p-4 rounded-lg border-2 text-center transition-all",
                      cameraAngle === option.value
                        ? "border-primary-600 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    {option.recommended && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                        推荐
                      </span>
                    )}
                    <span className={cn(
                      "block font-medium",
                      cameraAngle === option.value ? "text-primary-700" : "text-gray-700"
                    )}>
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
              {cameraAngle !== 'side' && (
                <p className="mt-2 text-sm text-amber-600">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  非侧面视角会降低分析准确性（误差 ±20-25°）
                </p>
              )}
            </div>

            {/* Lighting Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                光线条件
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'good', label: '良好', desc: '光线充足，无阴影' },
                  { value: 'moderate', label: '中等', desc: '光线一般，略有阴影' },
                  { value: 'poor', label: '较差', desc: '光线不足或逆光' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setLightingCondition(option.value as LightingCondition)}
                    className={cn(
                      "p-4 rounded-lg border-2 text-left transition-all",
                      lightingCondition === option.value
                        ? "border-primary-600 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <span className={cn(
                      "block font-medium mb-1",
                      lightingCondition === option.value ? "text-primary-700" : "text-gray-700"
                    )}>
                      {option.label}
                    </span>
                    <span className="text-xs text-gray-500">{option.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              className={cn(
                "w-full py-4 bg-primary-600 text-white rounded-xl font-semibold",
                "hover:bg-primary-700 transition-all active:scale-[0.98]",
                "flex items-center justify-center gap-2"
              )}
            >
              <CheckCircle className="w-5 h-5" />
              开始分析
            </button>
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">上传中...</span>
              <span className="text-sm text-gray-500">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Help Links */}
        <div className="mt-12 flex items-center justify-center gap-6 text-sm">
          <Link href="/guide" className="text-primary-600 hover:text-primary-700">
            查看拍摄指南
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/about" className="text-primary-600 hover:text-primary-700">
            AI能力边界说明
          </Link>
        </div>
      </main>
    </div>
  )
}
