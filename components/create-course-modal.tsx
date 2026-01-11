"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useTranslation } from "@/lib/i18n/use-translation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FieldWithHelp } from "@/lib/help/HelpTooltip"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface CreateCourseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  courses?: Array<{ course_code?: string }>
}

const DOMAINS = ["Culinary", "IT & AI", "Healthcare"]

export function CreateCourseModal({ open, onOpenChange, onSuccess, courses = [] }: CreateCourseModalProps) {
  const { t, locale } = useTranslation()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [domain, setDomain] = useState("")
  const [courseCode, setCourseCode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ title?: string; domain?: string; courseCode?: string }>({})

  useEffect(() => {
    if (!courseCode) {
      setErrors((prev) => ({ ...prev, courseCode: undefined }))
      return
    }

    const timeoutId = setTimeout(() => {
      const pattern = /^[A-Z]+-[0-9]{3,}$/

      if (!pattern.test(courseCode)) {
        setErrors((prev) => ({
          ...prev,
          courseCode: t("academic.createCourse.invalidCodeFormat"),
        }))
        return
      }

      const exists = courses.some((c) => c.course_code === courseCode)
      if (exists) {
        setErrors((prev) => ({
          ...prev,
          courseCode: t("academic.createCourse.codeAlreadyExists"),
        }))
        return
      }

      setErrors((prev) => ({ ...prev, courseCode: undefined }))
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [courseCode, courses, t])

  const validateForm = () => {
    const newErrors: { title?: string; domain?: string; courseCode?: string } = {}

    if (!title.trim()) {
      newErrors.title = t("academic.createCourse.titleRequired")
    } else if (title.length > 100) {
      newErrors.title = t("academic.createCourse.titleTooLong")
    }

    if (!domain) {
      newErrors.domain = t("academic.createCourse.domainRequired")
    }

    if (errors.courseCode) {
      newErrors.courseCode = errors.courseCode
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          domain,
          courseCode: courseCode.trim() || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create course")
      }

      const data = await response.json()

      setTitle("")
      setDescription("")
      setDomain("")
      setCourseCode("")
      setErrors({})

      onOpenChange(false)
      onSuccess()

      console.log(`[v0] Course ${data.courseCode || data.id} created successfully!`)
    } catch (error) {
      console.error("[v0] Error creating course:", error)
      setErrors({ title: t("academic.createCourse.createError") })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setTitle("")
    setDescription("")
    setDomain("")
    setCourseCode("")
    setErrors({})
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("academic.createCourse.title")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldWithHelp
            label={t("academic.createCourse.courseCode")}
            section="dashboard"
            item="courseCode"
            language={locale}
          >
            <div className="space-y-2">
              <Input
                id="courseCode"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                placeholder={t("academic.createCourse.courseCodePlaceholder")}
                maxLength={20}
                className={`font-mono text-sm ${errors.courseCode ? "border-red-500" : ""}`}
                title="Format: DOMAIN-NUMBER (e.g., CUL-101)"
              />
              {errors.courseCode && <p className="text-sm text-red-500">{errors.courseCode}</p>}
              {courseCode && !errors.courseCode && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <span>✓</span> {t("academic.createCourse.codeAvailable")}
                </p>
              )}
              <p className="text-xs text-gray-500">{t("academic.createCourse.courseCodeHint")}</p>
            </div>
          </FieldWithHelp>

          <FieldWithHelp
            label={t("academic.createCourse.courseTitle")}
            section="dashboard"
            item="courseTitle"
            language={locale}
            required
          >
            <div className="space-y-2">
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("academic.createCourse.titlePlaceholder")}
                maxLength={100}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
              <p className="text-xs text-gray-500">
                {title.length}/100 {t("academic.createCourse.characters")}
              </p>
            </div>
          </FieldWithHelp>

          <FieldWithHelp
            label={t("academic.createCourse.description")}
            section="dashboard"
            item="description"
            language={locale}
          >
            <div className="space-y-2">
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("academic.createCourse.descriptionPlaceholder")}
                maxLength={500}
                rows={4}
              />
              <p className="text-xs text-gray-500">
                {description.length}/500 {t("academic.createCourse.characters")}
              </p>
            </div>
          </FieldWithHelp>

          <FieldWithHelp
            label={t("academic.createCourse.domain")}
            section="dashboard"
            item="domain"
            language={locale}
            required
          >
            <div className="space-y-2">
              <Select value={domain} onValueChange={setDomain}>
                <SelectTrigger className={errors.domain ? "border-red-500" : ""}>
                  <SelectValue placeholder={t("academic.createCourse.selectDomain")} />
                </SelectTrigger>
                <SelectContent>
                  {DOMAINS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.domain && <p className="text-sm text-red-500">{errors.domain}</p>}
            </div>
          </FieldWithHelp>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
              {t("academic.createCourse.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("academic.createCourse.creating")}
                </>
              ) : (
                t("academic.createCourse.create")
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
