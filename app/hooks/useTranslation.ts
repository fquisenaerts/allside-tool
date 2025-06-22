"use client"

import { useContext } from "react"
import { LanguageContext } from "../contexts/LanguageContext"
import enTranslations from "@/locales/en.json"
import frTranslations from "@/locales/fr.json"

// Define the translations object directly in the hook
const translations = {
  en: enTranslations,
  fr: frTranslations,
}

// Add missing translations for emotions
if (!translations.en.analyze?.commentaries?.emotions?.specific?.comfort) {
  if (!translations.en.analyze) translations.en.analyze = {}
  if (!translations.en.analyze.commentaries) translations.en.analyze.commentaries = {}
  if (!translations.en.analyze.commentaries.emotions) translations.en.analyze.commentaries.emotions = {}
  if (!translations.en.analyze.commentaries.emotions.specific)
    translations.en.analyze.commentaries.emotions.specific = {}

  translations.en.analyze.commentaries.emotions.specific.comfort =
    "Customers who feel comfort are generally satisfied with the reliability and ease of use of your product or service. This indicates you've created a trustworthy experience that meets their basic expectations."
}

if (!translations.fr.analyze?.commentaries?.emotions?.specific?.comfort) {
  if (!translations.fr.analyze) translations.fr.analyze = {}
  if (!translations.fr.analyze.commentaries) translations.fr.analyze.commentaries = {}
  if (!translations.fr.analyze.commentaries.emotions) translations.fr.analyze.commentaries.emotions = {}
  if (!translations.fr.analyze.commentaries.emotions.specific)
    translations.fr.analyze.commentaries.emotions.specific = {}

  translations.fr.analyze.commentaries.emotions.specific.comfort =
    "Les clients qui ressentent du confort sont généralement satisfaits de la fiabilité et de la facilité d'utilisation de votre produit ou service. Cela indique que vous avez créé une expérience fiable qui répond à leurs attentes de base."
}

export function useTranslation() {
  const { language } = useContext(LanguageContext)

  const t = (key: string, replacements: Record<string, string | number> = {}) => {
    try {
      // Split the key by dots to access nested properties
      const keys = key.split(".")

      // Start with the full translations object for the current language
      let value = translations[language] || translations.en

      // Navigate through the nested objects
      for (const k of keys) {
        if (value && typeof value === "object" && k in value) {
          value = value[k]
        } else {
          // If the key doesn't exist in the current language, try English
          if (language !== "en") {
            let fallbackValue = translations.en
            let fallbackFound = true

            // Try to find the key in English
            for (const fallbackKey of keys) {
              if (fallbackValue && typeof fallbackValue === "object" && fallbackKey in fallbackValue) {
                fallbackValue = fallbackValue[fallbackKey]
              } else {
                fallbackFound = false
                break
              }
            }

            if (fallbackFound && typeof fallbackValue === "string") {
              // Don't log warnings in production to avoid console spam
              if (process.env.NODE_ENV !== "production") {
                console.warn(`Using English fallback for: ${key}`)
              }
              value = fallbackValue
            } else {
              // Don't log warnings in production to avoid console spam
              if (process.env.NODE_ENV !== "production") {
                console.warn(`Translation key not found: ${key}`)
              }
              return key
            }
          } else {
            // Don't log warnings in production to avoid console spam
            if (process.env.NODE_ENV !== "production") {
              console.warn(`Translation key not found: ${key}`)
            }
            return key
          }
        }
      }

      // If we found a string, use it; otherwise, return the key as fallback
      let result = typeof value === "string" ? value : key

      // Replace any placeholders with their values
      Object.entries(replacements).forEach(([placeholder, replacement]) => {
        result = result.replace(new RegExp(`{{${placeholder}}}`, "g"), String(replacement))
      })

      return result
    } catch (error) {
      console.error(`Error in translation for key: ${key}`, error)
      return key
    }
  }

  return { t, language }
}
