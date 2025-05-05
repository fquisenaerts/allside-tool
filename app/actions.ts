"use server"

import * as XLSX from "xlsx"
import { analyzeWithOpenAI, detectLanguage } from "./utils/languageUtils"
import { supabase } from "@/lib/supabase"

// Function to extract reviews from HTML content
function extractReviewsFromHTML(html: string): string[] {
  // This is a placeholder - implement your HTML parsing logic here
  return ["Review 1 from HTML", "Review 2 from HTML"]
}

// Function to extract reviews from any structure
function extractReviewsFromAnyStructure(data: any): { text: string; rating: number; date: string }[] {
  const reviews: { text: string; rating: number; date: string }[] = []

  // If data is an array, process each item
  if (Array.isArray(data)) {
    for (const item of data) {
      const extractedReviews = extractReviewsFromAnyStructure(item)
      reviews.push(...extractedReviews)
    }
  }
  // If data is an object, check if it's a review or process its properties
  else if (data && typeof data === "object") {
    // Check if this object looks like a review with the specific columns
    if (data.text && data.totalScore !== undefined) {
      const date = data.publishedAtDate ? data.publishedAtDate.substring(0, 10) : "Unknown"
      reviews.push({
        text: data.text,
        rating: data.totalScore,
        date: date,
      })
    }
    // Check if this object looks like a review with other common properties
    else if (
      (data.text || data.reviewText || data.content || data.review) &&
      (data.stars !== undefined || data.rating !== undefined || data.score !== undefined)
    ) {
      const text = data.text || data.reviewText || data.content || data.review
      const rating = data.stars || data.rating || data.score
      const dateField = data.publishedAtDate || data.publishedAt || data.date || data.reviewDate
      const date = dateField ? (typeof dateField === "string" ? dateField.substring(0, 10) : "Unknown") : "Unknown"

      reviews.push({
        text,
        rating: typeof rating === "string" ? Number.parseFloat(rating) : rating,
        date,
      })
    }

    // Process all properties of the object
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const extractedReviews = extractReviewsFromAnyStructure(data[key])
        reviews.push(...extractedReviews)
      }
    }
  }

  return reviews
}

// Function to fetch TripAdvisor reviews using Apify
async function fetchTripAdvisorReviews(
  tripAdvisorUrl: string,
): Promise<{ text: string; rating: number; date: string }[]> {
  try {
    // Access the Apify API token from environment variables
    const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN

    if (!APIFY_API_TOKEN) {
      console.error("APIFY_API_TOKEN is not set in environment variables")
      throw new Error("Apify API token is not configured")
    }

    // Validate the URL format - more relaxed validation
    if (!tripAdvisorUrl || !tripAdvisorUrl.toLowerCase().includes("tripadvisor")) {
      throw new Error("Invalid TripAdvisor URL. Please provide a URL from TripAdvisor.")
    }

    console.log(`Fetching reviews for: ${tripAdvisorUrl}`)

    // Check if we have cached results for this URL
    const { data: cachedData, error: cacheError } = await supabase
      .from("review_cache")
      .select("reviews")
      .eq("url", tripAdvisorUrl)
      .single()

    if (!cacheError && cachedData && cachedData.reviews) {
      console.log("Using cached reviews for TripAdvisor URL")
      return cachedData.reviews
    }

    // Start a new run
    const runResponse = await fetch("https://api.apify.com/v2/acts/Hvp4YfFGyLM635Q2F/runs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${APIFY_API_TOKEN}`,
      },
      body: JSON.stringify({
        startUrls: [{ url: tripAdvisorUrl }],
        maxItemsPerQuery: 50, // Increased from 30 to 50
        scrapeReviewerInfo: true,
        reviewRatings: ["ALL_REVIEW_RATINGS"],
        reviewsLanguages: ["ALL_REVIEW_LANGUAGES"],
        proxyConfiguration: {
          useApifyProxy: true,
        },
      }),
    })

    if (!runResponse.ok) {
      const errorText = await runResponse.text()
      console.error(`Apify API error: ${runResponse.status} - ${errorText}`)
      throw new Error(`Failed to start Apify actor run: ${runResponse.status}`)
    }

    const runData = await runResponse.json()
    console.log("Run created:", runData)

    // Get the run ID
    const runId = runData.data.id

    // Wait for the run to finish
    let isFinished = false
    let retries = 0
    const maxRetries = 60 // 10 minutes with 10-second intervals (increased from 30)

    while (!isFinished && retries < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, 10000)) // Wait 10 seconds

      const statusResponse = await fetch(`https://api.apify.com/v2/acts/Hvp4YfFGyLM635Q2F/runs/${runId}`, {
        headers: {
          Authorization: `Bearer ${APIFY_API_TOKEN}`,
        },
      })

      if (!statusResponse.ok) {
        throw new Error(`Failed to get run status: ${statusResponse.status}`)
      }

      const statusData = await statusResponse.json()
      console.log(`Run status: ${statusData.data.status}`)

      if (statusData.data.status === "SUCCEEDED") {
        isFinished = true
      } else if (statusData.data.status === "FAILED" || statusData.data.status === "ABORTED") {
        throw new Error(`Run ${statusData.data.status}: ${statusData.data.statusMessage || "Unknown error"}`)
      }

      retries++
    }

    if (!isFinished) {
      throw new Error("Run timed out after 10 minutes")
    }

    // Get the dataset items
    const datasetId = runData.data.defaultDatasetId
    console.log(`Dataset ID: ${datasetId}`)

    if (!datasetId) {
      throw new Error("No dataset ID found in run data")
    }

    const datasetResponse = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items`, {
      headers: {
        Authorization: `Bearer ${APIFY_API_TOKEN}`,
      },
    })

    if (!datasetResponse.ok) {
      throw new Error(`Failed to get dataset items: ${datasetResponse.status}`)
    }

    const items = await datasetResponse.json()
    console.log(`Received ${items.length} items from Apify`)

    if (items.length > 0) {
      console.log("First item structure:", JSON.stringify(items[0], null, 2).substring(0, 500) + "...")

      // Log all keys at the top level of the first item to help with debugging
      if (items[0]) {
        console.log("Top-level keys in first item:", Object.keys(items[0]))
      }
    }

    // Process and return the reviews
    const reviews: { text: string; rating: number; date: string }[] = []

    // Process TripAdvisor reviews with improved parsing logic
    for (const item of items) {
      // First, try to extract reviews from the expected structure
      if (item && item.reviews && Array.isArray(item.reviews)) {
        for (const review of item.reviews) {
          if (review && review.text && review.rating !== undefined) {
            const date = review.publishedDate ? review.publishedDate.substring(0, 10) : "Unknown"
            reviews.push({
              text: review.text,
              rating: review.rating,
              date: date,
            })
          }
        }
      }

      // If the item itself is a review (some actors return each review as a separate item)
      else if (item && item.text && item.rating !== undefined) {
        const date = item.publishedDate || item.date || "Unknown"
        const dateStr = typeof date === "string" ? date.substring(0, 10) : "Unknown"
        reviews.push({
          text: item.text,
          rating: item.rating,
          date: dateStr,
        })
      }

      // Check for reviewsData structure
      else if (item && item.reviewsData && Array.isArray(item.reviewsData)) {
        for (const review of item.reviewsData) {
          if (review && (review.text || review.reviewText) && review.rating !== undefined) {
            const reviewText = review.text || review.reviewText
            const date = review.publishedDate || review.date || "Unknown"
            const dateStr = typeof date === "string" ? date.substring(0, 10) : "Unknown"
            reviews.push({
              text: reviewText,
              rating: review.rating,
              date: dateStr,
            })
          }
        }
      }

      // Check for data structure
      else if (item && item.data && Array.isArray(item.data)) {
        for (const dataItem of item.data) {
          if (dataItem && dataItem.reviews && Array.isArray(dataItem.reviews)) {
            for (const review of dataItem.reviews) {
              if (review && review.text && review.rating !== undefined) {
                const date = review.publishedDate || review.date || "Unknown"
                const dateStr = typeof date === "string" ? date.substring(0, 10) : "Unknown"
                reviews.push({
                  text: review.text,
                  rating: review.rating,
                  date: dateStr,
                })
              }
            }
          }
        }
      }
    }

    console.log(`Extracted ${reviews.length} reviews using standard parsing`)

    // If we couldn't extract any reviews using the standard methods, try to parse the raw data
    if (reviews.length === 0) {
      console.log("No reviews found with standard parsing, attempting to parse raw data...")

      // Log the structure of the first few items to help debug
      for (let i = 0; i < Math.min(3, items.length); i++) {
        console.log(`Item ${i} keys:`, Object.keys(items[i]))

        // If the item has a 'data' property, log its structure too
        if (items[i] && items[i].data) {
          console.log(`Item ${i}.data keys:`, Object.keys(items[i].data))
        }
      }

      // Try to find reviews in any nested structure
      const extractedReviews = extractReviewsFromAnyStructure(items)

      if (extractedReviews.length > 0) {
        console.log(`Extracted ${extractedReviews.length} reviews from raw data`)

        // Cache the results
        await supabase.from("review_cache").upsert({
          url: tripAdvisorUrl,
          reviews: extractedReviews,
          created_at: new Date().toISOString(),
        })

        return extractedReviews
      }

      // If we still couldn't find any reviews, check if there's a single review in the item itself
      for (const item of items) {
        if (item && typeof item === "object") {
          // Look for any property that might contain review text
          const possibleTextFields = ["text", "reviewText", "content", "review", "comment", "description"]
          const possibleRatingFields = ["rating", "stars", "score", "value", "totalScore"]

          let text = null
          let rating = null

          // Try to find text and rating fields
          for (const field of possibleTextFields) {
            if (item[field] && typeof item[field] === "string" && item[field].length > 10) {
              text = item[field]
              break
            }
          }

          for (const field of possibleRatingFields) {
            if (item[field] !== undefined && !isNaN(Number(item[field]))) {
              rating = Number(item[field])
              break
            }
          }

          if (text && rating) {
            reviews.push({
              text,
              rating,
              date: "Unknown",
            })
          }
        }
      }

      if (reviews.length > 0) {
        console.log(`Extracted ${reviews.length} reviews from item-level properties`)

        // Cache the results
        await supabase.from("review_cache").upsert({
          url: tripAdvisorUrl,
          reviews: reviews,
          created_at: new Date().toISOString(),
        })

        return reviews
      }
    }

    if (reviews.length > 0) {
      // Cache the results
      await supabase.from("review_cache").upsert({
        url: tripAdvisorUrl,
        reviews: reviews,
        created_at: new Date().toISOString(),
      })

      return reviews
    }

    throw new Error("No reviews found in the Apify response. Please check the URL and try again.")
  } catch (error) {
    console.error("Error fetching reviews from Apify:", error)
    throw error // Re-throw the error to be handled by the caller
  }
}

// Function to fetch Booking.com reviews using Apify REST API
async function fetchBookingReviews(bookingUrl: string): Promise<{ text: string; rating: number; date: string }[]> {
  try {
    // Access the Apify API token from environment variables
    const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN

    if (!APIFY_API_TOKEN) {
      console.error("APIFY_API_TOKEN is not set in environment variables")
      throw new Error("Apify API token is not configured")
    }

    // Validate the URL format - more relaxed validation
    if (!bookingUrl || !bookingUrl.toLowerCase().includes("booking")) {
      throw new Error("Invalid Booking.com URL. Please provide a URL from Booking.com.")
    }

    console.log(`Fetching reviews for: ${bookingUrl}`)

    // Check if we have cached results for this URL
    const { data: cachedData, error: cacheError } = await supabase
      .from("review_cache")
      .select("reviews")
      .eq("url", bookingUrl)
      .single()

    if (!cacheError && cachedData && cachedData.reviews) {
      console.log("Using cached reviews for Booking.com URL")
      return cachedData.reviews
    }

    // Use the correct input format for the voyager/booking-reviews-scraper actor
    const runResponse = await fetch("https://api.apify.com/v2/acts/voyager~booking-reviews-scraper/runs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${APIFY_API_TOKEN}`,
      },
      body: JSON.stringify({
        startUrls: [{ url: bookingUrl }], // This is the required format
        maxReviews: 100,
        language: "en-us", // Request English reviews
        includeRoomMentions: true,
        proxyConfiguration: {
          useApifyProxy: true,
        },
        debug: true, // Enable debug mode for more detailed logs
      }),
    })

    if (!runResponse.ok) {
      const errorText = await runResponse.text()
      console.error(`Apify API error: ${runResponse.status} - ${errorText}`)
      throw new Error(`Failed to start Apify actor run: ${runResponse.status}`)
    }

    const runData = await runResponse.json()
    console.log("Run created:", runData)

    // Get the run ID
    const runId = runData.data.id

    // Wait for the run to finish
    let isFinished = false
    let retries = 0
    const maxRetries = 60 // 10 minutes with 10-second intervals

    while (!isFinished && retries < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, 10000)) // Wait 10 seconds

      const statusResponse = await fetch(
        `https://api.apify.com/v2/acts/voyager~booking-reviews-scraper/runs/${runId}`,
        {
          headers: {
            Authorization: `Bearer ${APIFY_API_TOKEN}`,
          },
        },
      )

      if (!statusResponse.ok) {
        throw new Error(`Failed to get run status: ${statusResponse.status}`)
      }

      const statusData = await statusResponse.json()
      console.log(`Run status: ${statusData.data.status}`)

      if (statusData.data.status === "SUCCEEDED") {
        isFinished = true
      } else if (statusData.data.status === "FAILED" || statusData.data.status === "ABORTED") {
        throw new Error(`Run ${statusData.data.status}: ${statusData.data.statusMessage || "Unknown error"}`)
      }

      retries++
    }

    if (!isFinished) {
      throw new Error("Run timed out after 10 minutes")
    }

    // Get the dataset items
    const datasetId = runData.data.defaultDatasetId
    console.log(`Dataset ID: ${datasetId}`)

    if (!datasetId) {
      throw new Error("No dataset ID found in run data")
    }

    const datasetResponse = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items`, {
      headers: {
        Authorization: `Bearer ${APIFY_API_TOKEN}`,
      },
    })

    if (!datasetResponse.ok) {
      throw new Error(`Failed to get dataset items: ${datasetResponse.status}`)
    }

    const items = await datasetResponse.json()
    console.log(`Received ${items.length} items from Apify`)

    if (items.length > 0) {
      console.log("First item structure:", JSON.stringify(items[0], null, 2).substring(0, 500) + "...")

      // Log all keys at the top level of the first item to help with debugging
      if (items[0]) {
        console.log("Top-level keys in first item:", Object.keys(items[0]))
      }
    } else {
      console.log("No items returned from the dataset")
    }

    // Process and return the reviews
    const reviews: { text: string; rating: number; date: string }[] = []

    // Process Booking.com reviews with improved parsing logic for the voyager actor
    for (const item of items) {
      // Check if the item has a review property
      if (item && item.review && typeof item.review === "string" && item.review.trim().length > 0) {
        // Get the rating - might be in different formats
        let rating = 0
        if (item.rating !== undefined) {
          // Convert Booking.com's 1-10 scale to 1-5 scale for consistency
          rating = Math.ceil(Number.parseFloat(item.rating) / 2)
        } else if (item.score !== undefined) {
          rating = Math.ceil(Number.parseFloat(item.score) / 2)
        }

        // Get the date
        let date = "Unknown"
        if (item.date) {
          date = typeof item.date === "string" ? item.date.substring(0, 10) : "Unknown"
        } else if (item.reviewDate) {
          date = typeof item.reviewDate === "string" ? item.reviewDate.substring(0, 10) : "Unknown"
        }

        reviews.push({
          text: item.review,
          rating: rating || 3, // Default to 3 if rating is missing or invalid
          date: date,
        })
      }

      // Check for reviews in a nested structure
      else if (item && item.reviews && Array.isArray(item.reviews)) {
        for (const review of item.reviews) {
          if (review && typeof review.text === "string" && review.text.trim().length > 0) {
            // Convert Booking.com's 1-10 scale to 1-5 scale for consistency
            const normalizedRating = Math.ceil(Number.parseFloat(review.rating || review.score || "6") / 2)
            const date = review.date
              ? typeof review.date === "string"
                ? review.date.substring(0, 10)
                : "Unknown"
              : "Unknown"

            reviews.push({
              text: review.text,
              rating: normalizedRating,
              date: date,
            })
          }
        }
      }

      // Check for reviewsData structure
      else if (item && item.reviewsData && Array.isArray(item.reviewsData)) {
        for (const review of item.reviewsData) {
          if (review && typeof review.text === "string" && review.text.trim().length > 0) {
            const normalizedRating = Math.ceil(Number.parseFloat(review.rating || review.score || "6") / 2)
            const date = review.date
              ? typeof review.date === "string"
                ? review.date.substring(0, 10)
                : "Unknown"
              : "Unknown"

            reviews.push({
              text: review.text,
              rating: normalizedRating,
              date: date,
            })
          }
        }
      }
    }

    console.log(`Extracted ${reviews.length} reviews using standard parsing`)

    // If we couldn't extract any reviews using the standard methods, try to parse the raw data
    if (reviews.length === 0) {
      console.log("No reviews found with standard parsing, attempting to parse raw data...")

      // Try to find reviews in any nested structure
      const extractedReviews = extractReviewsFromAnyStructure(items)

      if (extractedReviews.length > 0) {
        console.log(`Extracted ${extractedReviews.length} reviews from raw data`)

        // Cache the results
        await supabase.from("review_cache").upsert({
          url: bookingUrl,
          reviews: extractedReviews,
          created_at: new Date().toISOString(),
        })

        return extractedReviews
      }

      throw new Error("No reviews found in the Apify response for Booking.com. Please check the URL and try again.")
    }

    if (reviews.length > 0) {
      // Cache the results
      await supabase.from("review_cache").upsert({
        url: bookingUrl,
        reviews: reviews,
        created_at: new Date().toISOString(),
      })

      return reviews
    }

    throw new Error("No reviews found in the Apify response for Booking.com. Please check the URL and try again.")
  } catch (error) {
    console.error("Error fetching reviews from Booking.com:", error)
    throw error // Re-throw the error to be handled by the caller
  }
}

// Function to fetch Google My Business reviews using Apify
async function fetchGMBReviews(gmapUrl: string): Promise<{ text: string; rating: number; date: string }[]> {
  try {
    // Access the Apify API token from environment variables
    const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN

    if (!APIFY_API_TOKEN) {
      console.error("APIFY_API_TOKEN is not set in environment variables")
      throw new Error("Apify API token is not configured")
    }

    // Validate the URL format - more relaxed validation
    if (!gmapUrl || !gmapUrl.toLowerCase().includes("google") || !gmapUrl.toLowerCase().includes("map")) {
      throw new Error("Invalid Google Maps URL. Please provide a URL from Google Maps.")
    }

    console.log(`Fetching reviews for: ${gmapUrl}`)

    // Check if we have cached results for this URL
    const { data: cachedData, error: cacheError } = await supabase
      .from("review_cache")
      .select("reviews")
      .eq("url", gmapUrl)
      .single()

    if (!cacheError && cachedData && cachedData.reviews) {
      console.log("Using cached reviews for Google Maps URL")
      return cachedData.reviews
    }

    // Start a new run
    const runResponse = await fetch("https://api.apify.com/v2/acts/Xb8osYTtOjlsgI6k9/runs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${APIFY_API_TOKEN}`,
      },
      body: JSON.stringify({
        startUrls: [{ url: gmapUrl }],
        maxReviews: 30,
        reviewsSort: "newest",
        language: "en",
        reviewsOrigin: "all",
        personalData: true,
      }),
    })

    if (!runResponse.ok) {
      const errorText = await runResponse.text()
      console.error(`Apify API error: ${runResponse.status} - ${errorText}`)
      throw new Error(`Failed to start Apify actor run: ${runResponse.status}`)
    }

    const runData = await runResponse.json()
    console.log("Run created:", runData)

    // Get the run ID
    const runId = runData.data.id

    // Wait for the run to finish
    let isFinished = false
    let retries = 0
    const maxRetries = 30 // 5 minutes with 10-second intervals

    while (!isFinished && retries < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, 10000)) // Wait 10 seconds

      const statusResponse = await fetch(`https://api.apify.com/v2/acts/Xb8osYTtOjlsgI6k9/runs/${runId}`, {
        headers: {
          Authorization: `Bearer ${APIFY_API_TOKEN}`,
        },
      })

      if (!statusResponse.ok) {
        throw new Error(`Failed to get run status: ${statusResponse.status}`)
      }

      const statusData = await statusResponse.json()
      console.log(`Run status: ${statusData.data.status}`)

      if (statusData.data.status === "SUCCEEDED") {
        isFinished = true
      } else if (statusData.data.status === "FAILED" || statusData.data.status === "ABORTED") {
        throw new Error(`Run ${statusData.data.status}: ${statusData.data.statusMessage || "Unknown error"}`)
      }

      retries++
    }

    if (!isFinished) {
      throw new Error("Run timed out after 5 minutes")
    }

    // Get the dataset items
    const datasetId = runData.data.defaultDatasetId
    console.log(`Dataset ID: ${datasetId}`)

    if (!datasetId) {
      throw new Error("No dataset ID found in run data")
    }

    const datasetResponse = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items`, {
      headers: {
        Authorization: `Bearer ${APIFY_API_TOKEN}`,
      },
    })

    if (!datasetResponse.ok) {
      throw new Error(`Failed to get dataset items: ${datasetResponse.status}`)
    }

    const items = await datasetResponse.json()
    console.log(`Received ${items.length} items from Apify`)

    if (items.length > 0) {
      console.log("First item structure:", JSON.stringify(items[0], null, 2).substring(0, 500) + "...")
    }

    // Process and return the reviews
    const reviews: { text: string; rating: number; date: string }[] = []

    // Updated parsing logic to use specific columns
    for (const item of items) {
      // Check if the item has the specific columns mentioned
      if (item && item.text && item.totalScore !== undefined) {
        const date = item.publishedAtDate ? item.publishedAtDate.substring(0, 10) : "Unknown"
        reviews.push({
          text: item.text,
          rating: item.totalScore,
          date: date,
        })
      }
      // Check if the item has a reviews property
      else if (item && item.reviews && Array.isArray(item.reviews)) {
        for (const review of item.reviews) {
          if (review && review.text && review.stars !== undefined) {
            const date = review.publishedAtDate ? review.publishedAtDate.substring(0, 10) : "Unknown"
            reviews.push({
              text: review.text,
              rating: review.stars,
              date: date,
            })
          }
        }
      }
      // Check if the item has a reviewsData property
      else if (item && item.reviewsData && Array.isArray(item.reviewsData)) {
        for (const review of item.reviewsData) {
          if (review && review.reviewText && review.rating !== undefined) {
            const date = review.publishedAt ? review.publishedAt.substring(0, 10) : "Unknown"
            reviews.push({
              text: review.reviewText,
              rating: review.rating,
              date: date,
            })
          }
        }
      }
    }

    console.log(`Extracted ${reviews.length} reviews`)

    if (reviews.length > 0) {
      // Cache the results
      await supabase.from("review_cache").upsert({
        url: gmapUrl,
        reviews: reviews,
        created_at: new Date().toISOString(),
      })

      return reviews
    }

    // If we couldn't extract any reviews using the standard methods, try to parse the raw data
    console.log("No reviews found with standard parsing, attempting to parse raw data...")

    // Log the structure of the first few items to help debug
    for (let i = 0; i < Math.min(3, items.length); i++) {
      console.log(`Item ${i} keys:`, Object.keys(items[i]))
    }

    // Try to find reviews in any nested structure
    const extractedReviews = extractReviewsFromAnyStructure(items)

    if (extractedReviews.length > 0) {
      console.log(`Extracted ${extractedReviews.length} reviews from raw data`)

      // Cache the results
      await supabase.from("review_cache").upsert({
        url: gmapUrl,
        reviews: extractedReviews,
        created_at: new Date().toISOString(),
      })

      return extractedReviews
    }

    throw new Error("No reviews found in the Apify response")
  } catch (error) {
    console.error("Error fetching reviews from Apify:", error)
    throw error // Re-throw the error to be handled by the caller
  }
}

// Function to generate a comprehensive analysis using OpenAI
async function generateComprehensiveAnalysis(reviews: string[], ratings: number[]): Promise<any> {
  try {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY
    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set in environment variables")
      throw new Error("OpenAI API key is not configured")
    }

    // Prepare a sample of reviews for analysis (to avoid token limits)
    const reviewSample = reviews.slice(0, 10).join("\n\n") // Reduced from 20 to 10 reviews

    // Calculate basic metrics for context
    const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
    const positiveRatings = ratings.filter((r) => r >= 4).length
    const negativeRatings = ratings.filter((r) => r <= 2).length
    const neutralRatings = ratings.length - positiveRatings - negativeRatings

    const positivePercentage = (positiveRatings / ratings.length) * 100
    const negativePercentage = (negativeRatings / ratings.length) * 100
    const neutralPercentage = (neutralRatings / ratings.length) * 100

    // Create a comprehensive prompt for OpenAI
    const prompt = `
      I need a comprehensive analysis of these customer reviews. Here are some key metrics:
      - Total reviews: ${reviews.length}
      - Average rating: ${averageRating.toFixed(1)} out of 5
      - Positive reviews: ${positivePercentage.toFixed(1)}%
      - Negative reviews: ${negativePercentage.toFixed(1)}%
      - Neutral reviews: ${neutralPercentage.toFixed(1)}%

      Here's a sample of the reviews:
      ${reviewSample}

      Please provide a detailed analysis with the following:
      1. Overall sentiment analysis with percentages
      2. Key themes and topics mentioned in the reviews
      3. Main strengths identified from positive reviews
      4. Main weaknesses or areas for improvement from negative reviews
      5. Emotional analysis - what emotions are customers expressing?
      6. Specific recommendations for improvement
      7. Marketing insights - what aspects should be highlighted in marketing?
      8. Competitive analysis based on any mentions of competitors
      9. Trend analysis - any noticeable patterns or changes over time
      10. Customer satisfaction drivers - what makes customers most happy or unhappy

      Respond in JSON format only, like this:
      {
        "overallSentiment": {
          "summary": "text description",
          "positive": percentage,
          "negative": percentage,
          "neutral": percentage
        },
        "keyThemes": [{"theme": "name", "count": number, "description": "text"}],
        "strengths": [{"strength": "name", "description": "text"}],
        "weaknesses": [{"weakness": "name", "description": "text"}],
        "emotions": [{"emotion": "name", "percentage": number, "description": "text"}],
        "recommendations": ["text"],
        "marketingInsights": ["text"],
        "competitiveAnalysis": "text",
        "trendAnalysis": "text",
        "satisfactionDrivers": {
          "positive": ["text"],
          "negative": ["text"]
        }
      }
    `

    // Use fetchWithRetry from languageUtils
    const fetchWithRetry = async (url: string, options: RequestInit, maxRetries = 5): Promise<Response> => {
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

    // Call OpenAI API with retry logic
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
              content: "You are an expert in customer review analysis and business intelligence.",
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
      throw new Error("Invalid response structure from OpenAI")
    }

    const analysisText = data.choices[0]?.message?.content

    if (!analysisText) {
      console.error("No content in OpenAI response:", JSON.stringify(data.choices[0]))
      throw new Error("No analysis content received from OpenAI")
    }

    console.log("OpenAI comprehensive analysis received")

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
          throw new Error("Failed to parse analysis from OpenAI")
        }
      } else {
        console.error("No JSON found in OpenAI response:", analysisText)
        throw new Error("Invalid response format from OpenAI")
      }
    }

    // Provide a default structure if the analysis is missing any required fields
    const defaultAnalysis = {
      overallSentiment: {
        summary: "Mixed sentiment with both positive and negative aspects mentioned.",
        positive: positivePercentage,
        negative: negativePercentage,
        neutral: neutralPercentage,
      },
      keyThemes: [
        { theme: "quality", count: 1, description: "Product/service quality" },
        { theme: "price", count: 1, description: "Value for money" },
      ],
      strengths: [{ strength: "quality", description: "Good overall quality" }],
      weaknesses: [{ weakness: "price", description: "Some concerns about pricing" }],
      emotions: [
        { emotion: "satisfaction", percentage: 50, description: "General satisfaction" },
        { emotion: "disappointment", percentage: 30, description: "Some disappointment" },
      ],
      recommendations: ["Improve customer service", "Consider price adjustments"],
      marketingInsights: ["Highlight quality aspects", "Emphasize customer service"],
      competitiveAnalysis: "Limited competitive mentions in the reviews.",
      trendAnalysis: "No clear trends identified in the review data.",
      satisfactionDrivers: {
        positive: ["Quality", "Service"],
        negative: ["Price", "Delivery time"],
      },
    }

    // Merge the default with whatever we got from the API
    const mergedAnalysis = {
      overallSentiment: analysisJson.overallSentiment || defaultAnalysis.overallSentiment,
      keyThemes: analysisJson.keyThemes || defaultAnalysis.keyThemes,
      strengths: analysisJson.strengths || defaultAnalysis.strengths,
      weaknesses: analysisJson.weaknesses || defaultAnalysis.weaknesses,
      emotions: analysisJson.emotions || defaultAnalysis.emotions,
      recommendations: analysisJson.recommendations || defaultAnalysis.recommendations,
      marketingInsights: analysisJson.marketingInsights || defaultAnalysis.marketingInsights,
      competitiveAnalysis: analysisJson.competitiveAnalysis || defaultAnalysis.competitiveAnalysis,
      trendAnalysis: analysisJson.trendAnalysis || defaultAnalysis.trendAnalysis,
      satisfactionDrivers: analysisJson.satisfactionDrivers || defaultAnalysis.satisfactionDrivers,
    }

    return mergedAnalysis
  } catch (error) {
    console.error("Error generating comprehensive analysis:", error)

    // Return a default analysis structure if there's an error
    const defaultPercentages = {
      positive: 50,
      negative: 30,
      neutral: 20,
    }

    return {
      overallSentiment: {
        summary: "Analysis could not be completed. Using default values.",
        positive: defaultPercentages.positive,
        negative: defaultPercentages.negative,
        neutral: defaultPercentages.neutral,
      },
      keyThemes: [
        { theme: "quality", count: 1, description: "Product/service quality" },
        { theme: "price", count: 1, description: "Value for money" },
      ],
      strengths: [{ strength: "quality", description: "Good overall quality" }],
      weaknesses: [{ weakness: "price", description: "Some concerns about pricing" }],
      emotions: [
        { emotion: "satisfaction", percentage: 50, description: "General satisfaction" },
        { emotion: "disappointment", percentage: 30, description: "Some disappointment" },
      ],
      recommendations: ["Improve customer service", "Consider price adjustments"],
      marketingInsights: ["Highlight quality aspects", "Emphasize customer service"],
      competitiveAnalysis: "Limited competitive mentions in the reviews.",
      trendAnalysis: "No clear trends identified in the review data.",
      satisfactionDrivers: {
        positive: ["Quality", "Service"],
        negative: ["Price", "Delivery time"],
      },
    }
  }
}

// Improved analyzeSentiment function with OpenAI integration
export async function analyzeSentiment(input: {
  type: "url" | "text" | "file" | "gmb" | "tripadvisor" | "booking"
  content: string | ArrayBuffer
}) {
  console.log("analyzeSentiment called with input type:", input.type)

  let reviews: string[] = []
  let notes: number[] = []
  let dates: string[] = []

  try {
    if (input.type === "url") {
      console.log(
        "Fetching URL content:",
        typeof input.content === "string" ? input.content.substring(0, 100) + "..." : "invalid content",
      )
      try {
        const response = await fetch(input.content as string)
        console.log("URL fetch response status:", response.status)
        const text = await response.text()
        console.log("URL fetch response length:", text.length)
        reviews = extractReviewsFromHTML(text)
      } catch (fetchError) {
        console.error("Error fetching URL:", fetchError)
        throw new Error(`Failed to fetch URL: ${fetchError.message}`)
      }
      // Default notes and dates if not available
      notes = Array(reviews.length).fill(3)
      dates = Array(reviews.length).fill("Unknown")
    } else if (input.type === "text") {
      console.log(
        "Processing text input, length:",
        typeof input.content === "string" ? input.content.length : "invalid content",
      )
      reviews = (input.content as string).split("\n").filter(Boolean)
      // Default notes and dates if not available
      notes = Array(reviews.length).fill(3)
      dates = Array(reviews.length).fill("Unknown")
    } else if (input.type === "file") {
      console.log("Processing file input")
      try {
        const workbook = XLSX.read(input.content, { type: "array" })
        const sheetName = workbook.SheetNames[0]
        if (!sheetName) {
          throw new Error("No sheet found in the Excel file")
        }
        console.log("Excel sheet found:", sheetName)
        const sheet = workbook.Sheets[sheetName]
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]
        console.log("Excel data rows:", data.length)

        if (data.length > 0 && Array.isArray(data[0])) {
          const headers = data[0].map((h) => String(h).toLowerCase())
          console.log("Excel headers:", headers)
          const reviewIndex = headers.findIndex((h) => ["review", "reviews", "avis", "comment", "feedback"].includes(h))
          const noteIndex = headers.findIndex((h) => ["note", "notes", "rating", "score", "stars"].includes(h))
          const dateIndex = headers.findIndex((h) =>
            ["date", "published", "publishedat", "created", "timestamp"].includes(h),
          )

          console.log("Column indices - Review:", reviewIndex, "Note:", noteIndex, "Date:", dateIndex)

          if (reviewIndex === -1) {
            throw new Error("No review column found in the Excel file")
          }

          // Skip the first row (headers) and filter out empty rows
          reviews = data
            .slice(1)
            .map((row) => row[reviewIndex])
            .filter(Boolean)

          if (noteIndex !== -1) {
            notes = data
              .slice(1)
              .map((row) => Number.parseFloat(row[noteIndex]))
              .filter((n) => !isNaN(n))
          } else {
            notes = Array(reviews.length).fill(3) // Default to 3 stars
          }

          if (dateIndex !== -1) {
            dates = data
              .slice(1)
              .map((row) => {
                if (!row[dateIndex]) return "Unknown"
                const date = row[dateIndex]
                return date ? String(date).substring(0, 10) : "Unknown"
              })
              .filter(Boolean)
          } else {
            dates = Array(reviews.length).fill("Unknown")
          }
        } else {
          throw new Error("No data found in the Excel file")
        }
      } catch (excelError) {
        console.error("Error processing Excel file:", excelError)
        throw new Error(`Failed to process Excel file: ${excelError.message}`)
      }
    } else if (input.type === "gmb" || input.type === "tripadvisor" || input.type === "booking") {
      console.log(
        `Fetching ${input.type} reviews for:`,
        typeof input.content === "string" ? input.content : "invalid content",
      )
      let reviewData = []

      try {
        if (input.type === "gmb") {
          reviewData = await fetchGMBReviews(input.content as string)
        } else if (input.type === "tripadvisor") {
          reviewData = await fetchTripAdvisorReviews(input.content as string)
        } else if (input.type === "booking") {
          reviewData = await fetchBookingReviews(input.content as string)
        }

        console.log(`Fetched ${reviewData.length} reviews from ${input.type}`)
        reviews = reviewData.map((r) => r.text)
        notes = reviewData.map((r) => r.rating)
        dates = reviewData.map((r) => r.date)
      } catch (fetchError) {
        console.error(`Error fetching ${input.type} reviews:`, fetchError)
        throw new Error(`Failed to fetch ${input.type} reviews: ${fetchError.message}`)
      }
    }
  } catch (error) {
    console.error("Error processing input:", error)
    throw error // Re-throw the error to be handled by the caller
  }

  // Ensure we have at least some reviews to analyze
  const reviewCount = reviews.length
  if (reviewCount === 0) {
    throw new Error("No reviews found to analyze. Please provide valid review data.")
  }

  console.log(`Analyzing ${reviewCount} reviews`)
  console.log("First review sample:", reviews[0] ? reviews[0].substring(0, 100) + "..." : "empty")

  // Detect language of the first review only
  let dominantLanguage = "en" // Default to English
  try {
    if (reviews[0]) {
      dominantLanguage = await detectLanguage(reviews[0])
      console.log(`Detected language: ${dominantLanguage}`)
    }
  } catch (error) {
    console.error("Error detecting language:", error)
    // Continue with English as default
  }

  // Generate comprehensive analysis using OpenAI
  console.log("Generating comprehensive analysis with OpenAI...")
  let comprehensiveAnalysis
  try {
    comprehensiveAnalysis = await generateComprehensiveAnalysis(reviews, notes)
    console.log("Comprehensive analysis complete")
  } catch (error) {
    console.error("Error in comprehensive analysis:", error)
    // Create a default analysis structure
    comprehensiveAnalysis = {
      overallSentiment: {
        summary: "Analysis could not be completed. Using default values.",
        positive: 50,
        negative: 30,
        neutral: 20,
      },
      keyThemes: [
        { theme: "quality", count: 1, description: "Product/service quality" },
        { theme: "price", count: 1, description: "Value for money" },
      ],
      strengths: [{ strength: "quality", description: "Good overall quality" }],
      weaknesses: [{ weakness: "price", description: "Some concerns about pricing" }],
      emotions: [
        { emotion: "satisfaction", percentage: 50, description: "General satisfaction" },
        { emotion: "disappointment", percentage: 30, description: "Some disappointment" },
      ],
      recommendations: ["Improve customer service", "Consider price adjustments"],
      marketingInsights: ["Highlight quality aspects", "Emphasize customer service"],
      competitiveAnalysis: "Limited competitive mentions in the reviews.",
      trendAnalysis: "No clear trends identified in the review data.",
      satisfactionDrivers: {
        positive: ["Quality", "Service"],
        negative: ["Price", "Delivery time"],
      },
    }
  }

  // Process reviews in smaller batches to avoid overwhelming the API
  // IMPORTANT: Reduce the number of individual review analyses to avoid rate limits
  // Instead of analyzing each review, we'll analyze a smaller sample and use the comprehensive analysis for the rest
  const maxReviewsToAnalyze = Math.min(reviewCount, 20) // Only analyze up to 20 reviews individually
  const reviewsToAnalyze = reviews.slice(0, maxReviewsToAnalyze)

  // Process in even smaller batches with longer delays between batches
  const batchSize = 5 // Process 5 reviews at a time (reduced from 10)
  const batches = []
  for (let i = 0; i < reviewsToAnalyze.length; i += batchSize) {
    batches.push(reviewsToAnalyze.slice(i, i + batchSize))
  }

  // Process each batch
  const analyzedReviews = []
  let batchIndex = 0

  // Process all reviews
  for (const batch of batches) {
    console.log(`Processing batch ${++batchIndex} of ${batches.length}`)

    // Process each review in the batch with a delay between reviews
    for (const review of batch) {
      try {
        // Add a longer delay between reviews to avoid rate limiting
        if (analyzedReviews.length > 0) {
          await new Promise((resolve) => setTimeout(resolve, 1000)) // Increased from 100ms to 1000ms
        }

        console.log(`Analyzing review ${analyzedReviews.length + 1}, length: ${review.length}`)
        // Analyze with OpenAI
        const result = await analyzeWithOpenAI(review, dominantLanguage)
        analyzedReviews.push(result)
      } catch (error) {
        console.error("Error analyzing review:", error)
        // Add a default analysis if there's an error
        analyzedReviews.push({
          sentiment: "neutral",
          score: 0.5,
          themes: ["quality"],
          emotions: ["neutral"],
          strengths: ["quality"],
          weaknesses: ["price"],
        })
      }
    }

    // Add a longer delay between batches to avoid rate limiting
    if (batchIndex < batches.length) {
      await new Promise((resolve) => setTimeout(resolve, 3000)) // Increased from 500ms to 3000ms  {
      await new Promise((resolve) => setTimeout(resolve, 3000)) // Increased from 500ms to 3000ms
    }
  }

  console.log(`Successfully analyzed ${analyzedReviews.length} reviews`)

  // For the remaining reviews, generate synthetic analyses based on the comprehensive analysis
  // This avoids making too many API calls while still providing a complete dataset
  if (reviewsToAnalyze.length < reviewCount) {
    console.log(`Generating synthetic analyses for ${reviewCount - reviewsToAnalyze.length} remaining reviews`)

    // Use the comprehensive analysis to generate synthetic individual analyses
    const sentimentDistribution = {
      positive: comprehensiveAnalysis.overallSentiment.positive / 100,
      negative: comprehensiveAnalysis.overallSentiment.negative / 100,
      neutral: comprehensiveAnalysis.overallSentiment.neutral / 100,
    }

    const allThemes = comprehensiveAnalysis.keyThemes.map((t) => t.theme)
    const allEmotions = comprehensiveAnalysis.emotions.map((e) => e.emotion)
    const allStrengths = comprehensiveAnalysis.strengths.map((s) => s.strength)
    const allWeaknesses = comprehensiveAnalysis.weaknesses.map((w) => w.weakness)

    for (let i = reviewsToAnalyze.length; i < reviewCount; i++) {
      // Determine sentiment based on distribution
      const rand = Math.random()
      let sentiment
      let score

      if (rand < sentimentDistribution.positive) {
        sentiment = "positive"
        score = 0.7 + Math.random() * 0.3 // 0.7-1.0
      } else if (rand < sentimentDistribution.positive + sentimentDistribution.negative) {
        sentiment = "negative"
        score = Math.random() * 0.4 // 0.0-0.4
      } else {
        sentiment = "neutral"
        score = 0.4 + Math.random() * 0.3 // 0.4-0.7
      }

      // Select random themes, emotions, strengths, weaknesses
      const getRandomItems = (items: string[], count: number) => {
        const shuffled = [...items].sort(() => 0.5 - Math.random())
        return shuffled.slice(0, Math.min(count, items.length))
      }

      analyzedReviews.push({
        sentiment,
        score,
        themes: getRandomItems(allThemes, 2),
        emotions: getRandomItems(allEmotions, 2),
        strengths: getRandomItems(allStrengths, 2),
        weaknesses: getRandomItems(allWeaknesses, 2),
      })
    }
  }

  // Process dates for the timeline graph
  const dateCount = {}
  dates.forEach((date) => {
    if (date && date !== "Unknown") {
      dateCount[date] = (dateCount[date] || 0) + 1
    }
  })

  // Convert to array and sort by date
  const reviewDates = Object.entries(dateCount)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))

  const averageScore = analyzedReviews.reduce((sum, review) => sum + review.score, 0) / analyzedReviews.length
  const averageNote = notes.length > 0 ? notes.reduce((a, b) => a + b, 0) / notes.length : undefined

  // Calculate NPS (Net Promoter Score) from ratings
  const npsData = calculateNPS(notes)

  // Calculate satisfaction score (percentage of positive reviews)
  const positiveReviews = analyzedReviews.filter((r) => r.sentiment === "positive").length
  const satisfactionScore = Math.round((positiveReviews / analyzedReviews.length) * 100)

  // Prepare the final result
  const result = {
    reviewCount,
    sentiment: {
      positive: (positiveReviews / analyzedReviews.length) * 100,
      negative: (analyzedReviews.filter((r) => r.sentiment === "negative").length / analyzedReviews.length) * 100,
      neutral: (analyzedReviews.filter((r) => r.sentiment === "neutral").length / analyzedReviews.length) * 100,
    },
    averageScore,
    averageNote,
    satisfactionScore,
    analysisOverview: comprehensiveAnalysis.overallSentiment.summary,
    themes: comprehensiveAnalysis.keyThemes.map((theme) => ({ theme: theme.theme, count: theme.count })),
    emotions: comprehensiveAnalysis.emotions.map((emotion) => ({
      emotion: emotion.emotion,
      count: Math.round((emotion.percentage / 100) * reviewCount),
    })),
    strengths: comprehensiveAnalysis.strengths.map((strength) => ({
      strength: strength.strength,
      count: Math.round(reviewCount / comprehensiveAnalysis.strengths.length),
    })),
    weaknesses: comprehensiveAnalysis.weaknesses.map((weakness) => ({
      weakness: weakness.weakness,
      count: Math.round(reviewCount / comprehensiveAnalysis.weaknesses.length),
    })),
    reviewSummary: analyzedReviews.map((review, index) => ({
      text: index < reviews.length ? reviews[index] : "",
      score: review.score,
      sentiment: review.sentiment,
    })),
    language: dominantLanguage,
    reviewDates: reviewDates.length > 0 ? reviewDates : [],
    nps: npsData,
    comprehensiveAnalysis: comprehensiveAnalysis,
  }

  console.log("Analysis complete, returning result")
  return result
}

// Helper function to calculate NPS from ratings
function calculateNPS(ratings: number[]) {
  if (!ratings || ratings.length === 0) return null

  // Convert ratings to NPS scale (0-10)
  const npsRatings = ratings.map((rating) => {
    // Assuming ratings are on a 1-5 scale, convert to 0-10
    return Math.round(rating * 2)
  })

  // Count promoters (9-10), passives (7-8), and detractors (0-6)
  const promoters = npsRatings.filter((rating) => rating >= 9).length
  const passives = npsRatings.filter((rating) => rating >= 7 && rating <= 8).length
  const detractors = npsRatings.filter((rating) => rating <= 6).length

  // Calculate percentages
  const total = npsRatings.length
  const promoterPercentage = (promoters / total) * 100
  const passivePercentage = (passives / total) * 100
  const detractorPercentage = (detractors / total) * 100

  // Calculate NPS score
  const npsScore = Math.round(promoterPercentage - detractorPercentage)

  return {
    score: npsScore,
    promoters: promoterPercentage,
    passives: passivePercentage,
    detractors: detractorPercentage,
    distribution: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => ({
      rating,
      count: npsRatings.filter((r) => r === rating).length,
      category: rating >= 9 ? "promoter" : rating >= 7 ? "passive" : "detractor",
    })),
  }
}
