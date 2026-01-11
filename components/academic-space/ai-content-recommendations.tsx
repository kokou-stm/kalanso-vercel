"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "@/lib/i18n/use-translation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  ChevronDown,
  ChevronUp,
  Video,
  FileText,
  Code,
  Gamepad2,
  ClipboardCheck,
  Database,
  BookOpen,
  Target,
  Star,
  Check,
  AlertTriangle,
  Eye,
  Plus,
  ExternalLink,
  Sparkles,
  RefreshCw,
  TrendingUp,
} from "lucide-react"

interface ContentRecommendation {
  id: string
  title: string
  type: "video" | "article" | "code" | "interactive" | "exercise" | "dataset" | "reference" | "project"
  format: string
  duration_minutes: number
  url: string
  source: string
  taxonomy: {
    cognitive: string
    knowledge: string
  }
  match_score: number
  match_reasons: string[]
  warnings: string[]
  usage_stats?: {
    used_in_sessions: number
    avg_rating: number
    completion_rate: number
    mastery_improvement: number
  }
  tags: string[]
  difficulty: "beginner" | "intermediate" | "advanced"
  instructor_notes?: string
}

interface AIContentRecommendationsProps {
  sessionId: string
  sessionTitle: string
  sessionDuration: number
  learningObjectives: any[]
  onAddContent: (contentIds: string[]) => void
  language: string
}

export function AIContentRecommendations({
  sessionId,
  sessionTitle,
  sessionDuration,
  learningObjectives,
  onAddContent,
  language,
}: AIContentRecommendationsProps) {
  const { t, locale } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<ContentRecommendation[]>([])
  const [categories, setCategories] = useState<Record<string, ContentRecommendation[]>>({})
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [previewContent, setPreviewContent] = useState<ContentRecommendation | null>(null)
  const [filterType, setFilterType] = useState<string>("all")
  const [showOnlyPerfect, setShowOnlyPerfect] = useState(false)
  const [sortBy, setSortBy] = useState<"match" | "duration" | "difficulty">("match")

  // Fetch recommendations when expanded
  useEffect(() => {
    if (isExpanded && recommendations.length === 0) {
      fetchRecommendations()
    }
  }, [isExpanded])

  const fetchRecommendations = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/ai/recommend-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          learning_objectives: learningObjectives,
          session_duration_minutes: sessionDuration,
        }),
      })
      const data = await response.json()
      setRecommendations(data.recommendations || [])
      setCategories(data.categories || {})
    } catch (error) {
      console.error("[v0] Failed to fetch recommendations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getContentIcon = (type: string) => {
    const icons = {
      video: { icon: Video, color: "text-red-500" },
      article: { icon: FileText, color: "text-blue-500" },
      code: { icon: Code, color: "text-green-500" },
      interactive: { icon: Gamepad2, color: "text-purple-500" },
      exercise: { icon: ClipboardCheck, color: "text-orange-500" },
      dataset: { icon: Database, color: "text-cyan-500" },
      reference: { icon: BookOpen, color: "text-gray-500" },
      project: { icon: Target, color: "text-indigo-500" },
    }
    return icons[type as keyof typeof icons] || icons.article
  }

  const getMatchStars = (score: number) => {
    if (score >= 0.9)
      return {
        stars: 3,
        label: language === "fr" ? "Parfait" : language === "de" ? "Perfekt" : "Perfect Fit",
        color: "text-green-600",
      }
    if (score >= 0.7)
      return {
        stars: 2,
        label: language === "fr" ? "Bon" : language === "de" ? "Gut" : "Good Match",
        color: "text-blue-600",
      }
    return {
      stars: 1,
      label: language === "fr" ? "Pertinent" : language === "de" ? "Relevant" : "Relevant",
      color: "text-gray-600",
    }
  }

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const handleAddSelected = () => {
    onAddContent(Array.from(selectedIds))
    setSelectedIds(new Set())
  }

  const filteredRecommendations = recommendations.filter((rec) => {
    if (filterType !== "all" && rec.type !== filterType) return false
    if (showOnlyPerfect && rec.match_score < 0.9) return false
    return true
  })

  const sortedRecommendations = [...filteredRecommendations].sort((a, b) => {
    if (sortBy === "match") return b.match_score - a.match_score
    if (sortBy === "duration") return a.duration_minutes - b.duration_minutes
    if (sortBy === "difficulty") {
      const diffOrder = { beginner: 1, intermediate: 2, advanced: 3 }
      return diffOrder[a.difficulty] - diffOrder[b.difficulty]
    }
    return 0
  })

  const totalNewContent = recommendations.length

  if (!isExpanded) {
    return (
      <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
        <CardContent className="p-4">
          <button
            onClick={() => setIsExpanded(true)}
            className="w-full flex items-center justify-between hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 text-white rounded-lg">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  {language === "fr"
                    ? "Recommandations de Contenu IA"
                    : language === "de"
                      ? "KI-Inhaltsempfehlungen"
                      : "AI Content Recommendations"}
                  {totalNewContent > 0 && (
                    <Badge variant="default" className="bg-purple-600">
                      {totalNewContent} {language === "fr" ? "nouveaux" : language === "de" ? "neu" : "new"}
                    </Badge>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === "fr" ? "Contenu organisé pour" : language === "de" ? "Kuratiert für" : "Curated for"} "
                  {sessionTitle}"
                </p>
              </div>
            </div>
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="border-2 border-purple-200 dark:border-purple-800">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 text-white rounded-lg">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-lg">
                {language === "fr"
                  ? "RECOMMANDATIONS DE CONTENU IA"
                  : language === "de"
                    ? "KI-INHALTSEMPFEHLUNGEN"
                    : "AI CONTENT RECOMMENDATIONS"}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={fetchRecommendations} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                {language === "fr" ? "Actualiser" : language === "de" ? "Aktualisieren" : "Refresh"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsExpanded(false)}>
                <ChevronUp className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Session Info */}
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">
              {language === "fr" ? "Pour la session :" : language === "de" ? "Für Sitzung:" : "For Session:"} "
              {sessionTitle}"
            </p>
            <p className="text-sm text-muted-foreground">
              {language === "fr"
                ? "Durée estimée :"
                : language === "de"
                  ? "Geschätzte Zeit:"
                  : "Estimated session time:"}{" "}
              {sessionDuration} {language === "fr" ? "minutes" : language === "de" ? "Minuten" : "minutes"}
            </p>
          </div>

          {/* Filters */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">
              {language === "fr" ? "Filtres :" : language === "de" ? "Filter:" : "Filters:"}
            </span>
            <Button
              variant={filterType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("all")}
            >
              {language === "fr" ? "Tous" : language === "de" ? "Alle" : "All"}
            </Button>
            <Button
              variant={filterType === "video" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("video")}
            >
              {language === "fr" ? "Vidéos" : language === "de" ? "Videos" : "Videos"}
            </Button>
            <Button
              variant={filterType === "article" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("article")}
            >
              {language === "fr" ? "Articles" : language === "de" ? "Artikel" : "Articles"}
            </Button>
            <Button
              variant={filterType === "code" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("code")}
            >
              Code
            </Button>
            <Button
              variant={filterType === "exercise" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("exercise")}
            >
              {language === "fr" ? "Exercices" : language === "de" ? "Übungen" : "Exercises"}
            </Button>
            <div className="flex items-center gap-2 ml-auto">
              <Checkbox
                id="perfect-only"
                checked={showOnlyPerfect}
                onCheckedChange={(checked) => setShowOnlyPerfect(checked as boolean)}
              />
              <label htmlFor="perfect-only" className="text-sm">
                {language === "fr" ? "Parfait uniquement" : language === "de" ? "Nur perfekt" : "High Match Only"}{" "}
                ⭐⭐⭐
              </label>
            </div>
          </div>

          {/* Sort */}
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm font-medium">
              {language === "fr" ? "Trier :" : language === "de" ? "Sortieren:" : "Sort:"}
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 border rounded-md text-sm"
            >
              <option value="match">
                {language === "fr"
                  ? "Meilleure correspondance"
                  : language === "de"
                    ? "Beste Übereinstimmung"
                    : "Best Match"}
              </option>
              <option value="duration">{language === "fr" ? "Durée" : language === "de" ? "Dauer" : "Duration"}</option>
              <option value="difficulty">
                {language === "fr" ? "Difficulté" : language === "de" ? "Schwierigkeit" : "Difficulty"}
              </option>
            </select>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-500 animate-pulse" />
              <p className="text-muted-foreground">
                {language === "fr"
                  ? "Analyse de vos objectifs..."
                  : language === "de"
                    ? "Analysiere Ihre Ziele..."
                    : "Analyzing your objectives..."}
              </p>
            </div>
          )}

          {/* Content Categories */}
          {!isLoading && sortedRecommendations.length > 0 && (
            <Accordion type="multiple" defaultValue={["instructional", "practice"]} className="space-y-4">
              {/* Instructional Content */}
              {categories.instructional && categories.instructional.length > 0 && (
                <AccordionItem value="instructional" className="border rounded-lg">
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold">
                        {language === "fr"
                          ? "CONTENU PÉDAGOGIQUE"
                          : language === "de"
                            ? "LEHRMATERIALIEN"
                            : "INSTRUCTIONAL CONTENT"}{" "}
                        ({categories.instructional.length})
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      {language === "fr"
                        ? "Matériel d'enseignement principal"
                        : language === "de"
                          ? "Hauptlehrmaterial"
                          : "Primary teaching materials"}
                    </p>
                    <div className="space-y-3">
                      {categories.instructional.map((rec) => (
                        <ContentRecommendationCard
                          key={rec.id}
                          recommendation={rec}
                          language={language}
                          isSelected={selectedIds.has(rec.id)}
                          onToggleSelect={() => toggleSelection(rec.id)}
                          onPreview={() => setPreviewContent(rec)}
                          onAdd={() => onAddContent([rec.id])}
                          getContentIcon={getContentIcon}
                          getMatchStars={getMatchStars}
                        />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Practice Materials */}
              {categories.practice && categories.practice.length > 0 && (
                <AccordionItem value="practice" className="border rounded-lg">
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <ClipboardCheck className="w-5 h-5 text-orange-600" />
                      <span className="font-semibold">
                        {language === "fr"
                          ? "MATÉRIEL DE PRATIQUE"
                          : language === "de"
                            ? "ÜBUNGSMATERIALIEN"
                            : "PRACTICE MATERIALS"}{" "}
                        ({categories.practice.length})
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      {language === "fr"
                        ? "Exercices et activités pratiques"
                        : language === "de"
                          ? "Übungen und praktische Aktivitäten"
                          : "Exercises and hands-on activities"}
                    </p>
                    <div className="space-y-3">
                      {categories.practice.map((rec) => (
                        <ContentRecommendationCard
                          key={rec.id}
                          recommendation={rec}
                          language={language}
                          isSelected={selectedIds.has(rec.id)}
                          onToggleSelect={() => toggleSelection(rec.id)}
                          onPreview={() => setPreviewContent(rec)}
                          onAdd={() => onAddContent([rec.id])}
                          getContentIcon={getContentIcon}
                          getMatchStars={getMatchStars}
                        />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Other categories... */}
            </Accordion>
          )}

          {/* Content Gap Analysis */}
          {!isLoading && sortedRecommendations.length > 0 && (
            <Card className="mt-6 border-amber-200 bg-amber-50 dark:bg-amber-950/20">
              <CardContent className="p-4">
                <h4 className="font-semibold flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                  {language === "fr"
                    ? "ANALYSE DES LACUNES DE CONTENU"
                    : language === "de"
                      ? "INHALTSLÜCKENANALYSE"
                      : "CONTENT GAP ANALYSIS"}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                    <span>
                      {language === "fr"
                        ? "Types de contenu manquants : Aucune activité d'analyse trouvée"
                        : language === "de"
                          ? "Fehlende Inhaltstypen: Keine Analyseaktivitäten gefunden"
                          : "Missing Content Types: No Analyze-level activities found"}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                    <span>
                      {language === "fr"
                        ? "Considérez l'ajout d'une évaluation formative"
                        : language === "de"
                          ? "Erwägen Sie das Hinzufügen einer formativen Bewertung"
                          : "Consider adding formative assessment"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bottom Actions */}
          {!isLoading && sortedRecommendations.length > 0 && (
            <div className="mt-6 flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="text-sm">
                {language === "fr" ? "Sélectionné :" : language === "de" ? "Ausgewählt:" : "Selected:"}{" "}
                {selectedIds.size} {language === "fr" ? "éléments" : language === "de" ? "Elemente" : "items"}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedIds(new Set(sortedRecommendations.map((r) => r.id)))}
                >
                  {language === "fr" ? "Tout sélectionner" : language === "de" ? "Alle auswählen" : "Select All"}
                </Button>
                <Button size="sm" onClick={handleAddSelected} disabled={selectedIds.size === 0}>
                  <Plus className="w-4 h-4 mr-2" />
                  {language === "fr"
                    ? "Ajouter la sélection"
                    : language === "de"
                      ? "Auswahl hinzufügen"
                      : "Add Selected"}
                </Button>
              </div>
            </div>
          )}

          {/* No Results */}
          {!isLoading && sortedRecommendations.length === 0 && (
            <div className="text-center py-12">
              <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                {language === "fr"
                  ? "Aucun contenu correspondant trouvé"
                  : language === "de"
                    ? "Keine passenden Inhalte gefunden"
                    : "No matching content found"}
              </p>
              <Button variant="outline" size="sm" onClick={() => setShowOnlyPerfect(false)}>
                {language === "fr" ? "Élargir les filtres" : language === "de" ? "Filter erweitern" : "Broaden Filters"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {previewContent && (
        <ContentPreviewModal
          content={previewContent}
          language={language}
          onClose={() => setPreviewContent(null)}
          onAdd={() => {
            onAddContent([previewContent.id])
            setPreviewContent(null)
          }}
        />
      )}
    </>
  )
}

// Content Recommendation Card Component
function ContentRecommendationCard({
  recommendation,
  language,
  isSelected,
  onToggleSelect,
  onPreview,
  onAdd,
  getContentIcon,
  getMatchStars,
}: any) {
  const { icon: Icon, color } = getContentIcon(recommendation.type)
  const matchInfo = getMatchStars(recommendation.match_score)

  return (
    <Card className={`transition-all ${isSelected ? "ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-950/20" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox checked={isSelected} onCheckedChange={onToggleSelect} className="mt-1" />
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-5 h-5 ${color}`} />
                  <h4 className="font-semibold">{recommendation.title}</h4>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{recommendation.format}</span>
                  <span>•</span>
                  <span>
                    {recommendation.duration_minutes} {language === "fr" ? "min" : language === "de" ? "Min" : "min"}
                  </span>
                  <span>•</span>
                  <span>
                    {recommendation.taxonomy.knowledge}-{recommendation.taxonomy.cognitive}
                  </span>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                {recommendation.source}
              </Badge>
              {recommendation.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Match Quality */}
            <div className={`mb-2 ${matchInfo.color}`}>
              <div className="flex items-center gap-1 mb-1">
                <span className="font-medium text-sm">
                  {language === "fr"
                    ? "Qualité de correspondance :"
                    : language === "de"
                      ? "Match-Qualität:"
                      : "Match Quality:"}
                </span>
                {[...Array(3)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < matchInfo.stars ? "fill-current" : ""}`} />
                ))}
                <span className="ml-1 text-sm font-medium">{matchInfo.label}</span>
              </div>
              <div className="space-y-1">
                {recommendation.match_reasons.map((reason: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{reason}</span>
                  </div>
                ))}
                {recommendation.warnings.map((warning: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-amber-600">
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{warning}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Usage Stats */}
            {recommendation.usage_stats && (
              <div className="text-sm text-muted-foreground mb-3">
                {language === "fr" ? "Utilisé dans" : language === "de" ? "Verwendet in" : "Used in"}{" "}
                {recommendation.usage_stats.used_in_sessions}{" "}
                {language === "fr"
                  ? "sessions similaires"
                  : language === "de"
                    ? "ähnlichen Sitzungen"
                    : "similar sessions"}{" "}
                • {recommendation.usage_stats.avg_rating.toFixed(1)}/5{" "}
                {language === "fr" ? "évaluation" : language === "de" ? "Bewertung" : "rating"}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={onAdd}>
                <Plus className="w-4 h-4 mr-1" />
                {language === "fr" ? "Ajouter" : language === "de" ? "Hinzufügen" : "Add to Session"}
              </Button>
              <Button variant="outline" size="sm" onClick={onPreview}>
                <Eye className="w-4 h-4 mr-1" />
                {language === "fr" ? "Aperçu" : language === "de" ? "Vorschau" : "Preview"}
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href={recommendation.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Content Preview Modal
function ContentPreviewModal({ content, language, onClose, onAdd }: any) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {content.type === "video" && <Video className="w-5 h-5" />}
            {language === "fr" ? "Aperçu du contenu" : language === "de" ? "Inhaltsvorschau" : "Content Preview"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">{content.title}</h3>

          {/* Preview Area */}
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {language === "fr"
                  ? "Affichage des premières 60 secondes..."
                  : language === "de"
                    ? "Zeige die ersten 60 Sekunden..."
                    : "Showing first 60 seconds..."}
              </p>
            </div>
          </div>

          {/* Content Details */}
          <div>
            <h4 className="font-semibold mb-2">
              {language === "fr" ? "Détails du contenu :" : language === "de" ? "Inhaltsdetails:" : "Content Details:"}
            </h4>
            <ul className="space-y-1 text-sm">
              <li>
                • {language === "fr" ? "Durée :" : language === "de" ? "Dauer:" : "Duration:"}{" "}
                {content.duration_minutes} minutes
              </li>
              <li>• Format: {content.format}</li>
              <li>
                • {language === "fr" ? "Sujets :" : language === "de" ? "Themen:" : "Topics:"} {content.tags.join(", ")}
              </li>
              <li>
                • {language === "fr" ? "Niveau de Bloom :" : language === "de" ? "Bloom-Ebene:" : "Bloom Level:"}{" "}
                {content.taxonomy.knowledge}-{content.taxonomy.cognitive}
              </li>
            </ul>
          </div>

          {/* Usage Statistics */}
          {content.usage_stats && (
            <div>
              <h4 className="font-semibold mb-2">
                {language === "fr"
                  ? "Statistiques d'utilisation :"
                  : language === "de"
                    ? "Nutzungsstatistiken:"
                    : "Usage Statistics:"}
              </h4>
              <ul className="space-y-1 text-sm">
                <li>
                  • {language === "fr" ? "Utilisé dans" : language === "de" ? "Verwendet in" : "Used in"}{" "}
                  {content.usage_stats.used_in_sessions}{" "}
                  {language === "fr"
                    ? "sessions similaires"
                    : language === "de"
                      ? "ähnlichen Sitzungen"
                      : "similar sessions"}
                </li>
                <li>
                  •{" "}
                  {language === "fr"
                    ? "Évaluation moyenne :"
                    : language === "de"
                      ? "Durchschnittliche Bewertung:"
                      : "Average student rating:"}{" "}
                  {content.usage_stats.avg_rating}/5
                </li>
                <li>
                  •{" "}
                  {language === "fr"
                    ? "Taux d'achèvement :"
                    : language === "de"
                      ? "Abschlussquote:"
                      : "Completion rate:"}{" "}
                  {(content.usage_stats.completion_rate * 100).toFixed(0)}%
                </li>
              </ul>
            </div>
          )}

          {/* Instructor Notes */}
          {content.instructor_notes && (
            <div>
              <h4 className="font-semibold mb-2">
                {language === "fr"
                  ? "Notes de l'instructeur :"
                  : language === "de"
                    ? "Lehrernotizen:"
                    : "Instructor Notes:"}
              </h4>
              <p className="text-sm text-muted-foreground italic">{content.instructor_notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-4">
            <Button onClick={onAdd}>
              <Plus className="w-4 h-4 mr-2" />
              {language === "fr"
                ? "Ajouter à la session"
                : language === "de"
                  ? "Zur Sitzung hinzufügen"
                  : "Add to Session"}
            </Button>
            <Button variant="outline" asChild>
              <a href={content.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                {language === "fr"
                  ? "Ouvrir le contenu complet"
                  : language === "de"
                    ? "Vollständigen Inhalt öffnen"
                    : "Open Full Content"}
              </a>
            </Button>
            <Button variant="ghost" onClick={onClose}>
              {language === "fr" ? "Fermer" : language === "de" ? "Schließen" : "Close"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
