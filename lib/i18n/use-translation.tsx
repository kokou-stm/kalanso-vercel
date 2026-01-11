"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { translations, interpolate } from "./translations"
import { type Locale, defaultLocale } from "./config"

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, variables?: Record<string, string | number>) => string
  interpolate: (text: string, variables: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(defaultLocale)

  const t = (key: string, variables?: Record<string, string | number>): string => {
    console.log("[v0] Translation requested:", key, "| Locale:", locale)
    console.log("[v0] Translations object exists:", !!translations)
    console.log("[v0] Locale data exists:", !!translations[locale])

    const keys = key.split(".")
    let value: any = translations[locale]

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k]
      } else {
        console.warn(`[v0] Translation key not found: ${key} at segment: ${k}`)
        console.warn(`[v0] Current value:`, value)
        console.warn(`[v0] Available keys:`, value ? Object.keys(value) : "none")
        return key
      }
    }

    if (typeof value !== "string") {
      console.warn(`[v0] Translation value is not a string: ${key}`, value)
      return key
    }

    console.log("[v0] Translation found:", value)
    return variables ? interpolate(value, variables) : value
  }

  return <I18nContext.Provider value={{ locale, setLocale, t, interpolate }}>{children}</I18nContext.Provider>
}

export function useTranslation() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useTranslation must be used within I18nProvider")
  }
  return context
}
