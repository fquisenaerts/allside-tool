"use client"

import { createContext, useState, useContext, type ReactNode } from "react"
import { getLanguageFromPath, getLocalizedUrl } from "@/lib/urlMapping"
import { usePathname, useRouter } from "next/navigation"

interface LanguageContextType {
  language: string
  setLanguage: (lang: string) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export { LanguageContext }

export function LanguageProvider({ children }: { children: ReactNode }) {
  const rawPathname = usePathname()
  const pathname = rawPathname || "" // Ensure pathname is always a string

  const router = useRouter()

  const initialLanguage = getLanguageFromPath(pathname) || "en"
  const [language, setLanguageState] = useState<string>(initialLanguage)

  const setLanguage = (lang: string) => {
    setLanguageState(lang)
    const newPathname = getLocalizedUrl(pathname, lang) // This now always returns a string
    router.push(newPathname)
  }

  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
