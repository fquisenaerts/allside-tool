"use client"

import type React from "react"
import { createContext, useState, useEffect, useContext } from "react"

interface LanguageContextProps {
  language: string
  setLanguage: (language: string) => void
}

const LanguageContext = createContext<LanguageContextProps>({
  language: "fr", // Default to "fr" as a fallback
  setLanguage: () => {},
})

// Export the context
export { LanguageContext }

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<string>("fr")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") || "fr"
    setLanguage(savedLanguage)
  }, [])

  useEffect(() => {
    localStorage.setItem("language", language)
  }, [language])

  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>
}

export const useLanguage = () => useContext(LanguageContext)
