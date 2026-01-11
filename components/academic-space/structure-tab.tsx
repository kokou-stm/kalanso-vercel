"use client"

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useState, useEffect } from "react"
import { useTranslation } from "@/lib/i18n/use-translation"
import type { Course } from "@/types/academic"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { HelpButton, HelpPanel } from "@/lib/help/HelpPanel"
import { FieldWithHelp } from "@/lib/help/HelpTooltip"
import { EmptyStateWithHelp } from "@/lib/help/HelpModal"
import { AISessionGenerator } from "./ai-session-generator"
import {
  ChevronDown,
  ChevronRight,
  Clock,
  Edit,
  GripVertical,
  MoreVertical,
  Plus,
  Trash2,
  Network,
  Loader2,
  Home,
  Calendar,
  Sparkles,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface StructureTabProps {
  course: Course
  onSave?: (changes: any) => void
}

interface DbClass {
  id: string
  course_id: string
  class_number: number
  title: string
  description: string | null
  schedule_week: number | null
  status: "published" | "draft"
  sequence_order: number
  sessions?: DbSession[]
}

interface DbSession {
  id: string
  class_id: string
  session_number: string
  title: string
  description: string | null
  estimated_minutes: number
  status: "published" | "draft"
  sequence_order: number
}

export function StructureTab({ course, onSave }: StructureTabProps) {
  const { t, locale } = useTranslation()
  const { toast } = useToast()
  const supabase = createClient()

  const [localClasses, setLocalClasses] = useState<DbClass[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set())
  const [editingTitle, setEditingTitle] = useState<{ type: "class" | "session"; id: string; value: string } | null>(
    null,
  )
  const [showAddClassModal, setShowAddClassModal] = useState(false)
  const [showAddSessionModal, setShowAddSessionModal] = useState<boolean>(false)
  const [deleteTarget, setDeleteTarget] = useState<{ type: "class" | "session"; id: string; name: string } | null>(null)
  const [selectedClass, setSelectedClass] = useState<DbClass | null>(null)

  const [newClass, setNewClass] = useState({
    title: "",
    description: "",
    weekNumber: "",
    autoCreateSessions: false,
    sessionCount: "3",
    publishImmediately: false,
  })

  const [newSession, setNewSession] = useState({
    title: "",
    description: "",
    duration: "30",
    publishImmediately: false,
  })

  const [helpPanelOpen, setHelpPanelOpen] = useState(false)
  const [showAIGenerator, setShowAIGenerator] = useState(false)
  const [aiGeneratedSessions, setAiGeneratedSessions] = useState<any[]>([])

  useEffect(() => {
    console.log("[v0] StructureTab mounted for course:", course.id, course.title)
    fetchClasses()
  }, [course.id])

  async function fetchClasses() {
    try {
      setLoading(true)
      setError(null)

      console.log("[v0] Fetching classes for course:", course.id)

      const { data: classesData, error: classError } = await supabase
        .from("classes")
        .select(`
          id,
          course_id,
          class_number,
          title,
          description,
          schedule_week,
          is_published,
          sequence_order,
          sessions (
            id,
            class_id,
            session_number,
            title,
            description,
            estimated_minutes,
            is_published,
            sequence_order
          )
        `)
        .eq("course_id", course.id)
        .order("sequence_order", { ascending: true })

      if (classError) throw classError

      console.log("[v0] Fetched classes:", classesData?.length || 0)

      const classesWithOrderedSessions = (classesData || []).map((cls) => ({
        ...cls,
        status: cls.is_published ? "published" : "draft",
        sessions: (cls.sessions || [])
          .map((session) => ({
            ...session,
            status: session.is_published ? "published" : "draft",
          }))
          .sort((a, b) => a.sequence_order - b.sequence_order),
      }))

      setLocalClasses(classesWithOrderedSessions)

      // Auto-expand first class if there are any
      if (classesWithOrderedSessions.length > 0) {
        setExpandedClasses(new Set([classesWithOrderedSessions[0].id]))
      }
    } catch (err) {
      console.error("[v0] Error fetching classes:", err)
      setError("Failed to load course structure")
      toast({
        title: t("academic.structure.error"),
        description: t("academic.structure.fetchError"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleAddClass() {
    try {
      const maxClassNumber = Math.max(...localClasses.map((c) => c.class_number), 0)
      const nextNumber = maxClassNumber + 1

      const { data: newClassData, error } = await supabase
        .from("classes")
        .insert([
          {
            course_id: course.id,
            class_number: nextNumber,
            title: newClass.title,
            description: newClass.description || null,
            schedule_week: newClass.weekNumber ? Number.parseInt(newClass.weekNumber) : null,
            sequence_order: nextNumber,
            is_published: newClass.publishImmediately,
          },
        ])
        .select()
        .single()

      if (error) throw error

      // If we have AI-generated sessions, use those
      if (aiGeneratedSessions.length > 0) {
        const sessionInserts = aiGeneratedSessions.map((session, i) => ({
          class_id: newClassData.id,
          session_number: `${nextNumber}.${i + 1}`,
          title: session.title,
          description: session.description,
          estimated_minutes: session.duration_minutes,
          is_published: false,
          sequence_order: i + 1,
        }))

        await supabase.from("sessions").insert(sessionInserts)

        // Reset AI sessions
        setAiGeneratedSessions([])
      } else if (newClass.autoCreateSessions && Number.parseInt(newClass.sessionCount) > 0) {
        // Standard quick generation
        const sessionInserts = []
        for (let i = 1; i <= Number.parseInt(newClass.sessionCount); i++) {
          sessionInserts.push({
            class_id: newClassData.id,
            session_number: `${nextNumber}.${i}`,
            title: `Session ${i}`,
            estimated_minutes: 30,
            is_published: false,
            sequence_order: i,
          })
        }

        await supabase.from("sessions").insert(sessionInserts)
      }

      // Refresh all classes
      await fetchClasses()

      setShowAddClassModal(false)
      setNewClass({
        title: "",
        description: "",
        weekNumber: "",
        autoCreateSessions: false,
        sessionCount: "3",
        publishImmediately: false,
      })

      toast({
        title: t("academic.structure.notifications.classCreated"),
        description: t("academic.structure.notifications.classCreatedDesc"),
      })

      onSave?.(localClasses)
    } catch (err) {
      console.error("[v0] Error creating class:", err)
      toast({
        title: t("academic.structure.error"),
        description: t("academic.structure.createError"),
        variant: "destructive",
      })
    }
  }

  async function handleAddSession() {
    if (!selectedClass) return

    try {
      const sessionCount = selectedClass.sessions?.length || 0
      const sessionNumber = `${selectedClass.class_number}.${sessionCount + 1}`

      const { data, error } = await supabase
        .from("sessions")
        .insert([
          {
            class_id: selectedClass.id,
            session_number: sessionNumber,
            title: newSession.title,
            description: newSession.description || null,
            estimated_minutes: Number.parseInt(newSession.duration),
            sequence_order: sessionCount + 1,
            is_published: newSession.publishImmediately,
          },
        ])
        .select()
        .single()

      if (error) throw error

      // Update local state
      setLocalClasses(
        localClasses.map((cls) =>
          cls.id === selectedClass.id ? { ...cls, sessions: [...(cls.sessions || []), data] } : cls,
        ),
      )

      setShowAddSessionModal(false)
      setNewSession({ title: "", description: "", duration: "30", publishImmediately: false })

      toast({
        title: t("academic.structure.notifications.sessionCreated"),
        description: t("academic.structure.notifications.sessionCreatedDesc"),
      })

      onSave?.(localClasses)
    } catch (err) {
      console.error("[v0] Error creating session:", err)
      toast({
        title: t("academic.structure.error"),
        description: t("academic.structure.createError"),
        variant: "destructive",
      })
    }
  }

  async function handleUpdateTitle() {
    if (!editingTitle) return

    try {
      if (editingTitle.type === "class") {
        const { error } = await supabase.from("classes").update({ title: editingTitle.value }).eq("id", editingTitle.id)

        if (error) throw error

        setLocalClasses(localClasses.map((c) => (c.id === editingTitle.id ? { ...c, title: editingTitle.value } : c)))

        toast({
          title: t("academic.structure.notifications.classUpdated"),
        })
      } else {
        const { error } = await supabase
          .from("sessions")
          .update({ title: editingTitle.value })
          .eq("id", editingTitle.id)

        if (error) throw error

        setLocalClasses(
          localClasses.map((cls) => ({
            ...cls,
            sessions: cls.sessions?.map((s) => (s.id === editingTitle.id ? { ...s, title: editingTitle.value } : s)),
          })),
        )

        toast({
          title: t("academic.structure.notifications.sessionUpdated"),
        })
      }

      setEditingTitle(null)
      onSave?.(localClasses)
    } catch (err) {
      console.error("[v0] Error updating title:", err)
      toast({
        title: t("academic.structure.error"),
        description: t("academic.structure.updateError"),
        variant: "destructive",
      })
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return

    try {
      if (deleteTarget.type === "class") {
        const { error } = await supabase.from("classes").delete().eq("id", deleteTarget.id)

        if (error) throw error

        setLocalClasses(localClasses.filter((c) => c.id !== deleteTarget.id))

        toast({
          title: t("academic.structure.notifications.classDeleted"),
        })
      } else {
        const { error } = await supabase.from("sessions").delete().eq("id", deleteTarget.id)

        if (error) throw error

        setLocalClasses(
          localClasses.map((cls) => ({
            ...cls,
            sessions: cls.sessions?.filter((s) => s.id !== deleteTarget.id),
          })),
        )

        toast({
          title: t("academic.structure.notifications.sessionDeleted"),
        })
      }

      setDeleteTarget(null)
      onSave?.(localClasses)
    } catch (err) {
      console.error("[v0] Error deleting:", err)
      toast({
        title: t("academic.structure.error"),
        description: t("academic.structure.deleteError"),
        variant: "destructive",
      })
    }
  }

  const toggleClass = (classId: string) => {
    const newExpanded = new Set(expandedClasses)
    if (newExpanded.has(classId)) {
      newExpanded.delete(classId)
    } else {
      newExpanded.add(classId)
    }
    setExpandedClasses(newExpanded)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Network className="h-12 w-12 text-gray-400" />
        <div className="text-center">
          <h3 className="font-semibold text-lg mb-1">{t("academic.structure.error")}</h3>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchClasses}>{t("academic.structure.retry")}</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Home className="h-4 w-4" />
          <ChevronRight className="h-4 w-4" />
          <span>{t("common.academicSpace")}</span>
          <ChevronRight className="h-4 w-4" />
          <span className="font-mono text-primary">{course.code}</span>
          <span>: {course.title}</span>
          <ChevronRight className="h-4 w-4" />
          <span className="font-semibold">{t("academic.tabs.structure")}</span>
        </div>
        <HelpButton language={locale} onClick={() => setHelpPanelOpen(true)} />
      </div>

      {/* Timeline */}
      {localClasses.length === 0 && !loading && (
        <EmptyStateWithHelp
          section="timeline"
          item="emptyState"
          language={locale}
          icon={<Calendar className="h-12 w-12 text-gray-400" />}
          primaryAction={{
            label: t("academic.structure.addClass"),
            onClick: () => setShowAddClassModal(true),
          }}
          secondaryAction={{
            label: t("common.learnMore"),
            onClick: () => setHelpPanelOpen(true),
          }}
        />
      )}

      {/* Improved timeline layout with proper spacing and margins */}
      <div className="space-y-8">
        {localClasses.map((cls, classIndex) => (
          <div key={cls.id} className="relative pl-12">
            <div className="absolute left-0 top-6 z-10">
              <div
                className={`h-6 w-6 rounded-full border-4 ${
                  cls.status === "published" ? "bg-purple-600 border-purple-600" : "bg-white border-purple-400"
                }`}
              />
            </div>

            {classIndex < localClasses.length - 1 && (
              <div className="absolute left-[11px] top-12 bottom-[-2rem] w-0.5 bg-purple-300" />
            )}

            <Card className="transition-all duration-200 hover:shadow-lg hover:translate-y-[-2px]">
              <CardHeader className="pb-4">
                <GripVertical className="h-5 w-5 text-gray-400 cursor-grab hover:text-gray-600" />

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleClass(cls.id)}
                  className="p-0 h-auto hover:bg-transparent"
                >
                  {expandedClasses.has(cls.id) ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </Button>

                <div className="flex-1 min-w-0">
                  {editingTitle?.id === cls.id && editingTitle.type === "class" ? (
                    <Input
                      value={editingTitle.value}
                      onChange={(e) => setEditingTitle({ ...editingTitle, value: e.target.value })}
                      onBlur={handleUpdateTitle}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUpdateTitle()
                        if (e.key === "Escape") setEditingTitle(null)
                      }}
                      autoFocus
                      className="h-8"
                    />
                  ) : (
                    <h3
                      className="font-semibold cursor-pointer hover:text-primary transition-colors"
                      onClick={() => setEditingTitle({ type: "class", id: cls.id, value: cls.title })}
                    >
                      {t("academic.structure.classPrefix")} {cls.class_number}: {cls.title}
                    </h3>
                  )}
                  {cls.description && <p className="text-sm text-gray-600 mt-1 truncate">{cls.description}</p>}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {cls.schedule_week && (
                    <Badge variant="outline">
                      {t("academic.structure.week")} {cls.schedule_week}
                    </Badge>
                  )}
                  <Badge
                    variant={cls.status === "published" ? "default" : "secondary"}
                    className={cls.status === "published" ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    {cls.status === "published" ? t("academic.structure.published") : t("academic.structure.draft")}
                  </Badge>
                  <Badge variant="outline">
                    {cls.sessions?.length || 0} {t("academic.structure.sessions")}
                  </Badge>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => setEditingTitle({ type: "class", id: cls.id, value: cls.title })}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        {t("academic.structure.edit")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteTarget({ type: "class", id: cls.id, name: cls.title })}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t("academic.structure.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              {expandedClasses.has(cls.id) && (
                <CardContent className="space-y-3 pt-0">
                  {cls.sessions.map((session, sessionIndex) => (
                    <div
                      key={session.id}
                      className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border hover:shadow-md hover:translate-y-[-1px] transition-all duration-200"
                    >
                      <GripVertical className="h-4 w-4 text-gray-400 cursor-grab hover:text-gray-600" />

                      <div
                        className={cn(
                          "w-3 h-3 rounded-full border-2 transition-colors flex-shrink-0",
                          session.status === "published"
                            ? "bg-purple-600 border-purple-600"
                            : "bg-white border-purple-400",
                        )}
                      />

                      <div className="flex-1 min-w-0">
                        {editingTitle?.id === session.id && editingTitle.type === "session" ? (
                          <Input
                            value={editingTitle.value}
                            onChange={(e) => setEditingTitle({ ...editingTitle, value: e.target.value })}
                            onBlur={handleUpdateTitle}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleUpdateTitle()
                              if (e.key === "Escape") setEditingTitle(null)
                            }}
                            autoFocus
                            className="h-7 text-sm"
                          />
                        ) : (
                          <p
                            className="font-medium text-sm cursor-pointer hover:text-primary transition-colors truncate"
                            onClick={() => setEditingTitle({ type: "session", id: session.id, value: session.title })}
                          >
                            {session.session_number}: {session.title}
                          </p>
                        )}
                        {session.description && (
                          <p className="text-xs text-gray-600 mt-0.5 truncate">{session.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Clock className="h-3 w-3" />
                          {session.estimated_minutes} {t("academic.structure.minutes")}
                        </div>

                        <Badge
                          variant={session.status === "published" ? "default" : "secondary"}
                          className={cn("text-xs", session.status === "published" && "bg-green-600 hover:bg-green-700")}
                        >
                          {session.status === "published"
                            ? t("academic.structure.published")
                            : t("academic.structure.draft")}
                        </Badge>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => setEditingTitle({ type: "session", id: session.id, value: session.title })}
                            >
                              <Edit className="mr-2 h-3 w-3" />
                              {t("academic.structure.edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteTarget({ type: "session", id: session.id, name: session.title })}
                            >
                              <Trash2 className="mr-2 h-3 w-3" />
                              {t("academic.structure.delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}

                  {cls.sessions.length === 0 && (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
                      {t("academic.structure.noSessions")}
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-4 bg-transparent"
                    onClick={() => {
                      setSelectedClass(cls)
                      setShowAddSessionModal(true)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t("academic.structure.addSession")}
                  </Button>
                </CardContent>
              )}
            </Card>
          </div>
        ))}
      </div>

      {/* Floating Add Class Button */}
      {localClasses.length > 0 && (
        <Button
          className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-20"
          size="icon"
          onClick={() => setShowAddClassModal(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      {/* Add Class Modal */}
      <Dialog open={showAddClassModal} onOpenChange={setShowAddClassModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("academic.structure.modal.createClass")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <FieldWithHelp
              label={`${t("academic.structure.modal.title")} *`}
              section="timeline"
              item="classTitle"
              language={locale}
            >
              <Input
                value={newClass.title}
                onChange={(e) => setNewClass({ ...newClass, title: e.target.value })}
                placeholder={t("academic.structure.modal.titlePlaceholder")}
              />
            </FieldWithHelp>
            <div>
              <Label>{t("academic.structure.modal.description")}</Label>
              <Textarea
                value={newClass.description}
                onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                placeholder={t("academic.structure.modal.descriptionPlaceholder")}
              />
            </div>
            <FieldWithHelp
              label={t("academic.structure.modal.weekNumber")}
              section="timeline"
              item="weekNumber"
              language={locale}
            >
              <Input
                type="number"
                value={newClass.weekNumber}
                onChange={(e) => setNewClass({ ...newClass, weekNumber: e.target.value })}
                placeholder="1"
              />
            </FieldWithHelp>
            <FieldWithHelp
              label={t("academic.structure.modal.autoCreateSessions")}
              section="timeline"
              item="autoCreate"
              language={locale}
            >
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={newClass.autoCreateSessions}
                  onCheckedChange={(checked) => setNewClass({ ...newClass, autoCreateSessions: checked as boolean })}
                />
              </div>
            </FieldWithHelp>
            {newClass.autoCreateSessions && (
              <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Session Generation</div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAIGenerator(true)}
                    className="text-purple-600 border-purple-300 hover:bg-purple-50"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI-Powered Suggestions
                  </Button>
                </div>

                {aiGeneratedSessions.length > 0 ? (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-800">
                      ✓ {aiGeneratedSessions.length} AI-generated sessions ready
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Sessions will be created with optimized pedagogical structure
                    </p>
                  </div>
                ) : (
                  <div>
                    <Label>{t("academic.structure.modal.numberOfSessions")}</Label>
                    <Input
                      type="number"
                      value={newClass.sessionCount}
                      onChange={(e) => setNewClass({ ...newClass, sessionCount: e.target.value })}
                      min="1"
                      max="10"
                    />
                  </div>
                )}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Checkbox
                checked={newClass.publishImmediately}
                onCheckedChange={(checked) => setNewClass({ ...newClass, publishImmediately: checked as boolean })}
              />
              <Label>{t("academic.structure.modal.publishImmediately")}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddClassModal(false)}>
              {t("academic.structure.modal.cancel")}
            </Button>
            <Button onClick={handleAddClass} disabled={!newClass.title}>
              {t("academic.structure.modal.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Session Modal */}
      <Dialog open={showAddSessionModal} onOpenChange={setShowAddSessionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("academic.structure.modal.createSession")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <FieldWithHelp
                label={`${t("academic.structure.modal.title")} *`}
                section="timeline"
                item="sessionTitle"
                language={locale}
              >
                <Input
                  value={newSession.title}
                  onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                  placeholder={t("academic.structure.modal.sessionTitlePlaceholder")}
                />
              </FieldWithHelp>
            </div>
            <div>
              <FieldWithHelp
                label={t("academic.structure.modal.description")}
                section="timeline"
                item="sessionDescription"
                language={locale}
              >
                <Textarea
                  value={newSession.description}
                  onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                  placeholder={t("academic.structure.modal.descriptionPlaceholder")}
                />
              </FieldWithHelp>
            </div>
            <div>
              <FieldWithHelp
                label={t("academic.structure.modal.duration")}
                section="timeline"
                item="sessionDuration"
                language={locale}
              >
                <Input
                  type="number"
                  value={newSession.duration}
                  onChange={(e) => setNewSession({ ...newSession, duration: e.target.value })}
                  placeholder="30"
                />
              </FieldWithHelp>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={newSession.publishImmediately}
                onCheckedChange={(checked) => setNewSession({ ...newSession, publishImmediately: checked as boolean })}
              />
              <FieldWithHelp
                label={t("academic.structure.modal.publishImmediately")}
                section="timeline"
                item="publishSession"
                language={locale}
                className="mb-0"
              >
                <span />
              </FieldWithHelp>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSessionModal(false)}>
              {t("academic.structure.modal.cancel")}
            </Button>
            <Button onClick={handleAddSession} disabled={!newSession.title}>
              {t("academic.structure.modal.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteTarget !== null} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("academic.structure.confirm.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.type === "class"
                ? t("academic.structure.confirm.deleteClass").replace("{name}", deleteTarget.name)
                : t("academic.structure.confirm.deleteSession").replace("{name}", deleteTarget?.name || "")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("academic.structure.modal.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              {t("academic.structure.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Help Panel */}
      <HelpPanel isOpen={helpPanelOpen} onClose={() => setHelpPanelOpen(false)} section="timeline" language={locale} />

      {/* AI Session Generator Modal */}
      <AISessionGenerator
        isOpen={showAIGenerator}
        onClose={() => setShowAIGenerator(false)}
        classTitle={newClass.title}
        classDescription={newClass.description}
        courseContext={{
          title: course.title,
          level: "introductory",
          domain: course.domain || "General",
        }}
        onAccept={(sessions) => {
          setAiGeneratedSessions(sessions)
          setShowAIGenerator(false)
          toast({
            title: "Sessions Ready",
            description: `${sessions.length} AI-optimized sessions will be created`,
          })
        }}
      />
    </div>
  )
}
