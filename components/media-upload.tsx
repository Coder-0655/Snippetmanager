'use client'

import React, { useState, useRef } from 'react'
import { Upload, X, Image, Video, Eye, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

interface MediaItem {
  url: string
  type: 'image' | 'video'
  name: string
  size?: number
}

interface MediaUploadProps {
  value: MediaItem[]
  onChange: (media: MediaItem[]) => void
  maxFiles?: number
  maxFileSize?: number // in MB
  disabled?: boolean
}

export function MediaUpload({
  value = [],
  onChange,
  maxFiles = 5,
  maxFileSize = 10, // 10MB default
  disabled = false
}: MediaUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: FileList) => {
    if (disabled || uploading) return
    if (value.length + files.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`)
      return
    }

    setUploading(true)
    try {
      const newMedia: MediaItem[] = []
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Check file size
        if (file.size > maxFileSize * 1024 * 1024) {
          alert(`File ${file.name} is too large. Maximum size is ${maxFileSize}MB`)
          continue
        }

        // Check file type
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
          alert(`File ${file.name} is not a supported image or video format`)
          continue
        }

        // Convert file to base64 URL (for demo purposes)
        // In production, you'd upload to a cloud storage service
        const dataUrl = await fileToDataUrl(file)
        
        newMedia.push({
          url: dataUrl,
          type: file.type.startsWith('image/') ? 'image' : 'video',
          name: file.name,
          size: file.size
        })
      }

      onChange([...value, ...newMedia])
    } catch (error) {
      console.error('Error uploading files:', error)
      alert('Error uploading files. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const removeMedia = (index: number) => {
    const newMedia = value.filter((_, i) => i !== index)
    onChange(newMedia)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary hover:bg-primary/5'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          disabled={disabled}
        />
        
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm font-medium">
          {uploading ? 'Uploading...' : 'Drop files here or click to upload'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Supports images and videos up to {maxFileSize}MB ({maxFiles - value.length} remaining)
        </p>
      </div>

      {/* Media Preview */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((media, index) => (
            <Card key={index} className="group relative overflow-hidden">
              <CardContent className="p-2">
                {media.type === 'image' ? (
                  <div className="aspect-square bg-muted rounded overflow-hidden">
                    <img
                      src={media.url}
                      alt={media.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-muted rounded overflow-hidden relative">
                    <video
                      src={media.url}
                      className="w-full h-full object-cover"
                      controls={false}
                      muted
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Video className="h-8 w-8 text-white" />
                    </div>
                  </div>
                )}
                
                {/* Media Info */}
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-1">
                    {media.type === 'image' ? (
                      <Image className="h-3 w-3 text-muted-foreground" />
                    ) : (
                      <Video className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span className="text-xs text-muted-foreground truncate">
                      {media.name}
                    </span>
                  </div>
                  {media.size && (
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(media.size)}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Open in new tab for preview
                        window.open(media.url, '_blank')
                      }}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeMedia(index)
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary */}
      {value.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">
            {value.length} file{value.length !== 1 ? 's' : ''}
          </Badge>
          <span>•</span>
          <span>
            {value.filter(m => m.type === 'image').length} image{value.filter(m => m.type === 'image').length !== 1 ? 's' : ''}
          </span>
          {value.filter(m => m.type === 'video').length > 0 && (
            <>
              <span>•</span>
              <span>
                {value.filter(m => m.type === 'video').length} video{value.filter(m => m.type === 'video').length !== 1 ? 's' : ''}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  )
}