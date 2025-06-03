"use client"

import { useContext } from "react"
import { LanguageContext } from "../contexts/LanguageContext"

export function TranslationDebug() {
  const { language, translations } = useContext(LanguageContext)

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <div className="fixed bottom-0 right-0 bg-black text-white p-4 text-xs max-w-xs max-h-64 overflow-auto z-50">
      <h3 className="font-bold mb-2">Translation Debug</h3>
      <p>Current language: {language}</p>
      <p>Translations loaded: {translations && Object.keys(translations).length > 0 ? "Yes" : "No"}</p>
      <p>Available languages: {translations ? Object.keys(translations).join(", ") : "None"}</p>

      <details>
        <summary className="cursor-pointer">Header keys</summary>
        <pre>{JSON.stringify(translations?.[language]?.header || {}, null, 2)}</pre>
      </details>
    </div>
  )
}
