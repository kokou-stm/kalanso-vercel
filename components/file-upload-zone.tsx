"use client"

import type React from "react"

import { Upload, X, FileIcon, Video, FileText, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useTranslation } from "@/lib/i18n/use-translation"
import type { UploadedFile } from "@/types/instructor"

interface FileUploadZoneProps {
  files: UploadedFile[]
  onFilesAdd: (files: File[]) => void
  onFileRemove: (fileId: string) => void
  maxFiles?: number
}

export function FileUploadZone({ files, onFilesAdd, onFileRemove, maxFiles = 10 }: FileUploadZoneProps) {
  const { t } = useTranslation()

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files)
    if (files.length + droppedFiles.length <= maxFiles) {
      onFilesAdd(droppedFiles)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      if (files.length + selectedFiles.length <= maxFiles) {
        onFilesAdd(selectedFiles)
      }
    }
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("video/")) return <Video className="h-5 w-5 text-purple-500" />
    if (type.includes("pdf")) return <FileText className="h-5 w-5 text-red-500" />
    return <FileIcon className="h-5 w-5 text-gray-500" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-sm text-gray-600 mb-2">{t("instructor.upload.dropzoneText")}</p>
        <p className="text-xs text-gray-500">{t("instructor.upload.dropzoneHint")}</p>
        <input
          id="file-input"
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="video/*,.pdf,.doc,.docx,.ppt,.pptx"
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">{t("instructor.upload.uploadedFiles")}</p>
          {files.map((file) => (
            <Card key={file.id} className="p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getFileIcon(file.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)} • {file.type.split("/")[1].toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {file.uploadProgress !== undefined && file.uploadProgress < 100 ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                      <span className="text-xs text-gray-600">{file.uploadProgress}%</span>
                    </div>
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onFileRemove(file.id)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {file.uploadProgress !== undefined && file.uploadProgress < 100 && (
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${file.uploadProgress}%` }}
                  />
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
