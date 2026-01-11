"use client"

import type React from "react"
import { useTranslation } from "@/lib/i18n/use-translation"
import type { Course } from "@/types/academic"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Upload,
  Search,
  FileVideo,
  FileText,
  LinkIcon,
  File,
  GripVertical,
  MoreVertical,
  X,
  ChevronRight,
  Home,
  Filter,
  CheckSquare,
  Square,
  AlertCircle,
  FileAudio,
  FileImage,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { createBrowserClient } from "@/lib/supabase/client"
import { HelpButton, HelpPanel } from "@/lib/help/HelpPanel"
import { HelpTooltip } from "@/lib/help/HelpTooltip"
import { useState, useEffect } from "react"
import { EmptyStateWithHelp } from "@/lib/help/HelpModal"
import { AIContentRecommendations } from "./ai-content-recommendations"

interface ContentItem {
  id: string
  title: string
  description: string | null
  content_type: string
  file_url: string | null
  file_size_bytes: number | null
  duration_minutes: number | null
  thumbnail_url: string | null
  tags: string[] | null
  assigned_to: string | null
  assignment_order: number | null
  is_required: boolean
}

interface Class {
  id: string
  course_id: string
  class_number: number
  title: string
  description: string | null
  schedule_week: number | null
  sequence_order: number
  is_published: boolean
  sessions: Session[]
}

interface Session {
  id: string
  class_id: string
  session_number: string
  title: string
  description: string | null
  estimated_minutes: number | null
  sequence_order: number
  is_published: boolean
}

interface ContentMappingTabProps {
  course: Course
  onSave: () => void
  activeTab?: string
  onTabChange?: (tab: string) => void
  language: string
  onNavigateToTab: (tab: string) => void
}

export function ContentMappingTab({ course, language, onSave, activeTab, onTabChange }: ContentMappingTabProps) {
  const { t, locale } = useTranslation()
  const { toast } = useToast()
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [bulkMode, setBulkMode] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [helpPanelOpen, setHelpPanelOpen] = useState(false)
  const [classes, setClasses] = useState<Class[]>([])
  const [isLoadingStructure, setIsLoadingStructure] = useState(false)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)

  // Fetch content items
  useEffect(() => {
    fetchContentItems()
  }, [])

  useEffect(() => {
    if (course?.id) {
      fetchCourseStructure()
    }
  }, [course?.id])

  const fetchCourseStructure = async () => {
    try {
      setIsLoadingStructure(true)
      const supabase = createBrowserClient()

      // Fetch classes for this course
      const { data: classesData, error: classesError } = await supabase
        .from("classes")
        .select("*")
        .eq("course_id", course.id)
        .order("sequence_order", { ascending: true })

      if (classesError) throw classesError

      // For each class, fetch its sessions
      const classesWithSessions = await Promise.all(
        (classesData || []).map(async (classItem) => {
          const { data: sessionsData, error: sessionsError } = await supabase
            .from("sessions")
            .select("*")
            .eq("class_id", classItem.id)
            .order("sequence_order", { ascending: true })

          if (sessionsError) {
            console.error("[v0] Error fetching sessions for class:", classItem.id, sessionsError)
            return { ...classItem, sessions: [] }
          }

          return { ...classItem, sessions: sessionsData || [] }
        }),
      )

      console.log("[v0] Loaded course structure:", classesWithSessions)
      setClasses(classesWithSessions)
    } catch (error) {
      console.error("[v0] Error fetching course structure:", error)
      toast({
        title: t("academic.contentMapping.error"),
        description: "Failed to load course structure",
        variant: "destructive",
      })
    } finally {
      setIsLoadingStructure(false)
    }
  }

  const fetchContentItems = async () => {
    try {
      setIsLoading(true)
      const supabase = createBrowserClient()
      const { data, error } = await supabase.from("content_items").select("*").order("created_at", { ascending: false })

      if (error) throw error
      console.log("[v0] Loaded content items:", data?.length)
      setContentItems(data || [])
    } catch (error) {
      console.error("[v0] Error fetching content items:", error)
      toast({
        title: t("academic.contentMapping.error"),
        description: t("academic.contentMapping.fetchError"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filter content
  const filteredContent = contentItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || item.content_type === typeFilter
    return matchesSearch && matchesType
  })

  const unassignedContent = filteredContent.filter((item) => !item.assigned_to)
  const assignedContent = filteredContent.filter((item) => item.assigned_to)

  const getContentIcon = (type: string) => {
    switch (type) {
      case "video":
        return { icon: FileVideo, color: "bg-blue-500" }
      case "pdf":
        return { icon: FileText, color: "bg-red-500" }
      case "document":
        return { icon: FileText, color: "bg-green-500" }
      case "link":
        return { icon: LinkIcon, color: "bg-orange-500" }
      case "quiz":
        return { icon: File, color: "bg-indigo-500" }
      case "audio":
        return { icon: FileAudio, color: "bg-purple-500" }
      case "image":
        return { icon: FileImage, color: "bg-pink-500" }
      default:
        return { icon: File, color: "bg-gray-500" }
    }
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return ""
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  const handleAssignContent = async (contentId: string, sessionId: string) => {
    try {
      console.log("[v0] Assigning content", contentId, "to session", sessionId)
      const supabase = createBrowserClient()
      const { error } = await supabase.from("content_items").update({ assigned_to: sessionId }).eq("id", contentId)

      if (error) throw error

      await fetchContentItems()
      toast({
        title: t("academic.contentMapping.success"),
        description: t("academic.contentMapping.contentAssigned"),
      })
      onSave()
    } catch (error) {
      console.error("[v0] Error assigning content:", error)
      toast({
        title: t("academic.contentMapping.error"),
        description: t("academic.contentMapping.assignError"),
        variant: "destructive",
      })
    }
  }

  const handleUnassignContent = async (contentId: string) => {
    try {
      const supabase = createBrowserClient()
      const { error } = await supabase
        .from("content_items")
        .update({ assigned_to: null, assignment_order: null })
        .eq("id", contentId)

      if (error) throw error

      await fetchContentItems()
      toast({
        title: t("academic.contentMapping.success"),
        description: t("academic.contentMapping.contentUnassigned"),
      })
      onSave()
    } catch (error) {
      console.error("[v0] Error unassigning content:", error)
      toast({
        title: t("academic.contentMapping.error"),
        variant: "destructive",
      })
    }
  }

  const handleDeleteContent = async (contentId: string) => {
    if (!confirm(t("academic.contentMapping.confirmDelete"))) return

    try {
      const supabase = createBrowserClient()
      const { error } = await supabase.from("content_items").delete().eq("id", contentId)

      if (error) throw error

      await fetchContentItems()
      toast({
        title: t("academic.contentMapping.success"),
        description: t("academic.contentMapping.contentDeleted"),
      })
    } catch (error) {
      console.error("[v0] Error deleting content:", error)
      toast({
        title: t("academic.contentMapping.error"),
        variant: "destructive",
      })
    }
  }

  const toggleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Home className="w-4 h-4" />
          <ChevronRight className="w-4 h-4" />
          <span>{t("academic.sidebar.title")}</span>
          <ChevronRight className="w-4 h-4" />
          <span className="font-medium">{course.code}</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground">{t("academic.tabs.contentMapping")}</span>
        </div>
        <div className="flex items-center gap-2">
          <HelpButton language={locale} onClick={() => setHelpPanelOpen(true)} />
          <Button onClick={() => setIsUploadModalOpen(true)} className="gap-2">
            <Upload className="w-4 h-4" />
            {t("academic.contentMapping.uploadContent")}
            <HelpTooltip section="content" item="upload" language={locale} side="right" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("academic.contentMapping.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("academic.contentMapping.allTypes")}</SelectItem>
            <SelectItem value="video">{t("academic.contentMapping.videos")}</SelectItem>
            <SelectItem value="pdf">{t("academic.contentMapping.pdfs")}</SelectItem>
            <SelectItem value="document">{t("academic.contentMapping.documents")}</SelectItem>
            <SelectItem value="audio">{t("academic.contentMapping.audio")}</SelectItem>
            <SelectItem value="image">{t("academic.contentMapping.images")}</SelectItem>
            <SelectItem value="link">{t("academic.contentMapping.links")}</SelectItem>
            <SelectItem value="quiz">{t("academic.contentMapping.quizzes")}</SelectItem>
          </SelectContent>
        </Select>
        <HelpTooltip section="content" item="contentTypes" language={locale} side="right" />
        <Button
          variant={bulkMode ? "default" : "outline"}
          onClick={() => {
            setBulkMode(!bulkMode)
            setSelectedItems(new Set())
          }}
          className="gap-2"
        >
          {bulkMode ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
          {t("academic.contentMapping.bulkMode")}
        </Button>
      </div>

      {/* Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
        {/* Left Panel - Content Library */}
        <div className="flex flex-col overflow-hidden border rounded-lg bg-card">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-lg">{t("academic.contentMapping.contentLibrary")}</h3>
            <p className="text-sm text-muted-foreground">{t("academic.contentMapping.dragToAssign")}</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">{t("academic.contentMapping.loading")}</div>
            ) : unassignedContent.length === 0 ? (
              <EmptyStateWithHelp
                section="content"
                item="emptyLibrary"
                language={locale}
                icon={<FileText className="h-12 w-12 text-gray-400" />}
                primaryAction={{
                  label:
                    locale === "fr"
                      ? "Télécharger du Contenu"
                      : locale === "de"
                        ? "Inhalt Hochladen"
                        : "Upload Content",
                  onClick: () => setIsUploadModalOpen(true),
                }}
                secondaryAction={{
                  label: locale === "fr" ? "En savoir plus" : locale === "de" ? "Mehr erfahren" : "Learn more",
                  onClick: () => setHelpPanelOpen(true),
                }}
              />
            ) : (
              <div className="space-y-3">
                {unassignedContent.map((item) => (
                  <ContentCard
                    key={item.id}
                    item={item}
                    bulkMode={bulkMode}
                    isSelected={selectedItems.has(item.id)}
                    onToggleSelect={() => toggleSelectItem(item.id)}
                    onDragStart={() => setDraggedItem(item.id)}
                    onDragEnd={() => setDraggedItem(null)}
                    onEdit={() => {
                      setEditingContent(item)
                      setIsEditModalOpen(true)
                    }}
                    onDelete={() => handleDeleteContent(item.id)}
                    getContentIcon={getContentIcon}
                    formatFileSize={formatFileSize}
                    isDragging={draggedItem === item.id}
                  />
                ))}
              </div>
            )}
            <div className="mt-4 text-sm text-muted-foreground text-center">
              {unassignedContent.length} {locale === "fr" ? "éléments" : locale === "de" ? "Elemente" : "items"}
            </div>
          </div>
        </div>

        {/* Right Panel - Course Structure */}
        <div className="flex flex-col overflow-hidden border rounded-lg bg-card">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-lg">{course.title}</h3>
            <p className="text-sm text-muted-foreground">
              {locale === "fr"
                ? "Déposez le contenu dans les sessions"
                : locale === "de"
                  ? "Inhalt in Sitzungen ablegen"
                  : "Drop content into sessions"}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {isLoadingStructure ? (
              <div className="text-center py-8 text-muted-foreground">
                {locale === "fr" ? "Chargement..." : locale === "de" ? "Lädt..." : "Loading..."}
              </div>
            ) : classes.length === 0 ? (
              <EmptyStateWithHelp
                section="content"
                item="emptyStructure"
                language={locale}
                icon={<AlertCircle className="h-12 w-12 text-gray-400" />}
                primaryAction={{
                  label:
                    locale === "fr" ? "Aller au Calendrier" : locale === "de" ? "Zum Zeitstrahl" : "Go to Timeline",
                  onClick: () => onTabChange?.("structure"),
                }}
                secondaryAction={{
                  label: locale === "fr" ? "En savoir plus" : locale === "de" ? "Mehr erfahren" : "Learn more",
                  onClick: () => setHelpPanelOpen(true),
                }}
              />
            ) : (
              <Accordion type="multiple" defaultValue={[classes[0]?.id]} className="space-y-3">
                {classes.map((classItem) => (
                  <AccordionItem key={classItem.id} value={classItem.id} className="border rounded-lg">
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{classItem.title}</span>
                        {classItem.schedule_week && (
                          <Badge variant="outline">
                            {locale === "fr"
                              ? `Semaine ${classItem.schedule_week}`
                              : locale === "de"
                                ? `Woche ${classItem.schedule_week}`
                                : `Week ${classItem.schedule_week}`}
                          </Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      {classItem.sessions.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground text-sm">
                          {locale === "fr"
                            ? "Aucune session dans cette classe"
                            : locale === "de"
                              ? "Keine Sitzungen in dieser Klasse"
                              : "No sessions in this class"}
                        </div>
                      ) : (
                        <div className="space-y-2 mt-2">
                          {classItem.sessions.map((session) => (
                            <SessionDropZone
                              key={session.id}
                              session={session}
                              assignedContent={assignedContent.filter((c) => c.assigned_to === session.id)}
                              onDrop={(contentId) => handleAssignContent(contentId, session.id)}
                              onUnassign={handleUnassignContent}
                              draggedItem={draggedItem}
                              getContentIcon={getContentIcon}
                              locale={locale}
                              setSelectedSessionId={() => setSelectedSessionId(session.id)}
                            />
                          ))}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </div>
      </div>

      {/* AI Content Recommendations */}
      {console.log("[v0] Selected session ID:", selectedSessionId)}
      {selectedSessionId && (
        <div className="mt-6">
          {console.log("[v0] Rendering AI Content Recommendations for session:", selectedSessionId)}
          <AIContentRecommendations
            sessionId={selectedSessionId}
            sessionTitle={
              classes.flatMap((c) => c.sessions || []).find((s) => s.id === selectedSessionId)?.title ||
              "Unknown Session"
            }
            sessionDuration={
              classes.flatMap((c) => c.sessions || []).find((s) => s.id === selectedSessionId)?.estimated_minutes || 90
            }
            learningObjectives={[]}
            onAddContent={async (contentIds) => {
              console.log("[v0] Adding recommended content:", contentIds)
              // Implement adding recommended content to session
            }}
            language={locale}
          />
        </div>
      )}

      {/* Upload Modal */}
      <UploadContentModal
        open={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => {
          fetchContentItems()
          setIsUploadModalOpen(false)
        }}
        locale={locale}
      />

      {/* Edit Modal */}
      {editingContent && (
        <EditContentModal
          open={isEditModalOpen}
          content={editingContent}
          onClose={() => {
            setIsEditModalOpen(false)
            setEditingContent(null)
          }}
          onSuccess={() => {
            fetchContentItems()
            setIsEditModalOpen(false)
            setEditingContent(null)
          }}
          locale={locale}
        />
      )}

      {/* Help Panel */}
      <HelpPanel isOpen={helpPanelOpen} onClose={() => setHelpPanelOpen(false)} section="content" language={locale} />
    </div>
  )
}

// Content Card Component
function ContentCard({
  item,
  bulkMode,
  isSelected,
  onToggleSelect,
  onDragStart,
  onDragEnd,
  onEdit,
  onDelete,
  getContentIcon,
  formatFileSize,
  isDragging,
}: any) {
  const { t } = useTranslation()
  const { icon: Icon, color } = getContentIcon(item.content_type)

  return (
    <Card
      className={`group relative p-3 cursor-move hover:shadow-lg transition-all ${
        isDragging ? "opacity-50 scale-95" : "hover:-translate-y-1"
      }`}
      draggable={!bulkMode}
      onDragStart={(e) => {
        e.dataTransfer.setData("contentId", item.id)
        e.dataTransfer.effectAllowed = "copy"
        console.log("[v0] Drag started:", item.id)
        onDragStart()
      }}
      onDragEnd={() => {
        console.log("[v0] Drag ended")
        onDragEnd()
      }}
    >
      {bulkMode && (
        <Checkbox checked={isSelected} onCheckedChange={onToggleSelect} className="absolute top-2 left-2 z-10" />
      )}
      <div className="flex items-start gap-2">
        <div className={`${color} p-2 rounded-lg text-white flex-shrink-0`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{item.title}</h4>
          {item.duration_minutes && (
            <Badge variant="secondary" className="mt-1 text-xs">
              {item.duration_minutes} {t("academic.structure.minutes")}
            </Badge>
          )}
          {item.file_size_bytes && (
            <span className="text-xs text-muted-foreground block mt-1">{formatFileSize(item.file_size_bytes)}</span>
          )}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {item.tags.slice(0, 2).map((tag: string, i: number) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>{t("academic.structure.edit")}</DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} className="text-destructive">
            {t("academic.structure.delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Card>
  )
}

// Session Drop Zone Component
function SessionDropZone({
  session,
  assignedContent,
  onDrop,
  onUnassign,
  draggedItem,
  getContentIcon,
  locale,
  setSelectedSessionId,
}: any) {
  const { t } = useTranslation()
  const [isDragOver, setIsDragOver] = useState(false)

  return (
    <div
      className={`p-3 border-2 border-dashed rounded-lg transition-all ${
        isDragOver ? "border-purple-500 bg-purple-50 dark:bg-purple-950/20" : "border-border"
      } ${draggedItem ? "border-purple-300" : ""}`}
      onDragOver={(e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = "copy"
        setIsDragOver(true)
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragOver(false)
        const contentId = e.dataTransfer.getData("contentId")
        console.log("[v0] Dropped content:", contentId, "on session:", session.id)
        if (contentId) onDrop(contentId)
      }}
      onClick={() => setSelectedSessionId(session.id)}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-sm">
          {session.session_number}: {session.title}
        </h4>
        {session.estimated_minutes && (
          <Badge variant="secondary" className="text-xs">
            {session.estimated_minutes} {locale === "fr" ? "min" : locale === "de" ? "Min" : "min"}
          </Badge>
        )}
      </div>
      {assignedContent.length > 0 ? (
        <div className="space-y-2">
          {assignedContent.map((content: ContentItem) => {
            const { icon: Icon, color } = getContentIcon(content.content_type)
            return (
              <div key={content.id} className="flex items-center gap-2 p-2 bg-muted rounded text-sm group">
                <div className={`${color} p-1 rounded text-white`}>
                  <Icon className="w-3 h-3" />
                </div>
                <span className="flex-1 truncate">{content.title}</span>
                {content.is_required && (
                  <Badge variant="default" className="text-xs">
                    {locale === "fr" ? "Requis" : locale === "de" ? "Erforderlich" : "Required"}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                  onClick={() => onUnassign(content.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-xs">
            {locale === "fr" ? "Déposez le contenu ici" : locale === "de" ? "Inhalt hier ablegen" : "Drop content here"}
          </p>
        </div>
      )}
    </div>
  )
}

// Upload Content Modal Component
function UploadContentModal({ open, onClose, onSuccess, locale }: any) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content_type: "document",
    file_url: "",
    file_size_bytes: null as number | null,
    duration_minutes: null as number | null,
    tags: "",
    is_required: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title) {
      toast({
        title: t("academic.contentMapping.error"),
        description: t("academic.contentMapping.titleRequired"),
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      const supabase = createBrowserClient()
      const { error } = await supabase.from("content_items").insert({
        title: formData.title,
        description: formData.description || null,
        content_type: formData.content_type,
        file_url: formData.file_url || null,
        file_size_bytes: formData.file_size_bytes,
        duration_minutes: formData.duration_minutes,
        tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()) : null,
        is_required: formData.is_required,
      })

      if (error) throw error

      toast({
        title: t("academic.contentMapping.success"),
        description: t("academic.contentMapping.contentUploaded"),
      })
      onSuccess()
    } catch (error) {
      console.error("[v0] Error uploading content:", error)
      toast({
        title: t("academic.contentMapping.error"),
        description: t("academic.contentMapping.uploadError"),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("academic.contentMapping.uploadContent")}</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="file">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file">{t("academic.contentMapping.uploadFile")}</TabsTrigger>
            <TabsTrigger value="link">{t("academic.contentMapping.addLink")}</TabsTrigger>
          </TabsList>
          <TabsContent value="file" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>{t("academic.contentMapping.title")} *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={t("academic.contentMapping.titlePlaceholder")}
                />
              </div>
              <div>
                <Label>{t("academic.contentMapping.description")}</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t("academic.contentMapping.descriptionPlaceholder")}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t("academic.contentMapping.type")}</Label>
                  <Select
                    value={formData.content_type}
                    onValueChange={(value) => setFormData({ ...formData, content_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">
                        <div className="flex items-center gap-2">
                          {t("academic.contentMapping.video")}
                          {/* <HelpTooltip section="content" item="videoType" language={locale} side="right" /> */}
                        </div>
                      </SelectItem>
                      <SelectItem value="pdf">
                        <div className="flex items-center gap-2">
                          PDF
                          {/* <HelpTooltip section="content" item="pdfType" language={locale} side="right" /> */}
                        </div>
                      </SelectItem>
                      <SelectItem value="document">
                        <div className="flex items-center gap-2">
                          {t("academic.contentMapping.document")}
                          {/* <HelpTooltip section="content" item="documentType" language={locale} side="right" /> */}
                        </div>
                      </SelectItem>
                      <SelectItem value="audio">
                        <div className="flex items-center gap-2">
                          {t("academic.contentMapping.audio")}
                          {/* <HelpTooltip section="content" item="audioType" language={locale} side="right" /> */}
                        </div>
                      </SelectItem>
                      <SelectItem value="image">
                        <div className="flex items-center gap-2">
                          {t("academic.contentMapping.image")}
                          {/* <HelpTooltip section="content" item="imageType" language={locale} side="right" /> */}
                        </div>
                      </SelectItem>
                      <SelectItem value="link">
                        <div className="flex items-center gap-2">
                          {t("academic.contentMapping.link")}
                          {/* <HelpTooltip section="content" item="linkType" language={locale} side="right" /> */}
                        </div>
                      </SelectItem>
                      <SelectItem value="quiz">
                        <div className="flex items-center gap-2">
                          {t("academic.contentMapping.quiz")}
                          {/* <HelpTooltip section="content" item="quizType" language={locale} side="right" /> */}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>
                    {t("academic.contentMapping.duration")} ({t("academic.structure.minutes")})
                  </Label>
                  <Input
                    type="number"
                    value={formData.duration_minutes || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, duration_minutes: e.target.value ? Number(e.target.value) : null })
                    }
                    placeholder="30"
                  />
                </div>
              </div>
              <div>
                <Label>{t("academic.contentMapping.fileUrl")}</Label>
                <Input
                  value={formData.file_url}
                  onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                  placeholder="https://example.com/file.pdf"
                />
              </div>
              <div>
                <Label>{t("academic.contentMapping.tags")}</Label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder={t("academic.contentMapping.tagsPlaceholder")}
                />
              </div>
              <div className="flex items-center gap-2">
                {/* <FieldWithHelp
                  label={t("academic.contentMapping.markRequired")}
                  section="content"
                  item="required"
                  language={locale}
                >
                  <Checkbox
                    id="required"
                    checked={formData.is_required}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_required: checked as boolean })}
                  />
                </FieldWithHelp> */}
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  {t("academic.structure.cancel")}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? t("academic.contentMapping.uploading") : t("academic.contentMapping.upload")}
                </Button>
              </div>
            </form>
          </TabsContent>
          <TabsContent value="link" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Same form fields for link */}
              <div>
                <Label>{t("academic.contentMapping.url")} *</Label>
                <Input
                  value={formData.file_url}
                  onChange={(e) => setFormData({ ...formData, file_url: e.target.value, content_type: "link" })}
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <Label>{t("academic.contentMapping.title")} *</Label>
                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div>
                <Label>{t("academic.contentMapping.description")}</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label>{t("academic.contentMapping.tags")}</Label>
                <Input value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  {t("academic.structure.cancel")}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {t("academic.contentMapping.addLink")}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

// Edit Content Modal Component
function EditContentModal({ open, content, onClose, onSuccess, locale }: any) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: content.title,
    description: content.description || "",
    content_type: content.content_type,
    file_url: content.file_url || "",
    duration_minutes: content.duration_minutes,
    tags: content.tags?.join(", ") || "",
    is_required: content.is_required,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)
      const supabase = createBrowserClient()
      const { error } = await supabase
        .from("content_items")
        .update({
          title: formData.title,
          description: formData.description || null,
          content_type: formData.content_type,
          file_url: formData.file_url || null,
          duration_minutes: formData.duration_minutes,
          tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()) : null,
          is_required: formData.is_required,
        })
        .eq("id", content.id)

      if (error) throw error

      toast({
        title: t("academic.contentMapping.success"),
        description: t("academic.contentMapping.contentUpdated"),
      })
      onSuccess()
    } catch (error) {
      console.error("[v0] Error updating content:", error)
      toast({
        title: t("academic.contentMapping.error"),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("academic.contentMapping.editContent")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>{t("academic.contentMapping.title")} *</Label>
            <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
          </div>
          <div>
            <Label>{t("academic.contentMapping.description")}</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t("academic.contentMapping.type")}</Label>
              <Select
                value={formData.content_type}
                onValueChange={(value) => setFormData({ ...formData, content_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">{t("academic.contentMapping.video")}</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="document">{t("academic.contentMapping.document")}</SelectItem>
                  <SelectItem value="link">{t("academic.contentMapping.link")}</SelectItem>
                  <SelectItem value="quiz">{t("academic.contentMapping.quiz")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>
                {t("academic.contentMapping.duration")} ({t("academic.structure.minutes")})
              </Label>
              <Input
                type="number"
                value={formData.duration_minutes || ""}
                onChange={(e) =>
                  setFormData({ ...formData, duration_minutes: e.target.value ? Number(e.target.value) : null })
                }
              />
            </div>
          </div>
          <div>
            <Label>{t("academic.contentMapping.tags")}</Label>
            <Input value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} />
          </div>
          <div className="flex items-center gap-2">
            {/* <FieldWithHelp
              label={t("academic.contentMapping.markRequired")}
              section="content"
              item="required"
              language={locale}
            >
              <Checkbox
                id="required-edit"
                checked={formData.is_required}
                onCheckedChange={(checked) => setFormData({ ...formData, is_required: checked as boolean })}
              />
            </FieldWithHelp> */}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {t("academic.structure.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("academic.contentMapping.saving") : t("academic.structure.save")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
