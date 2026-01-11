/**
 * HelpPanel Component
 * Slide-out help panel for comprehensive contextual help
 * 
 * Usage:
 * <HelpPanel 
 *   isOpen={helpPanelOpen} 
 *   onClose={() => setHelpPanelOpen(false)}
 *   section="dashboard"
 *   language={currentLanguage}
 * />
 */

import React from 'react'
import { X, BookOpen, MessageCircle, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { getHelp } from './help-content'

interface HelpPanelProps {
  isOpen: boolean
  onClose: () => void
  section: 'dashboard' | 'timeline' | 'content' | 'objectives'
  language?: 'en' | 'fr' | 'de'
  onViewDocs?: () => void
  onViewFAQ?: () => void
}

export const HelpPanel: React.FC<HelpPanelProps> = ({
  isOpen,
  onClose,
  section,
  language = 'en',
  onViewDocs,
  onViewFAQ
}) => {
  const mainHelp = getHelp(section, 'main', language)

  const getActionLabels = () => {
    switch (language) {
      case 'fr':
        return {
          help: 'Aide',
          quickActions: 'Actions Rapides',
          viewDocs: 'Voir la Documentation Complète',
          faq: 'FAQ'
        }
      case 'de':
        return {
          help: 'Hilfe',
          quickActions: 'Schnellaktionen',
          viewDocs: 'Vollständige Dokumentation Anzeigen',
          faq: 'FAQ'
        }
      default:
        return {
          help: 'Help',
          quickActions: 'Quick Actions',
          viewDocs: 'View Full Documentation',
          faq: 'FAQ'
        }
    }
  }

  const labels = getActionLabels()

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Slide-out Panel */}
      <div 
        className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl z-50 overflow-y-auto transform transition-transform duration-300 ease-in-out"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-panel-title"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 
              id="help-panel-title" 
              className="text-xl font-bold text-gray-900 flex items-center gap-2"
            >
              <HelpCircle className="h-5 w-5 text-purple-600" />
              {labels.help}
            </h2>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
              aria-label="Close help panel"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Main Help Content */}
          <div className="space-y-4 mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {mainHelp.title}
              </h3>
              <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                {mainHelp.content}
              </p>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Quick Actions */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              {labels.quickActions}
            </h3>
            <div className="space-y-2">
              {onViewDocs && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={onViewDocs}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  {labels.viewDocs}
                </Button>
              )}
              {onViewFAQ && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={onViewFAQ}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {labels.faq}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

/**
 * HelpButton Component
 * Button to trigger the help panel (typically in top bar)
 * 
 * Usage:
 * <HelpButton language={currentLanguage} onClick={() => setHelpPanelOpen(true)} />
 */

interface HelpButtonProps {
  language?: 'en' | 'fr' | 'de'
  onClick: () => void
  variant?: 'default' | 'ghost' | 'outline'
  className?: string
}

export const HelpButton: React.FC<HelpButtonProps> = ({
  language = 'en',
  onClick,
  variant = 'ghost',
  className = ''
}) => {
  const getLabel = () => {
    switch (language) {
      case 'fr': return 'Aide'
      case 'de': return 'Hilfe'
      default: return 'Help'
    }
  }

  return (
    <Button 
      variant={variant}
      size="sm"
      onClick={onClick}
      className={className}
    >
      <HelpCircle className="w-4 h-4 mr-2" />
      {getLabel()}
    </Button>
  )
}

/**
 * Example Usage:
 * 
 * import { HelpPanel, HelpButton } from '@/components/help/HelpPanel'
 * 
 * function DashboardComponent() {
 *   const [helpPanelOpen, setHelpPanelOpen] = useState(false)
 *   const { language } = useLanguage()
 * 
 *   return (
 *     <div>
 *       // In your top bar:
 *       <HelpButton 
 *         language={language} 
 *         onClick={() => setHelpPanelOpen(true)} 
 *       />
 * 
 *       // Help panel (always rendered, shows when isOpen=true):
 *       <HelpPanel
 *         isOpen={helpPanelOpen}
 *         onClose={() => setHelpPanelOpen(false)}
 *         section="dashboard"
 *         language={language}
 *         onViewDocs={() => window.open('/docs', '_blank')}
 *         onViewFAQ={() => window.open('/faq', '_blank')}
 *       />
 *     </div>
 *   )
 * }
 */
