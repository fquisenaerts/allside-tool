import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

// Helper function to clean and parse JSON responses
function cleanJsonResponse(text: string): any {
  try {
    // First try direct parsing
    return JSON.parse(text)
  } catch (e) {
    try {
      // Try to extract JSON if wrapped in other text
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (e2) {
      // If that fails, try to clean the string more aggressively
      const cleaned = text
        .replace(/```json|```/g, "") // Remove code blocks
        .replace(/^[^{]*/, "") // Remove any text before the first {
        .replace(/[^}]*$/, "") // Remove any text after the last }
        .trim()

      try {
        return JSON.parse(cleaned)
      } catch (e3) {
        console.error("Failed to parse JSON after cleaning:", e3)
        console.log("Raw text:", text)
        // Return a simple string if all parsing attempts fail
        return text
      }
    }
  }
}

export async function detectLanguage(text: string) {
  try {
    // If text is empty or not a string, return English as default
    if (!text || typeof text !== "string" || text.trim() === "") {
      return "en"
    }

    const { text: detectedLanguage } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Detect the language of the following text and respond with only the ISO 639-1 two-letter language code:

      "${text.slice(0, 500)}..."
      
      Language code:`,
      temperature: 0.1, // Lower temperature for more consistent results
      maxTokens: 10, // We only need a short response
    })

    return detectedLanguage.trim() || "en"
  } catch (error) {
    console.error("Error detecting language:", error)
    return "en" // Default to English on error
  }
}

export async function translateToEnglish(text: string, sourceLanguage: string) {
  // If text is empty or not a string, return empty string
  if (!text || typeof text !== "string" || text.trim() === "") {
    return ""
  }

  // If source language is already English or undefined, return the original text
  if (!sourceLanguage || sourceLanguage === "en") {
    return text
  }

  try {
    console.log(`Translating text from ${sourceLanguage} to English...`)

    const { text: translatedText } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Translate the following ${sourceLanguage} text to English:

      "${text}"
      
      English translation:`,
      temperature: 0.3, // Lower temperature for more accurate translations
      maxTokens: Math.max(text.length * 2, 1000), // Ensure enough tokens for translation
    })

    if (!translatedText) {
      console.warn("Translation returned empty result, using original text")
      return text
    }

    return translatedText.trim() || text
  } catch (error) {
    console.error("Error translating to English:", error)
    // Log more details about the error
    if (error.response) {
      console.error("API response error:", error.response.data)
    }
    return text // Return original text on error
  }
}
