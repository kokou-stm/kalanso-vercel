/**
 * HelpTooltip Component
 * Reusable tooltip component for contextual help throughout Academic Space
 * 
 * Usage:
 * <HelpTooltip section="dashboard" item="courseCode" side="right" />
 */

import React from 'react'
import { Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { getShortHelp } from './help-content'

interface HelpTooltipProps {
  section: 'dashboard' | 'timeline' | 'content' | 'objectives'
  item: string
  side?: 'top' | 'bottom' | 'left' | 'right'
  language?: 'en' | 'fr' | 'de'
  className?: string
  iconClassName?: string
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  section,
  item,
  side = 'right',
  language = 'en',
  className = '',
  iconClassName = ''
}) => {
  const content = getShortHelp(section, item, language)

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={`inline-flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 rounded-sm ${className}`}
            aria-label="Help information"
          >
            <Info className={`h-3 w-3 text-gray-400 hover:text-gray-600 transition-colors cursor-help ${iconClassName}`} />
          </button>
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          className="max-w-xs z-50"
          sideOffset={5}
        >
          <p className="text-sm whitespace-pre-line leading-relaxed">
            {content}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * FieldWithHelp Component
 * Convenience component that combines a label with a help tooltip
 * 
 * Usage:
 * <FieldWithHelp label="Course Code" section="dashboard" item="courseCode">
 *   <Input {...field} />
 * </FieldWithHelp>
 */

interface FieldWithHelpProps {
  label: string
  section: 'dashboard' | 'timeline' | 'content' | 'objectives'
  item: string
  language?: 'en' | 'fr' | 'de'
  required?: boolean
  children: React.ReactNode
  className?: string
}

export const FieldWithHelp: React.FC<FieldWithHelpProps> = ({
  label,
  section,
  item,
  language = 'en',
  required = false,
  children,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <HelpTooltip 
          section={section} 
          item={item} 
          language={language}
        />
      </div>
      {children}
    </div>
  )
}

/**
 * Example Usage in a Form:
 * 
 * import { FieldWithHelp } from '@/components/help/HelpTooltip'
 * 
 * <FieldWithHelp 
 *   label="Course Code" 
 *   section="dashboard" 
 *   item="courseCode"
 *   language={currentLanguage}
 *   required
 * >
 *   <Input
 *     placeholder="e.g., CUL-101"
 *     value={courseCode}
 *     onChange={(e) => setCourseCode(e.target.value)}
 *   />
 * </FieldWithHelp>
 */
