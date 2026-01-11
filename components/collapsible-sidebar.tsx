"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { X, Info } from "lucide-react"
import { useTranslation } from "@/lib/i18n/use-translation"

interface CollapsibleSidebarProps {
  children: React.ReactNode
}

export function CollapsibleSidebar({ children }: CollapsibleSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartY, setDragStartY] = useState(0)
  const [dragCurrentY, setDragCurrentY] = useState(0)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setDragStartY(e.touches[0].clientY)
    setDragCurrentY(e.touches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    const currentY = e.touches[0].clientY
    setDragCurrentY(currentY)
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    setIsDragging(false)

    const dragDistance = dragCurrentY - dragStartY
    // If dragged down more than 100px, close the sidebar
    if (dragDistance > 100) {
      setIsOpen(false)
    }
    setDragCurrentY(0)
    setDragStartY(0)
  }

  const dragOffset = isDragging && dragCurrentY > dragStartY ? dragCurrentY - dragStartY : 0

  const handleBackdropClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(false)
  }

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(false)
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="fixed z-40 bottom-6 right-6 shadow-lg cursor-pointer bg-white hover:bg-gray-50"
        size="lg"
      >
        <Info className="h-5 w-5 lg:mr-2" />
        <span className="hidden lg:inline">{t("dashboard.sidebar.toggle")}</span>
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[45] transition-opacity"
          onClick={handleBackdropClick}
          role="button"
          aria-label="Close sidebar"
        />
      )}

      {isOpen && (
        <div
          ref={sidebarRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            transform: `translateY(${dragOffset}px)`,
          }}
          className="fixed z-[50] bg-white shadow-2xl transition-transform duration-300 ease-out
            lg:top-0 lg:right-0 lg:h-full lg:w-[440px]
            bottom-0 left-0 right-0 max-h-[85vh] rounded-t-3xl"
        >
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-3xl lg:rounded-none z-10">
            <div
              className="lg:hidden w-12 h-1.5 bg-gray-400 rounded-full absolute top-2 left-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />

            <h2 className="text-lg font-semibold text-gray-900 mt-4 lg:mt-0">{t("dashboard.sidebar.title")}</h2>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="cursor-pointer hover:bg-gray-100 relative z-20"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="overflow-y-auto h-[calc(100%-64px)] p-6 space-y-6">{children}</div>
        </div>
      )}
    </>
  )
}
