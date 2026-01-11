"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle2, Play, FileText, ImageIcon, FileDown } from "lucide-react"
import { useTranslation } from "@/lib/i18n/use-translation"
import type { GLOContent } from "@/types/glo"
import ReactMarkdown from "react-markdown"

interface ContentTabProps {
  content: GLOContent[]
  isCompleted: boolean
  onMarkComplete: () => void
}

export function ContentTab({ content, isCompleted, onMarkComplete }: ContentTabProps) {
  const { t } = useTranslation()
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set([0]))

  const toggleExpand = (index: number) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedItems(newExpanded)
  }

  const getIcon = (type: GLOContent["type"]) => {
    switch (type) {
      case "video":
        return <Play className="w-5 h-5" />
      case "text":
        return <FileText className="w-5 h-5" />
      case "diagram":
        return <ImageIcon className="w-5 h-5" />
      case "pdf":
        return <FileDown className="w-5 h-5" />
    }
  }

  return (
    <div className="space-y-6">
      {content.map((item, index) => (
        <Card key={index} className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">{getIcon(item.type)}</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
              {item.description && <p className="text-sm text-gray-600">{item.description}</p>}
              {item.duration && (
                <p className="text-sm text-gray-500 mt-1">
                  {t("study.duration")}: {Math.floor(item.duration / 60)} {t("study.minutes")}
                </p>
              )}
            </div>
          </div>

          {item.type === "video" && item.url && (
            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4">
              <video controls className="w-full h-full">
                <source src={item.url} />
                {t("study.videoNotSupported")}
              </video>
            </div>
          )}

          {item.type === "text" && item.data && (
            <div className="prose max-w-none">
              <ReactMarkdown>{item.data}</ReactMarkdown>
            </div>
          )}

          {item.type === "diagram" && item.url && (
            <div className="flex justify-center">
              <img src={item.url || "/placeholder.svg"} alt={item.title} className="max-w-full rounded-lg" />
            </div>
          )}

          {item.type === "pdf" && item.url && (
            <div className="text-center">
              <Button asChild>
                <a href={item.url} download target="_blank" rel="noopener noreferrer">
                  <FileDown className="w-4 h-4 mr-2" />
                  {t("study.downloadPDF")}
                </a>
              </Button>
            </div>
          )}
        </Card>
      ))}

      <div className="flex justify-center pt-4">
        <Button size="lg" onClick={onMarkComplete} disabled={isCompleted} className="min-w-[200px]">
          {isCompleted ? (
            <>
              <CheckCircle2 className="w-5 h-5 mr-2" />
              {t("study.contentCompleted")}
            </>
          ) : (
            t("study.markContentComplete")
          )}
        </Button>
      </div>
    </div>
  )
}
