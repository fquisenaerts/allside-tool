// Function to detect the language of a text
export async function detectLanguage(text: string): Promise<string> {
  try {
    // Default to English for empty text
    if (!text || typeof text !== "string" || text.trim() === "") {
      return "en"
    }

    // Simple language detection based on common words
    const sample = text.toLowerCase().slice(0, 200)

    // Check for common French words
    if (/\b(le|la|les|un|une|des|et|ou|je|tu|il|elle|nous|vous|ils|elles|est|sont)\b/.test(sample)) {
      return "fr"
    }

    // Check for common Spanish words
    if (/\b(el|la|los|las|un|una|unos|unas|y|o|yo|tu|el|ella|nosotros|vosotros|ellos|ellas|es|son)\b/.test(sample)) {
      return "es"
    }

    // Check for common German words
    if (/\b(der|die|das|ein|eine|und|oder|ich|du|er|sie|wir|ihr|sie|ist|sind)\b/.test(sample)) {
      return "de"
    }

    // Default to English
    return "en"
  } catch (error) {
    console.error("Error in language detection:", error)
    return "en" // Default to English on any error
  }
}

// Helper function to implement exponential backoff for API calls
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 5): Promise<Response> {
  let retries = 0
  let lastError: Error | null = null

  while (retries < maxRetries) {
    try {
      const response = await fetch(url, options)

      // If we get a rate limit error, retry with exponential backoff
      if (response.status === 429) {
        const retryAfter = response.headers.get("retry-after")
          ? Number.parseInt(response.headers.get("retry-after") || "1")
          : Math.pow(2, retries) // Exponential backoff: 1s, 2s, 4s, 8s, 16s

        console.log(`Rate limited. Retrying after ${retryAfter} seconds...`)
        await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000))
        retries++
        continue
      }

      return response
    } catch (error) {
      console.error(`API call failed (attempt ${retries + 1}/${maxRetries}):`, error)
      lastError = error instanceof Error ? error : new Error(String(error))

      // Wait before retrying (exponential backoff)
      const delay = Math.pow(2, retries) * 1000
      await new Promise((resolve) => setTimeout(resolve, delay))
      retries++
    }
  }

  throw lastError || new Error("Maximum retries reached")
}

// Function to analyze text using OpenAI with improved error handling and retries
export async function analyzeWithOpenAI(review: string, language: string): Promise<any> {
  console.log("Starting OpenAI analysis...")
  console.log("Review input:", review ? review.substring(0, 100) + "..." : "empty")
  console.log("Language:", language)

  // Default result in case of error
  const defaultResult = {
    sentiment: "neutral",
    score: 0.5,
    themes: ["quality"],
    emotions: ["neutral"],
    strengths: ["quality"],
    weaknesses: ["price"],
  }

  try {
    // Handle empty reviews
    if (!review || typeof review !== "string" || review.trim() === "") {
      console.log("Empty review, returning default analysis")
      return defaultResult
    }

    // Limit review length to avoid token issues
    const limitedReview = review.length > 2000 ? review.substring(0, 2000) + "..." : review

    // Prepare the prompt for OpenAI
    const prompt = `
      Analyze the following customer review and provide a structured analysis with the following elements:
      1. Sentiment (positive, negative, or neutral)
      2. Sentiment score (0.0 to 1.0 where 1.0 is most positive)
      3. Main themes discussed (e.g., price, quality, service, etc.)
      4. Emotions expressed (e.g., satisfaction, disappointment, joy, frustration, etc.)
      5. Strengths mentioned
      6. Weaknesses mentioned

      Review: "${limitedReview}"

      Respond in JSON format only, like this:
      {
        "sentiment": "positive/negative/neutral",
        "score": 0.X,
        "themes": ["theme1", "theme2", ...],
        "emotions": ["emotion1", "emotion2", ...],
        "strengths": ["strength1", "strength2", ...],
        "weaknesses": ["weakness1", "weakness2", ...]
      }
    `

    // Call OpenAI API
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY
    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set in environment variables")
      throw new Error("OpenAI API key is not configured")
    }

    // Use fetchWithRetry instead of fetch to handle rate limits
    const response = await fetchWithRetry(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo", // Use a less expensive model to reduce rate limiting
          messages: [
            {
              role: "system",
              content: "You are an expert in sentiment analysis and customer review interpretation.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.3, // Lower temperature for more consistent results
        }),
      },
      3, // Maximum 3 retries
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`OpenAI API error: ${response.status} - ${errorText}`)
      throw new Error(`Failed to get analysis from OpenAI: ${response.status}`)
    }

    const data = await response.json()

    // Add robust error checking for the response structure
    if (!data || !data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      console.error("Invalid or empty response from OpenAI:", JSON.stringify(data))
      return defaultResult // Return default result instead of throwing
    }

    const analysisText = data.choices[0]?.message?.content

    if (!analysisText) {
      console.error("No content in OpenAI response:", JSON.stringify(data.choices[0]))
      return defaultResult // Return default result instead of throwing
    }

    console.log("OpenAI response:", analysisText)

    // Extract the JSON from the response
    let analysisJson
    try {
      // Try to parse the entire response as JSON
      analysisJson = JSON.parse(analysisText)
    } catch (parseError) {
      console.error("Error parsing JSON directly:", parseError)
      // If that fails, try to extract JSON from the text
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          analysisJson = JSON.parse(jsonMatch[0])
        } catch (nestedParseError) {
          console.error("Error parsing JSON from extracted text:", nestedParseError)
          console.error("Extracted text:", jsonMatch[0])
          return defaultResult // Return default result instead of throwing
        }
      } else {
        console.error("No JSON found in OpenAI response:", analysisText)
        return defaultResult // Return default result instead of throwing
      }
    }

    // Validate and normalize the result
    const result = {
      sentiment: analysisJson.sentiment || defaultResult.sentiment,
      score: typeof analysisJson.score === "number" ? analysisJson.score : defaultResult.score,
      themes: Array.isArray(analysisJson.themes) ? analysisJson.themes : defaultResult.themes,
      emotions: Array.isArray(analysisJson.emotions) ? analysisJson.emotions : defaultResult.emotions,
      strengths: Array.isArray(analysisJson.strengths) ? analysisJson.strengths : defaultResult.strengths,
      weaknesses: Array.isArray(analysisJson.weaknesses) ? analysisJson.weaknesses : defaultResult.weaknesses,
    }

    console.log("Final analysis result:", result)
    return result
  } catch (error) {
    console.error("Error in OpenAI analysis:", error)
    return defaultResult
  }
}

// Legacy function for backward compatibility
export async function analyzeInOriginalLanguage(review: string, language: string): Promise<any> {
  return analyzeWithOpenAI(review, language)
}
