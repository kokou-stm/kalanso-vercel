/**
 * ContextualHelp Component
 * Toggle-able help section within modals/forms
 * 
 * Usage:
 * <ContextualHelp 
 *   section="dashboard" 
 *   item="courseTitle" 
 *   language={currentLanguage}
 * />
 */

import React, { useState } from 'react'
import { HelpCircle, Info, ChevronDown, ChevronUp } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { getHelp } from './help-content'

interface ContextualHelpProps {
  section: 'dashboard' | 'timeline' | 'content' | 'objectives'
  item: string
  language?: 'en' | 'fr' | 'de'
  defaultOpen?: boolean
  className?: string
}

export const ContextualHelp: React.FC<ContextualHelpProps> = ({
  section,
  item,
  language = 'en',
  defaultOpen = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const helpContent = getHelp(section, item, language)

  const getToggleLabel = () => {
    switch (language) {
      case 'fr': return isOpen ? 'Masquer l\'aide' : 'Afficher l\'aide'
      case 'de': return isOpen ? 'Hilfe ausblenden' : 'Hilfe anzeigen'
      default: return isOpen ? 'Hide help' : 'Show help'
    }
  }

  return (
    <div className={className}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
      >
        <HelpCircle className="h-4 w-4 mr-2" />
        {getToggleLabel()}
        {isOpen ? (
          <ChevronUp className="h-4 w-4 ml-1" />
        ) : (
          <ChevronDown className="h-4 w-4 ml-1" />
        )}
      </Button>

      {isOpen && (
        <Alert className="mt-3 bg-blue-50 border-blue-200 text-blue-900">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm whitespace-pre-line">
            {helpContent.content}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

/**
 * EmptyStateWithHelp Component
 * Empty state component with integrated help and call-to-action
 * 
 * Usage:
 * <EmptyStateWithHelp
 *   section="dashboard"
 *   item="emptyState"
 *   language={currentLanguage}
 *   icon={<BookOpen className="h-12 w-12 text-gray-400" />}
 *   primaryAction={{
 *     label: "Create Course",
 *     onClick: () => setCreateModalOpen(true)
 *   }}
 *   secondaryAction={{
 *     label: "Learn more",
 *     onClick: () => setHelpPanelOpen(true)
 *   }}
 * />
 */

interface EmptyStateAction {
  label: string
  onClick: () => void
}

interface EmptyStateWithHelpProps {
  section: 'dashboard' | 'timeline' | 'content' | 'objectives'
  item: string
  language?: 'en' | 'fr' | 'de'
  icon?: React.ReactNode
  primaryAction?: EmptyStateAction
  secondaryAction?: EmptyStateAction
  className?: string
}

export const EmptyStateWithHelp: React.FC<EmptyStateWithHelpProps> = ({
  section,
  item,
  language = 'en',
  icon,
  primaryAction,
  secondaryAction,
  className = ''
}) => {
  const helpContent = getHelp(section, item, language)

  return (
    <div className={`text-center py-12 ${className}`}>
      {icon && (
        <div className="mx-auto mb-4">
          {icon}
        </div>
      )}
      
      <h3 className="mt-4 text-lg font-semibold text-gray-900">
        {helpContent.title}
      </h3>
      
      <p className="mt-2 text-sm text-gray-600 max-w-md mx-auto whitespace-pre-line">
        {helpContent.content}
      </p>

      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center items-center">
        {primaryAction && (
          <Button onClick={primaryAction.onClick}>
            {primaryAction.label}
          </Button>
        )}
        
        {secondaryAction && (
          <Button 
            variant="link" 
            onClick={secondaryAction.onClick}
            className="text-purple-600 hover:text-purple-700"
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  )
}

/**
 * Example Usage in Modal:
 * 
 * import { ContextualHelp } from '@/components/help/HelpModal'
 * 
 * <DialogContent>
 *   <DialogHeader>
 *     <DialogTitle>Create New Course</DialogTitle>
 *     <ContextualHelp 
 *       section="dashboard" 
 *       item="courseCode"
 *       language={language}
 *     />
 *   </DialogHeader>
 *   <form>
 *     // form fields...
 *   </form>
 * </DialogContent>
 * 
 * 
 * Example Empty State Usage:
 * 
 * import { EmptyStateWithHelp } from '@/components/help/HelpModal'
 * import { BookOpen } from 'lucide-react'
 * 
 * {courses.length === 0 && (
 *   <EmptyStateWithHelp
 *     section="dashboard"
 *     item="emptyState"
 *     language={language}
 *     icon={<BookOpen className="h-12 w-12 text-gray-400" />}
 *     primaryAction={{
 *       label: language === 'fr' ? 'Créer un Cours' : language === 'de' ? 'Kurs Erstellen' : 'Create Course',
 *       onClick: () => setCreateModalOpen(true)
 *     }}
 *     secondaryAction={{
 *       label: language === 'fr' ? 'En savoir plus' : language === 'de' ? 'Mehr erfahren' : 'Learn more',
 *       onClick: () => setHelpPanelOpen(true)
 *     }}
 *   />
 * )}
 */
