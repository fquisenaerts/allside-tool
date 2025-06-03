"use client"
import { useState, useEffect, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, ArrowLeft, AlertCircle, Download } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import { analyzeSentiment } from "../actions"
import { Header } from "../components/Header"
import { generatePDFReport } from "../utils/pdfGenerator"
import { SaveEstablishment } from "../components/SaveEstablishment"
import { SentimentPieChart } from "../components/SentimentPieChart"
import { EmotionsBarChart } from "../components/EmotionsBarChart"
import { KeywordCloud } from "../components/KeywordCloud"
import { StrengthsWeaknessesBarChart } from "../components/StrengthsWeaknessesBarChart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnalysisResultsCard } from "../components/AnalysisResultsCard"
import { AnalysisSummaryCards } from "../components/AnalysisSummaryCards"
import { ToneBarChart } from "../components/ToneBarChart"
import { useTranslation } from "../hooks/useTranslation"
import { ReviewUsageCounter } from "../components/ReviewUsageCounter"
import { ProductPromotionArguments } from "../components/ProductPromotionArguments"
import { InfluentialReviews } from "../components/InfluentialReviews"
import { AnalysisInsightsSummary } from "../components/AnalysisInsightsSummary"
import { NetPromoterScore } from "../components/NetPromoterScore"
import { RatingDistributionChart } from "../components/RatingDistributionChart"
import { ReviewCountGraph } from "../components/ReviewCountGraph"
import { NoticesPerMonthChart } from "../components/NoticesPerMonthChart"
import { TemporalHeatmap } from "../components/TemporalHeatmap"
import { TimeBetweenPurchaseReview } from "../components/TimeBetweenPurchaseReview"
import { OpinionTrendGraph } from "../components/OpinionTrendGraph"
import { SatisfactionFlowChart } from "../components/SatisfactionFlowChart"
import { ReviewSummaryTable } from "../components/ReviewSummaryTable"
import { ReviewClusteringGraph } from "../components/ReviewClusteringGraph"
import { NegativeReviewPrediction } from "../components/NegativeReviewPrediction"
import { RatingBoxPlot } from "../components/RatingBoxPlot"

export default function AnalyzePage() {
  const { t } = useTranslation()
  const [url1, setUrl1] = useState("")
  const [url2, setUrl2] = useState("")
  const [reviews, setReviews] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [gmbUrl, setGmbUrl] = useState("")
  const [tripAdvisorUrl, setTripAdvisorUrl] = useState("")
  const [bookingUrl, setBookingUrl] = useState("")
  const [analysisResults, setAnalysisResults] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [userPlan, setUserPlan] = useState<string>("free_trial")
  const [showInputForm, setShowInputForm] = useState(true)
  const [currentUrl, setCurrentUrl] = useState<string | null>(null)
  const [analysisType, setAnalysisType] = useState<string | null>(null)
  const [isBulkAnalysis, setIsBulkAnalysis] = useState(false)
  const [bulkUrls, setBulkUrls] = useState<string[]>([])
  const [bulkType, setBulkType] = useState<string>("")
  const [reviewLimit, setReviewLimit] = useState<number>(200) // Default for free trial
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [subscription, setSubscription] = useState<any>(null)
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true)
  const [url, setUrl] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [bulkAnalysisResults, setBulkAnalysisResults] = useState<any[] | null>(null)
  const [reviewsAnalyzedThisMonth, setReviewsAnalyzedThisMonth] = useState(0)
  const [isLoadingUsage, setIsLoadingUsage] = useState(true)
  const [refreshUsageCounter, setRefreshUsageCounter] = useState(0)
  const [reviewCount, setReviewCount] = useState<number>(100) // Default to 100 reviews
  // Add new state variables for better progress tracking:
  const [loadingProgress, setLoadingProgress] = useState("")
  const [loadingStep, setLoadingStep] = useState(0)
  const [totalSteps] = useState(4)

  const searchParams = useSearchParams()
  const router = useRouter()

  const hasLoadedUsageRef = useRef(false)

  // Load review usage from database
  const fetchReviewUsage = async (userId: string) => {
    if (!userId) {
      setIsLoadingUsage(false)
      return
    }

    setIsLoadingUsage(true)
    try {
      console.log("Fetching review usage for user:", userId)

      const response = await fetch(`/api/review-usage?userId=${userId}`)

      // Check if the response is OK before trying to parse it as JSON
      if (!response.ok) {
        console.error("Error fetching review usage. Status:", response.status)
        setReviewsAnalyzedThisMonth(0)
        return
      }

      const data = await response.json()

      if (!data.success) {
        console.error("Error fetching review usage:", data.error)
        // Continue execution even if there's an error
        setReviewsAnalyzedThisMonth(0)
      } else {
        console.log("Fetched review usage:", data.reviewsAnalyzed)
        setReviewsAnalyzedThisMonth(data.reviewsAnalyzed || 0)
      }
    } catch (error) {
      console.error("Error in fetchReviewUsage:", error)
      // Set a default value to prevent UI issues
      setReviewsAnalyzedThisMonth(0)
    } finally {
      setIsLoadingUsage(false)
    }
  }

  // Update review usage in database
  const updateReviewUsage = async (userId: string, newReviewCount: number) => {
    if (!userId) return

    try {
      console.log(`Updating review usage for user ${userId} with ${newReviewCount} new reviews`)

      const response = await fetch("/api/review-usage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, reviewCount: newReviewCount }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("Error updating review usage. Status:", response.status, "Response:", data)
        // Don't return early, continue with local update
      }

      if (!data.success) {
        console.error("Error updating review usage:", data.error)
        // Don't return early, continue with local update
      } else {
        console.log("Successfully updated review usage. New total:", data.newTotal)
        // Update the local state with the new total from the server
        setReviewsAnalyzedThisMonth(data.newTotal)
      }

      // Always trigger the refresh counter to update UI
      setTimeout(() => {
        setRefreshUsageCounter((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Error in updateReviewUsage:", error)
      // Still trigger refresh to update UI
      setTimeout(() => {
        setRefreshUsageCounter((prev) => prev + 1)
      }, 1000)
    }
  }

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession()
      if (data?.session?.user) {
        setUser(data.session.user)

        // Fetch review usage from database only once
        if (!hasLoadedUsageRef.current) {
          hasLoadedUsageRef.current = true
          await fetchReviewUsage(data.session.user.id)
        }

        // Get user metadata to determine plan
        const { data: userData } = await supabase.auth.getUser()
        if (userData?.user?.user_metadata?.plan) {
          setUserPlan(userData.user.user_metadata.plan)

          // Set review limit based on plan
          if (userData.user.user_metadata.plan === "standard") {
            setReviewLimit(Number.POSITIVE_INFINITY) // Unlimited reviews
          } else if (userData.user.user_metadata.plan === "custom") {
            setReviewLimit(Number.POSITIVE_INFINITY) // Unlimited reviews
          } else {
            setReviewLimit(200) // Free trial limit
          }
        }
      }
    }

    checkUser()

    // Check for URL in query params
    const urlParam = searchParams.get("url")
    const isBulk = searchParams.get("bulk") === "true"
    const bulkTypeParam = searchParams.get("type")
    const bulkUrlsParam = searchParams.get("urls")

    if (isBulk && bulkTypeParam && bulkUrlsParam) {
      try {
        const urls = JSON.parse(decodeURIComponent(bulkUrlsParam))
        if (Array.isArray(urls) && urls.length > 0) {
          setIsBulkAnalysis(true)
          setBulkUrls(urls)
          setBulkType(decodeURIComponent(bulkTypeParam))
          // Start bulk analysis automatically
          handleBulkAnalyze(urls, decodeURIComponent(bulkTypeParam))
        }
      } catch (e) {
        console.error("Error parsing bulk URLs:", e)
      }
    } else if (urlParam) {
      if (urlParam.includes("google.com/maps")) {
        setGmbUrl(urlParam)
      } else if (urlParam.includes("tripadvisor.com")) {
        setTripAdvisorUrl(urlParam)
      } else if (urlParam.includes("booking.com")) {
        setBookingUrl(urlParam)
      } else {
        setUrl1(urlParam)
      }
    }
  }, [searchParams])

  useEffect(() => {
    fetchSubscription()
  }, [])

  const fetchSubscription = async () => {
    setIsLoadingSubscription(true)
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return
      }

      // Get user's subscription
      const { data: subscriptionData, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (!error && subscriptionData) {
        setSubscription(subscriptionData)
      }
    } catch (error) {
      console.error("Error fetching subscription:", error)
    } finally {
      setIsLoadingSubscription(false)
    }
  }

  // Check if user has access to the feature based on their plan
  const hasAccess = (feature: string): boolean => {
    if (!user) return false // Not logged in

    switch (feature) {
      case "analyze":
        return true // All plans can analyze
      case "unlimited_reviews":
        return userPlan === "standard" || userPlan === "custom"
      case "export":
        return userPlan === "standard" || userPlan === "custom"
      case "bulk_analysis":
        return userPlan === "custom"
      default:
        return false
    }
  }

  const handleBulkAnalyze = async (urls: string[], type: string) => {
    // Check if user has access to bulk analysis
    if (!hasAccess("bulk_analysis")) {
      setError(t("analyze.errors.bulkAnalysisUpgrade"))
      setShowUpgradeModal(true)
      return
    }

    setLoading(true)
    setError(null)
    try {
      // Process each URL and combine results
      const allResults = []
      let combinedResults = null

      for (const url of urls) {
        let input: any = {}
        if (type === "Google My Business") {
          input = { type: "gmb", content: url }
        } else if (type === "TripAdvisor") {
          input = { type: "tripadvisor", content: url }
        } else if (type === "Booking.com") {
          input = { type: "booking", content: url }
        }

        try {
          const result = await analyzeSentiment(input)
          if (result) {
            allResults.push(result)
          }
        } catch (e) {
          console.error(`Error analyzing ${url}:`, e)
          // Continue with other URLs
        }
      }

      if (allResults.length === 0) {
        throw new Error(t("analyze.errors.noResults"))
      }

      // Combine results
      combinedResults = combineAnalysisResults(allResults)

      if (combinedResults) {
        console.log("Combined analysis results:", combinedResults)
        setAnalysisResults(combinedResults)
        setShowInputForm(false)
        setCurrentUrl(null)
        setAnalysisType(`Bulk ${type} Analysis`)
        setBulkAnalysisResults(allResults)

        // Update reviews analyzed count in database
        if (user) {
          await updateReviewUsage(user.id, combinedResults.reviewCount)
        }
      } else {
        throw new Error(t("analyze.errors.combineFailed"))
      }
    } catch (error: any) {
      console.error("Bulk analysis error:", error)
      setAnalysisResults(null)
      setError(error.message || t("analyze.errors.generic"))
    } finally {
      setLoading(false)
    }
  }

  const combineAnalysisResults = (results: any[]) => {
    if (!results || results.length === 0) return null

    // Initialize combined result structure
    const combined = {
      reviewCount: 0,
      sentiment: { positive: 0, negative: 0, neutral: 0 },
      averageScore: 0,
      averageNote: 0,
      satisfactionScore: 0,
      themes: {},
      emotions: {},
      strengths: {},
      weaknesses: {},
      reviewSummary: [],
      language: results[0].language,
      reviewDates: [],
      nps: null,
    }

    let totalScore = 0
    let totalNote = 0
    let noteCount = 0
    let totalSatisfaction = 0

    // Combine data from all results
    results.forEach((result) => {
      // Add review count
      combined.reviewCount += result.reviewCount || 0

      // Weighted sentiment calculation
      const weight = result.reviewCount / combined.reviewCount
      combined.sentiment.positive += (result.sentiment?.positive || 0) * weight
      combined.sentiment.negative += (result.sentiment?.negative || 0) * weight
      combined.sentiment.neutral += (result.sentiment?.neutral || 0) * weight

      // Add to total score
      totalScore += (result.averageScore || 0) * (result.reviewCount || 0)

      // Add to average note calculation
      if (result.averageNote) {
        totalNote += result.averageNote * (result.reviewCount || 0)
        noteCount += result.reviewCount || 0
      }

      // Add to satisfaction score
      if (result.satisfactionScore) {
        totalSatisfaction += result.satisfactionScore * (result.reviewCount || 0)
      }

      // Combine themes
      if (result.themes) {
        result.themes.forEach((theme: any) => {
          if (!combined.themes[theme.theme]) {
            combined.themes[theme.theme] = 0
          }
          combined.themes[theme.theme] += theme.count || 0
        })
      }

      // Combine emotions
      if (result.emotions) {
        result.emotions.forEach((emotion: any) => {
          if (!combined.emotions[emotion.emotion]) {
            combined.emotions[emotion.emotion] = 0
          }
          combined.emotions[emotion.emotion] += emotion.count || 0
        })
      }

      // Combine strengths
      if (result.strengths) {
        result.strengths.forEach((strength: any) => {
          if (!combined.strengths[strength.strength]) {
            combined.strengths[strength.strength] = 0
          }
          combined.strengths[strength.strength] += strength.count || 0
        })
      }

      // Combine weaknesses
      if (result.weaknesses) {
        result.weaknesses.forEach((weakness: any) => {
          if (!combined.weaknesses[weakness.weakness]) {
            combined.weaknesses[weakness.weakness] = 0
          }
          combined.weaknesses[weakness.weakness] += weakness.count || 0
        })
      }

      // Combine review summaries
      if (result.reviewSummary) {
        combined.reviewSummary = [...combined.reviewSummary, ...result.reviewSummary]
      }

      // Combine review dates
      if (result.reviewDates && result.reviewDates.length > 0) {
        result.reviewDates.forEach((dateItem: any) => {
          const existingDate = combined.reviewDates.find((d: any) => d.date === dateItem.date)
          if (existingDate) {
            existingDate.count += dateItem.count
          } else {
            combined.reviewDates.push({ ...dateItem })
          }
        })
      }

      // Combine NPS data if available
      if (result.nps && !combined.nps) {
        combined.nps = result.nps
      }
    })

    // Calculate final averages
    combined.averageScore = totalScore / combined.reviewCount
    combined.averageNote = noteCount > 0 ? totalNote / noteCount : 0
    combined.satisfactionScore = combined.reviewCount > 0 ? totalSatisfaction / combined.reviewCount : 0

    // Convert objects to arrays
    combined.themes = Object.entries(combined.themes)
      .map(([theme, count]) => ({ theme, count }))
      .sort((a: any, b: any) => b.count - a.count)

    combined.emotions = Object.entries(combined.emotions)
      .map(([emotion, count]) => ({ emotion, count }))
      .sort((a: any, b: any) => b.count - a.count)

    combined.strengths = Object.entries(combined.strengths)
      .map(([strength, count]) => ({ strength, count }))
      .sort((a: any, b: any) => b.count - a.count)

    combined.weaknesses = Object.entries(combined.weaknesses)
      .map(([weakness, count]) => ({ weakness, count }))
      .sort((a: any, b: any) => b.count - a.count)

    // Sort review dates
    combined.reviewDates.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return combined
  }

  // Update the handleAnalyze function to show progress:
  const handleAnalyze = async () => {
    // Check if user is logged in
    if (!user) {
      router.push("/login")
      return
    }

    setLoading(true)
    setError(null)
    setLoadingProgress("Initializing analysis...")
    setLoadingStep(1)

    try {
      let input: any = {}
      let analyzedUrl = null
      let type = null

      if (url1) {
        input = { type: "url", content: url1, reviewCount: reviewCount }
        analyzedUrl = url1
        type = "URL"
      } else if (gmbUrl) {
        input = { type: "gmb", content: gmbUrl, reviewCount: reviewCount }
        analyzedUrl = gmbUrl
        type = "Google My Business"
        setLoadingProgress(`Fetching ${reviewCount} reviews from Google My Business...`)
      } else if (tripAdvisorUrl) {
        input = { type: "tripadvisor", content: tripAdvisorUrl, reviewCount: reviewCount }
        analyzedUrl = tripAdvisorUrl
        type = "TripAdvisor"
        setLoadingProgress(`Fetching ${reviewCount} reviews from TripAdvisor...`)
      } else if (bookingUrl) {
        input = { type: "booking", content: bookingUrl, reviewCount: reviewCount }
        analyzedUrl = bookingUrl
        type = "Booking.com"
        setLoadingProgress(`Fetching ${reviewCount} reviews from Booking.com...`)
      } else if (file) {
        const arrayBuffer = await file.arrayBuffer()
        input = { type: "file", content: arrayBuffer }
        analyzedUrl = file.name
        type = "File"
        setLoadingProgress("Processing Excel file...")
      } else if (reviews) {
        input = { type: "text", content: reviews }
        analyzedUrl = "Text Input"
        type = "Text"
        setLoadingProgress("Processing text input...")
      } else {
        setError(t("analyze.errors.noInput"))
        setLoading(false)
        return
      }

      setLoadingStep(2)
      console.log("Starting analysis with input type:", input.type)

      try {
        // Add a timeout for the entire analysis
        const analysisPromise = analyzeSentiment(input)

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(
            () => {
              reject(
                new Error(
                  "Analysis timed out after 10 minutes. Please try again with a different URL or fewer reviews.",
                ),
              )
            },
            10 * 60 * 1000,
          ) // 10 minutes total timeout
        })

        setLoadingProgress("Analyzing reviews with AI...")
        setLoadingStep(3)

        const results = await Promise.race([analysisPromise, timeoutPromise])

        if (results) {
          setLoadingProgress("Finalizing results...")
          setLoadingStep(4)

          console.log("Analysis results:", results)

          // Check if review count exceeds the limit for the user's plan
          if (results.reviewCount > reviewLimit && !hasAccess("unlimited_reviews")) {
            setError(t("analyze.errors.reviewLimit", { limit: reviewLimit, count: results.reviewCount }))
            setShowUpgradeModal(true)
            // Still show results but with a warning
          }

          setAnalysisResults(results)
          setShowInputForm(false)
          setCurrentUrl(analyzedUrl)
          setAnalysisType(type)

          // Update reviews analyzed count in database - ENSURE THIS HAPPENS
          if (user && results.reviewCount > 0) {
            console.log("Calling updateReviewUsage with:", user.id, results.reviewCount)
            await updateReviewUsage(user.id, results.reviewCount)
          }
        } else {
          throw new Error(t("analyze.errors.noResults"))
        }
      } catch (error: any) {
        console.error("Analysis error:", error)
        setError(error.message || t("analyze.errors.generic"))
      }
    } catch (error: any) {
      console.error("Analysis error:", error)
      setAnalysisResults(null)
      setError(error.message || t("analyze.errors.generic"))
    } finally {
      setLoading(false)
      setLoadingProgress("")
      setLoadingStep(0)
    }
  }

  const handleDownloadPDF = () => {
    // Check if user has export access
    if (!hasAccess("export")) {
      setError(t("analyze.errors.exportUpgrade"))
      setShowUpgradeModal(true)
      return
    }

    if (!analysisResults) return
    generatePDFReport(analysisResults)
  }

  const resetAnalysis = () => {
    setAnalysisResults(null)
    setShowInputForm(true)
    setCurrentUrl(null)
    setAnalysisType(null)
    setIsBulkAnalysis(false)
    setBulkUrls([])
    setBulkType("")
  }

  // Helper function to determine sentiment label
  const getSentimentLabel = (positive: number) => {
    if (positive >= 70) return "positive"
    if (positive >= 40) return "neutral"
    return "negative"
  }

  // Calculate average rating from review data
  const calculateAverageRating = () => {
    if (!analysisResults || !analysisResults.reviewSummary || analysisResults.reviewSummary.length === 0) {
      return { avgRating: 0, avgLength: 0 }
    }

    const ratings = analysisResults.reviewSummary.map((r: any) => r.score * 5)
    const lengths = analysisResults.reviewSummary.map((r: any) => r.text?.length || 0)

    const sumRatings = ratings.reduce((total: number, rating: number) => total + rating, 0)
    const sumLengths = lengths.reduce((total: number, length: number) => total + length, 0)

    return {
      avgRating: sumRatings / ratings.length,
      avgLength: sumLengths / lengths.length,
    }
  }

  // Helper function to check if review dates data is available
  const hasReviewDatesData = () => {
    return (
      analysisResults &&
      analysisResults.reviewDates &&
      Array.isArray(analysisResults.reviewDates) &&
      analysisResults.reviewDates.length > 0
    )
  }

  // Generate personalized commentary for sentiment distribution
  const generateSentimentCommentary = () => {
    if (!analysisResults) return ""

    const { sentiment, reviewCount } = analysisResults
    const positivePercentage = Math.round(sentiment.positive)
    const negativePercentage = Math.round(sentiment.negative)
    const neutralPercentage = Math.round(sentiment.neutral)

    let commentary = t("analyze.commentaries.sentiment.intro", { reviewCount })

    if (positivePercentage >= 70) {
      commentary += t("analyze.commentaries.sentiment.veryPositive", { positivePercentage })
    } else if (positivePercentage >= 50) {
      commentary += t("analyze.commentaries.sentiment.positive", {
        positivePercentage,
        neutralPercentage,
        negativePercentage,
      })
    } else if (positivePercentage >= 30) {
      commentary += t("analyze.commentaries.sentiment.mixed", {
        positivePercentage,
        neutralPercentage,
        negativePercentage,
      })
    } else {
      commentary += t("analyze.commentaries.sentiment.negative", {
        positivePercentage,
        negativePercentage,
      })
    }

    // Add specific advice based on sentiment distribution
    if (positivePercentage >= 70) {
      commentary += t("analyze.commentaries.sentiment.advicePositive")
    } else if (negativePercentage > 30) {
      commentary += t("analyze.commentaries.sentiment.adviceNegative")
    }

    return commentary
  }

  // Generate personalized commentary for emotions
  const generateEmotionsCommentary = () => {
    if (!analysisResults || !analysisResults.emotions || analysisResults.emotions.length === 0) return ""

    const emotions = analysisResults.emotions
    const topEmotions = emotions.slice(0, 3)
    const primaryEmotion = topEmotions[0]

    let commentary = t("analyze.commentaries.emotions.intro", {
      primaryEmotion: primaryEmotion.emotion,
    })

    if (topEmotions.length > 1) {
      commentary += t("analyze.commentaries.emotions.secondEmotion", {
        secondEmotion: topEmotions[1].emotion,
      })
      if (topEmotions.length > 2) {
        commentary += t("analyze.commentaries.emotions.thirdEmotion", {
          thirdEmotion: topEmotions[2].emotion,
        })
      }
    }
    commentary += `. `

    // Add emotion-specific insights - use a safer approach to check for translation keys
    const emotionKey = primaryEmotion.emotion.toLowerCase()
    const specificKey = `analyze.commentaries.emotions.specific.${emotionKey}`

    // Check if the translation exists without triggering a warning
    let specificTranslation = ""
    try {
      specificTranslation = t(specificKey)
      // If the translation key returns the key itself, it means it doesn't exist
      if (specificTranslation === specificKey) {
        specificTranslation = t("analyze.commentaries.emotions.specific.default")
      }
    } catch (e) {
      specificTranslation = t("analyze.commentaries.emotions.specific.default")
    }

    commentary += specificTranslation

    return commentary
  }

  // Generate personalized commentary for themes
  const generateThemesCommentary = () => {
    if (!analysisResults || !analysisResults.themes || analysisResults.themes.length === 0) return ""

    const themes = analysisResults.themes
    const topThemes = themes.slice(0, 5)

    let commentary = t("analyze.commentaries.themes.intro", { themeCount: themes.length })

    if (topThemes.length > 0) {
      commentary += t("analyze.commentaries.themes.firstTheme", {
        theme: topThemes[0].theme,
        count: topThemes[0].count,
      })
      if (topThemes.length > 1) {
        commentary += t("analyze.commentaries.themes.secondTheme", {
          theme: topThemes[1].theme,
          count: topThemes[1].count,
        })
        if (topThemes.length > 2) {
          commentary += t("analyze.commentaries.themes.thirdTheme", {
            theme: topThemes[2].theme,
            count: topThemes[2].count,
          })
        }
      }
    }
    commentary += `. `

    commentary += t("analyze.commentaries.themes.general")

    // Add specific advice based on top themes
    if (topThemes.length > 0) {
      const topTheme = topThemes[0].theme.toLowerCase()
      if (topTheme.includes("quality") || topTheme.includes("performance")) {
        commentary += t("analyze.commentaries.themes.specific.quality", { theme: topTheme })
      } else if (topTheme.includes("price") || topTheme.includes("cost") || topTheme.includes("value")) {
        commentary += t("analyze.commentaries.themes.specific.price", { theme: topTheme })
      } else if (topTheme.includes("service") || topTheme.includes("support") || topTheme.includes("staff")) {
        commentary += t("analyze.commentaries.themes.specific.service", { theme: topTheme })
      }
    }

    return commentary
  }

  // Generate personalized commentary for strengths
  const generateStrengthsCommentary = () => {
    if (!analysisResults || !analysisResults.strengths || analysisResults.strengths.length === 0) return ""

    const strengths = analysisResults.strengths
    const topStrengths = strengths.slice(0, 3)

    let commentary = t("analyze.commentaries.strengths.intro", { strengthCount: strengths.length })

    if (topStrengths.length > 0) {
      commentary += t("analyze.commentaries.strengths.firstStrength", {
        strength: topStrengths[0].strength,
        count: topStrengths[0].count,
      })
      if (topStrengths.length > 1) {
        commentary += t("analyze.commentaries.strengths.secondStrength", {
          strength: topStrengths[1].strength,
          count: topStrengths[1].count,
        })
        if (topStrengths.length > 2) {
          commentary += t("analyze.commentaries.strengths.thirdStrength", {
            strength: topStrengths[2].strength,
            count: topStrengths[2].count,
          })
        }
      }
    }
    commentary += `. `

    commentary += t("analyze.commentaries.strengths.general")

    // Add specific marketing advice based on top strengths
    if (topStrengths.length > 0) {
      commentary += t("analyze.commentaries.strengths.marketing", {
        strength: topStrengths[0].strength,
      })
    }

    return commentary
  }

  // Generate personalized commentary for weaknesses
  const generateWeaknessesCommentary = () => {
    if (!analysisResults || !analysisResults.weaknesses || analysisResults.weaknesses.length === 0) return ""

    const weaknesses = analysisResults.weaknesses
    const topWeaknesses = weaknesses.slice(0, 3)

    let commentary = t("analyze.commentaries.weaknesses.intro", { weaknessCount: weaknesses.length })

    if (topWeaknesses.length > 0) {
      commentary += t("analyze.commentaries.weaknesses.firstWeakness", {
        weakness: topWeaknesses[0].weakness,
        count: topWeaknesses[0].count,
      })
      if (topWeaknesses.length > 1) {
        commentary += t("analyze.commentaries.weaknesses.secondWeakness", {
          weakness: topWeaknesses[1].weakness,
          count: topWeaknesses[1].count,
        })
        if (topWeaknesses.length > 2) {
          commentary += t("analyze.commentaries.weaknesses.thirdWeakness", {
            weakness: topWeaknesses[2].weakness,
            count: topWeaknesses[2].count,
          })
        }
      }
    }
    commentary += `. `

    commentary += t("analyze.commentaries.weaknesses.general")

    // Add specific improvement advice based on top weakness
    if (topWeaknesses.length > 0) {
      const topWeakness = topWeaknesses[0].weakness.toLowerCase()
      if (topWeakness.includes("price") || topWeakness.includes("expensive")) {
        commentary += t("analyze.commentaries.weaknesses.specific.price", {
          weakness: topWeaknesses[0].weakness,
        })
      } else if (topWeakness.includes("service") || topWeakness.includes("support")) {
        commentary += t("analyze.commentaries.weaknesses.specific.service", {
          weakness: topWeaknesses[0].weakness,
        })
      } else if (topWeakness.includes("quality") || topWeakness.includes("defect")) {
        commentary += t("analyze.commentaries.weaknesses.specific.quality", {
          weakness: topWeaknesses[0].weakness,
        })
      } else {
        commentary += t("analyze.commentaries.weaknesses.specific.default", {
          weakness: topWeaknesses[0].weakness,
        })
      }
    }

    return commentary
  }

  // Generate personalized commentary for NPS
  const generateNPSCommentary = () => {
    if (!analysisResults || !analysisResults.reviewSummary) return ""

    const ratings = analysisResults.reviewSummary.map((r: any) => Math.round(r.score * 5))

    // Calculate eNPS based on 5-star rating system
    const totalRatings = ratings.length
    const promoterCount = ratings.filter((r: number) => r === 5).length
    const passiveCount = ratings.filter((r: number) => r === 4).length
    const detractorCount = ratings.filter((r: number) => r <= 3 && r >= 1).length

    const promoterPercentage = (promoterCount / totalRatings) * 100
    const detractorPercentage = (detractorCount / totalRatings) * 100
    const score = Math.round(promoterPercentage - detractorPercentage)

    let commentary = t("analyze.commentaries.nps.intro", { score })

    if (score >= 70) {
      commentary += t("analyze.commentaries.nps.excellent")
    } else if (score >= 50) {
      commentary += t("analyze.commentaries.nps.good")
    } else if (score >= 30) {
      commentary += t("analyze.commentaries.nps.moderate")
    } else if (score >= 0) {
      commentary += t("analyze.commentaries.nps.concerning")
    } else {
      commentary += t("analyze.commentaries.nps.negative")
    }

    commentary += t("analyze.commentaries.nps.explanation")

    return commentary
  }

  // Generate personalized commentary for review timeline
  const generateTimelineCommentary = () => {
    if (!analysisResults || !analysisResults.reviewDates || analysisResults.reviewDates.length === 0) return ""

    const reviewDates = analysisResults.reviewDates

    // Sort dates chronologically
    const sortedDates = [...reviewDates].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Calculate total reviews
    const totalReviews = sortedDates.reduce((sum, item) => sum + item.count, 0)

    // Find date range
    const startDate = new Date(sortedDates[0].date)
    const endDate = new Date(sortedDates[sortedDates.length - 1].date)
    const dateRange = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    // Find peak date
    const peakData = [...sortedDates].sort((a, b) => b.count - a.count)[0]
    const peakDate = new Date(peakData.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })

    // Calculate trend
    let trend = "stable"
    if (sortedDates.length >= 6) {
      const firstThird = sortedDates.slice(0, Math.floor(sortedDates.length / 3))
      const lastThird = sortedDates.slice(Math.floor((2 * sortedDates.length) / 3))

      const firstAvg = firstThird.reduce((sum, item) => sum + item.count, 0) / firstThird.length
      const lastAvg = lastThird.reduce((sum, item) => sum + item.count, 0) / lastThird.length

      if (lastAvg > firstAvg * 1.2) {
        trend = "increasing"
      } else if (lastAvg < firstAvg * 0.8) {
        trend = "decreasing"
      }
    }

    let commentary = t("analyze.commentaries.timeline.intro", { totalReviews, dateRange })

    if (trend === "increasing") {
      commentary += t("analyze.commentaries.timeline.increasing")
    } else if (trend === "decreasing") {
      commentary += t("analyze.commentaries.timeline.decreasing")
    } else {
      commentary += t("analyze.commentaries.timeline.stable")
    }

    commentary += t("analyze.commentaries.timeline.peak", { count: peakData.count, date: peakDate })

    if (peakData.count > 3 * (totalReviews / reviewDates.length)) {
      commentary += t("analyze.commentaries.timeline.spike")
    }

    return commentary
  }

  // Generate personalized commentary for temporal heatmap
  const generateHeatmapCommentary = () => {
    return t("analyze.commentaries.heatmap")
  }

  // Generate personalized commentary for purchase-review time
  const generatePurchaseReviewCommentary = () => {
    return t("analyze.commentaries.purchaseReview")
  }

  // Generate personalized commentary for rating distribution
  const generateRatingCommentary = () => {
    if (!analysisResults || !analysisResults.reviewSummary) return ""

    const ratings = analysisResults.reviewSummary.map((r: any) => r.score * 5)

    // Count occurrences of each rating
    const ratingCounts = ratings.reduce((acc: any, rating: number) => {
      const roundedRating = Math.round(rating)
      acc[roundedRating] = (acc[roundedRating] || 0) + 1
      return acc
    }, {})

    // Calculate percentages
    const total = ratings.length
    const percentages: any = {}
    for (let i = 1; i <= 5; i++) {
      percentages[i] = Math.round(((ratingCounts[i] || 0) / total) * 100)
    }

    // Calculate average rating
    const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / total
    const roundedAverage = Math.round(averageRating * 100) / 100

    let commentary = t("analyze.commentaries.rating.intro", {
      total,
      average: roundedAverage.toFixed(2),
    })

    if (percentages[5] + percentages[4] > 80) {
      commentary += t("analyze.commentaries.rating.excellent", {
        percentage: percentages[5] + percentages[4],
      })
    } else if (percentages[5] + percentages[4] > 60) {
      commentary += t("analyze.commentaries.rating.good", {
        percentage: percentages[5] + percentages[4],
      })
    } else if (percentages[1] + percentages[2] > 40) {
      commentary += t("analyze.commentaries.rating.poor", {
        percentage: percentages[1] + percentages[2],
      })
    } else {
      commentary += t("analyze.commentaries.rating.mixed")
    }

    commentary += t("analyze.commentaries.rating.conclusion")

    return commentary
  }

  // Generate personalized commentary for marketing insights
  const generateMarketingCommentary = () => {
    if (!analysisResults) return ""

    const { strengths, weaknesses, themes } = analysisResults

    let commentary = t("analyze.commentaries.marketing.intro")

    if (strengths && strengths.length > 0) {
      commentary += t("analyze.commentaries.marketing.strengths", {
        strength: strengths[0].strength,
      })
    }

    if (weaknesses && weaknesses.length > 0) {
      commentary += t("analyze.commentaries.marketing.weaknesses", {
        weakness: weaknesses[0].weakness,
      })
    }

    commentary += t("analyze.commentaries.marketing.conclusion")

    return commentary
  }

  // Generate personalized commentary for notices per month
  const generateNoticesPerMonthCommentary = () => {
    if (!hasReviewDatesData()) return ""

    const reviewDates = analysisResults.reviewDates

    // Group by month
    const monthlyData = {}
    reviewDates.forEach((item: any) => {
      const date = new Date(item.date)
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          count: 0,
          month: date.toLocaleString("default", { month: "short" }) + " " + date.getFullYear(),
        }
      }

      monthlyData[monthYear].count += item.count
    })

    // Convert to array and sort
    const monthlyArray = Object.values(monthlyData)

    // Find peak month
    const peakMonth = [...monthlyArray].sort((a: any, b: any) => b.count - a.count)[0]

    let commentary = t("analyze.commentaries.monthly.intro")

    if (monthlyArray.length > 1) {
      commentary += t("analyze.commentaries.monthly.peak", {
        month: peakMonth.month,
        count: peakMonth.count,
      })

      // Identify any seasonal patterns
      if (monthlyArray.length >= 12) {
        commentary += t("analyze.commentaries.monthly.seasonal")
      }

      commentary += t("analyze.commentaries.monthly.conclusion")
    } else {
      commentary += t("analyze.commentaries.monthly.singleMonth", {
        month: peakMonth.month,
      })
    }

    return commentary
  }

  const getSubscriptionBadge = () => {
    if (isLoadingSubscription) return null

    if (!subscription) {
      return (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("analyze.subscription.none.title")}</AlertTitle>
          <AlertDescription>{t("analyze.subscription.none.description")}</AlertDescription>
          <div className="mt-2">
            <Button size="sm" onClick={() => (window.location.href = "https://buy.stripe.com/8wM5kpgmA7na9eU4gg")}>
              {t("analyze.subscription.upgradeButton")}
            </Button>
          </div>
        </Alert>
      )
    }

    if (subscription.status === "trialing") {
      const trialEnd = new Date(subscription.trial_end)
      const daysLeft = Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

      return (
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle>{t("analyze.subscription.trial.title")}</AlertTitle>
          <AlertDescription>
            {t("analyze.subscription.trial.description", {
              days: daysLeft > 0 ? daysLeft : 0,
            })}
          </AlertDescription>
          <div className="mt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => (window.location.href = "https://buy.stripe.com/8wM5kpgmA7na9eU4gg")}
            >
              {t("analyze.subscription.standardButton")}
            </Button>
          </div>
        </Alert>
      )
    }

    if (subscription.status === "active") {
      return (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <Info className="h-4 w-4 text-green-600" />
          <AlertTitle>{t("analyze.subscription.active.title")}</AlertTitle>
          <AlertDescription>
            {t("analyze.subscription.active.description", {
              plan: subscription.plan_id,
              date: new Date(subscription.current_period_end).toLocaleDateString(),
            })}
          </AlertDescription>
        </Alert>
      )
    }

    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#050314]">
      <Header />

      <main className="flex-grow">
        <div className="w-full mx-auto px-4 py-12">
          {" "}
          {/* Removed max-width constraint */}
          <h1 className="text-4xl font-bold mb-4 text-center text-white">{t("analyze.title")}</h1>
          <p className="text-xl text-gray-400 mb-8 text-center">
            Analyze and understand customer reviews with AI-powered precision
          </p>
          {getSubscriptionBadge()}
          <ReviewUsageCounter
            user={user}
            userPlan={userPlan}
            subscription={subscription}
            refreshTrigger={refreshUsageCounter}
          />
          {showInputForm ? (
            <div className="max-w-6xl mx-auto">
              {" "}
              {/* Keep form centered */}
              <Tabs defaultValue="gmb" className="space-y-8">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="url">{t("analyze.tabs.url")}</TabsTrigger>
                  <TabsTrigger value="text">{t("analyze.tabs.text")}</TabsTrigger>
                  <TabsTrigger value="file">{t("analyze.tabs.file")}</TabsTrigger>
                  <TabsTrigger value="gmb">{t("analyze.tabs.gmb")}</TabsTrigger>
                  <TabsTrigger value="tripadvisor">{t("analyze.tabs.tripadvisor")}</TabsTrigger>
                  <TabsTrigger value="booking">{t("analyze.tabs.booking")}</TabsTrigger>
                </TabsList>

                <TabsContent value="url">
                  <div className="space-y-4">
                    <Input
                      type="url"
                      placeholder={t("analyze.placeholders.url1")}
                      value={url1}
                      onChange={(e) => setUrl1(e.target.value)}
                      className="h-12 text-lg"
                    />
                    {/* Add this new input field */}
                    <div className="space-y-2">
                      <label htmlFor="reviewCount" className="text-white text-sm font-medium">
                        Number of reviews to analyze (max 1000)
                      </label>
                      <Input
                        id="reviewCount"
                        type="number"
                        min="1"
                        max="1000"
                        placeholder="Enter number of reviews (default: 100)"
                        value={reviewCount}
                        onChange={(e) =>
                          setReviewCount(Math.min(1000, Math.max(1, Number.parseInt(e.target.value) || 100)))
                        }
                        className="h-12 text-lg"
                      />
                    </div>
                    <Input
                      type="url"
                      placeholder={t("analyze.placeholders.url2")}
                      value={url2}
                      onChange={(e) => setUrl2(e.target.value)}
                      className="h-12 text-lg"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="text">
                  <Textarea
                    placeholder={t("analyze.placeholders.text")}
                    value={reviews}
                    onChange={(e) => setReviews(e.target.value)}
                    className="min-h-[200px] text-lg"
                  />
                </TabsContent>

                <TabsContent value="file">
                  <div className="flex items-center justify-center h-[200px] border-2 border-dashed rounded-lg">
                    <Input
                      type="file"
                      accept=".xls,.xlsx"
                      onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                      className="max-w-sm"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="gmb">
                  <div className="space-y-4">
                    <div className="text-white mb-2 font-medium">{t("analyze.help.gmb.title")}</div>

                    <Input
                      type="url"
                      placeholder="Enter Google My Business URL"
                      value={gmbUrl}
                      onChange={(e) => setGmbUrl(e.target.value)}
                      className="h-12 text-lg mb-4"
                    />

                    {/* Add this new input field */}
                    <div className="space-y-2">
                      <label htmlFor="reviewCount" className="text-white text-sm font-medium">
                        Number of reviews to analyze (max 1000)
                      </label>
                      <Input
                        id="reviewCount"
                        type="number"
                        min="1"
                        max="1000"
                        placeholder="Enter number of reviews (default: 100)"
                        value={reviewCount}
                        onChange={(e) =>
                          setReviewCount(Math.min(1000, Math.max(1, Number.parseInt(e.target.value) || 100)))
                        }
                        className="h-12 text-lg"
                      />
                    </div>

                    <ol className="list-decimal pl-5 mt-1 space-y-1 text-sm text-gray-300">
                      <li>{t("analyze.help.gmb.step1")}</li>
                      <li>{t("analyze.help.gmb.step2")}</li>
                      <li>{t("analyze.help.gmb.step3")}</li>
                    </ol>

                    <div className="text-sm text-gray-400 mt-1">
                      <strong>{t("analyze.help.example")}:</strong>{" "}
                      https://www.google.com/maps/place/Starbucks/@37.7749,-122.4194,15z/
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="tripadvisor">
                  <div className="space-y-4">
                    <div className="text-white mb-2 font-medium">{t("analyze.help.tripadvisor.title")}</div>

                    <Input
                      type="url"
                      placeholder="Enter TripAdvisor URL"
                      value={tripAdvisorUrl}
                      onChange={(e) => setTripAdvisorUrl(e.target.value)}
                      className="h-12 text-lg mb-4"
                    />

                    {/* Add this new input field */}
                    <div className="space-y-2">
                      <label htmlFor="reviewCount" className="text-white text-sm font-medium">
                        Number of reviews to analyze (max 1000)
                      </label>
                      <Input
                        id="reviewCount"
                        type="number"
                        min="1"
                        max="1000"
                        placeholder="Enter number of reviews (default: 100)"
                        value={reviewCount}
                        onChange={(e) =>
                          setReviewCount(Math.min(1000, Math.max(1, Number.parseInt(e.target.value) || 100)))
                        }
                        className="h-12 text-lg"
                      />
                    </div>

                    <ol className="list-decimal pl-5 mt-1 space-y-1 text-sm text-gray-300">
                      <li>{t("analyze.help.tripadvisor.step1")}</li>
                      <li>{t("analyze.help.tripadvisor.step2")}</li>
                      <li>{t("analyze.help.tripadvisor.step3")}</li>
                      <li>{t("analyze.help.tripadvisor.step4")}</li>
                    </ol>

                    <div className="text-sm text-gray-400 mt-1">
                      <strong>{t("analyze.help.example")}:</strong>{" "}
                      https://www.tripadvisor.com/Hotel_Review-g60763-d208453-Reviews-Hilton_New_York_Times_Square-New_York_City_New_York.html
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="booking">
                  <div className="space-y-4">
                    <div className="text-white mb-2 font-medium">{t("analyze.help.booking.title")}</div>

                    <Input
                      type="url"
                      placeholder="Enter Booking.com URL"
                      value={bookingUrl}
                      onChange={(e) => setBookingUrl(e.target.value)}
                      className="h-12 text-lg mb-4"
                    />

                    {/* Add this new input field */}
                    <div className="space-y-2">
                      <label htmlFor="reviewCount" className="text-white text-sm font-medium">
                        Number of reviews to analyze (max 1000)
                      </label>
                      <Input
                        id="reviewCount"
                        type="number"
                        min="1"
                        max="1000"
                        placeholder="Enter number of reviews (default: 100)"
                        value={reviewCount}
                        onChange={(e) =>
                          setReviewCount(Math.min(1000, Math.max(1, Number.parseInt(e.target.value) || 100)))
                        }
                        className="h-12 text-lg"
                      />
                    </div>

                    <ol className="list-decimal pl-5 mt-1 space-y-1 text-sm text-gray-300">
                      <li>{t("analyze.help.booking.step1")}</li>
                      <li>{t("analyze.help.booking.step2")}</li>
                      <li>{t("analyze.help.booking.step3")}</li>
                      <li>{t("analyze.help.booking.step4")}</li>
                    </ol>

                    <div className="text-sm text-gray-400 mt-1">
                      <strong>{t("analyze.help.example")}:</strong> https://www.booking.com/hotel/us/bellagio.html
                    </div>
                  </div>
                </TabsContent>

                <div className="flex justify-center">
                  {/* Update the loading button to show progress: */}
                  <Button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="bg-white text-black hover:bg-white/90 h-12 px-8 text-lg"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-black"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <div className="flex flex-col items-start">
                          <span>{loadingProgress || t("analyze.buttons.analyzing")}</span>
                          {loadingStep > 0 && (
                            <span className="text-xs opacity-75">
                              Step {loadingStep} of {totalSteps}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      t("analyze.buttons.analyze")
                    )}
                  </Button>
                </div>
              </Tabs>
            </div>
          ) : (
            <div className="w-full mx-auto mb-8 flex items-center justify-between">
              <Button variant="outline" onClick={resetAnalysis} className="gap-2 text-white">
                <ArrowLeft className="h-4 w-4" />
                {t("analyze.buttons.newAnalysis")}
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleDownloadPDF} className="gap-2 text-white">
                  <Download className="h-4 w-4" />
                  {t("analyze.buttons.downloadPDF")}
                </Button>
                {currentUrl && user && !isBulkAnalysis && (
                  <SaveEstablishment
                    url={currentUrl}
                    userId={user.id}
                    analysisType={analysisType}
                    analysisResults={analysisResults}
                  />
                )}
              </div>
            </div>
          )}
          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded max-w-6xl mx-auto">
              <p className="font-semibold">{t("analyze.errors.title")}:</p>
              <p>{error}</p>
              {error.includes("Invalid Google Maps URL") && (
                <div className="mt-2 text-sm">
                  <p className="font-semibold">{t("analyze.errors.gmbHelp.title")}:</p>
                  <ul className="list-disc pl-5 mt-1">
                    <li>{t("analyze.errors.gmbHelp.tip1")}</li>
                    <li>{t("analyze.errors.gmbHelp.tip2")}</li>
                    <li>{t("analyze.errors.gmbHelp.tip3")}</li>
                  </ul>
                </div>
              )}
            </div>
          )}
          {analysisResults && (
            <div className="mt-8 bg-white p-6 rounded-lg w-full">
              <h2 className="text-2xl font-bold mb-4">{t("analyze.results.title")}</h2>

              {/* Analysis Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
                <TabsList className="grid grid-cols-5 mb-6">
                  <TabsTrigger value="overview">{t("analyze.results.tabs.overview")}</TabsTrigger>
                  <TabsTrigger value="sentiment">{t("analyze.results.tabs.sentiment")}</TabsTrigger>
                  <TabsTrigger value="themes">{t("analyze.results.tabs.themes")}</TabsTrigger>
                  <TabsTrigger value="customer">{t("analyze.results.tabs.customer")}</TabsTrigger>
                  <TabsTrigger value="marketing">{t("analyze.results.tabs.marketing")}</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview">
                  {analysisResults && (
                    <div className="space-y-6">
                      {/* Calculate average rating from review data */}
                      {(() => {
                        const { avgRating, avgLength } = calculateAverageRating()
                        const sentimentScore = analysisResults.sentiment.positive
                        return (
                          <>
                            <AnalysisSummaryCards
                              totalReviews={analysisResults.reviewCount}
                              averageRating={avgRating}
                              sentimentScore={sentimentScore}
                              averageReviewLength={avgLength}
                            />

                            <AnalysisInsightsSummary analysisResults={analysisResults} />
                          </>
                        )
                      })()}

                      <AnalysisResultsCard results={analysisResults} index={0} />

                      {/* Sentiment Pie Chart */}
                      <Card>
                        <CardHeader>
                          <CardTitle>{t("analyze.results.cards.sentiment.title")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <SentimentPieChart
                            data={[
                              {
                                name: t("analyze.results.sentiment.positive"),
                                value: analysisResults.sentiment.positive,
                              },
                              {
                                name: t("analyze.results.sentiment.negative"),
                                value: analysisResults.sentiment.negative,
                              },
                              {
                                name: t("analyze.results.sentiment.neutral"),
                                value: analysisResults.sentiment.neutral,
                              },
                            ]}
                            reviewCount={analysisResults.reviewCount}
                            topStrengths={analysisResults.strengths}
                            topWeaknesses={analysisResults.weaknesses}
                          />
                          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <h3 className="text-lg font-semibold mb-2">{t("analyze.results.cards.insights")}</h3>
                            <p className="text-gray-700 leading-relaxed">{generateSentimentCommentary()}</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Tone Breakdown */}
                      <Card>
                        <CardHeader>
                          <CardTitle>{t("analyze.results.cards.tone.title")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ToneBarChart
                            data={[
                              {
                                name: t("analyze.results.sentiment.positive"),
                                value: analysisResults.sentiment.positive,
                              },
                              {
                                name: t("analyze.results.sentiment.neutral"),
                                value: analysisResults.sentiment.neutral,
                              },
                              {
                                name: t("analyze.results.sentiment.negative"),
                                value: analysisResults.sentiment.negative,
                              },
                            ]}
                            topStrengths={analysisResults.strengths}
                            topWeaknesses={analysisResults.weaknesses}
                          />
                        </CardContent>
                      </Card>

                      {/* Emotions Bar Chart */}
                      <Card>
                        <CardHeader>
                          <CardTitle>{t("analyze.results.cards.emotions.title")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <EmotionsBarChart data={analysisResults.emotions} reviewCount={analysisResults.reviewCount} />
                          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <h3 className="text-lg font-semibold mb-2">
                              {t("analyze.results.cards.emotions.insights")}
                            </h3>
                            <p className="text-gray-700 leading-relaxed">{generateEmotionsCommentary()}</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Keyword Cloud */}
                      <Card>
                        <CardHeader>
                          <CardTitle>{t("analyze.results.cards.themes.title")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <KeywordCloud
                            keywords={analysisResults.themes.map((theme: any) => ({
                              text: theme.theme,
                              value: theme.count,
                            }))}
                          />
                          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <h3 className="text-lg font-semibold mb-2">{t("analyze.results.cards.themes.insights")}</h3>
                            <p className="text-gray-700 leading-relaxed">{generateThemesCommentary()}</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Strengths and Weaknesses */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Strengths */}
                        <Card>
                          <CardHeader>
                            <CardTitle>{t("analyze.results.cards.strengths.title")}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <StrengthsWeaknessesBarChart
                              strengths={analysisResults.strengths.map((s: any) => ({
                                name: s.strength,
                                value: s.count,
                              }))}
                            />
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                              <h3 className="text-lg font-semibold mb-2">
                                {t("analyze.results.cards.strengths.analysis")}
                              </h3>
                              <p className="text-gray-700 leading-relaxed">{generateStrengthsCommentary()}</p>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Weaknesses */}
                        <Card>
                          <CardHeader>
                            <CardTitle>{t("analyze.results.cards.weaknesses.title")}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <StrengthsWeaknessesBarChart
                              weaknesses={analysisResults.weaknesses.map((w: any) => ({
                                name: w.weakness,
                                value: w.count,
                              }))}
                            />
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                              <h3 className="text-lg font-semibold mb-2">
                                {t("analyze.results.cards.weaknesses.insights")}
                              </h3>
                              <p className="text-gray-700 leading-relaxed">{generateWeaknessesCommentary()}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Net Promoter Score */}
                      {analysisResults.reviewSummary && analysisResults.reviewSummary.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Net Promoter Score (eNPS)</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <NetPromoterScore
                              ratings={analysisResults.reviewSummary.map((r: any) => Math.round(r.score * 5))}
                            />
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                              <h3 className="text-lg font-semibold mb-2">NPS Analysis</h3>
                              <p className="text-gray-700 leading-relaxed">{generateNPSCommentary()}</p>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Rating Distribution Chart */}
                      {analysisResults.reviewSummary && analysisResults.reviewSummary.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Rating Distribution</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <RatingDistributionChart
                              ratings={analysisResults.reviewSummary.map((r: any) => Math.round(r.score * 5))}
                            />
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                              <h3 className="text-lg font-semibold mb-2">Rating Analysis</h3>
                              <p className="text-gray-700 leading-relaxed">{generateRatingCommentary()}</p>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Rating Box Plot Analysis */}
                      {analysisResults.reviewSummary && analysisResults.reviewSummary.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Rating Distribution Box Plot</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <RatingBoxPlot
                              ratings={analysisResults.reviewSummary.map((r: any) => Math.round(r.score * 5))}
                            />
                          </CardContent>
                        </Card>
                      )}

                      {/* Review Timeline */}
                      {hasReviewDatesData() && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Review Timeline</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ReviewCountGraph data={analysisResults.reviewDates} />
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                              <h3 className="text-lg font-semibold mb-2">Timeline Insights</h3>
                              <p className="text-gray-700 leading-relaxed">{generateTimelineCommentary()}</p>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Notices Per Month Chart */}
                      {hasReviewDatesData() && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Reviews Per Month</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <NoticesPerMonthChart data={analysisResults.reviewDates} />
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                              <h3 className="text-lg font-semibold mb-2">Monthly Trends</h3>
                              <p className="text-gray-700 leading-relaxed">{generateNoticesPerMonthCommentary()}</p>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Temporal Heatmap */}
                      {hasReviewDatesData() && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Review Activity Heatmap</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <TemporalHeatmap data={analysisResults.reviewDates} />
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                              <h3 className="text-lg font-semibold mb-2">Activity Patterns</h3>
                              <p className="text-gray-700 leading-relaxed">{generateHeatmapCommentary()}</p>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Time Between Purchase and Review */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Time Between Purchase and Review</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <TimeBetweenPurchaseReview />
                          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <h3 className="text-lg font-semibold mb-2">Purchase-Review Timing</h3>
                            <p className="text-gray-700 leading-relaxed">{generatePurchaseReviewCommentary()}</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Opinion Trend Graph */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Opinion Trend</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <OpinionTrendGraph data={analysisResults.comprehensiveAnalysis?.trend || "stable"} />
                        </CardContent>
                      </Card>

                      {/* Satisfaction Flow Chart */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Customer Satisfaction Flow</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <SatisfactionFlowChart
                            data={{
                              nodes: [
                                { name: "Unhappy Customer" },
                                { name: "Neutral Experience" },
                                { name: "Positive Experience" },
                                { name: "Negative Review" },
                                { name: "Moderate Review" },
                                { name: "Positive Review" },
                                { name: "Lost Customer" },
                                { name: "Repeat Customer" },
                                { name: "Brand Advocate" },
                              ],
                              links: [
                                {
                                  source: 0,
                                  target: 3,
                                  value: Math.round((analysisResults.sentiment?.negative || 0) * 0.3),
                                },
                                {
                                  source: 0,
                                  target: 4,
                                  value: Math.round((analysisResults.sentiment?.negative || 0) * 0.1),
                                },
                                {
                                  source: 1,
                                  target: 3,
                                  value: Math.round((analysisResults.sentiment?.neutral || 0) * 0.1),
                                },
                                {
                                  source: 1,
                                  target: 4,
                                  value: Math.round((analysisResults.sentiment?.neutral || 0) * 0.6),
                                },
                                {
                                  source: 1,
                                  target: 5,
                                  value: Math.round((analysisResults.sentiment?.neutral || 0) * 0.3),
                                },
                                {
                                  source: 2,
                                  target: 4,
                                  value: Math.round((analysisResults.sentiment?.positive || 0) * 0.1),
                                },
                                {
                                  source: 2,
                                  target: 5,
                                  value: Math.round((analysisResults.sentiment?.positive || 0) * 0.8),
                                },
                                {
                                  source: 3,
                                  target: 6,
                                  value: Math.round((analysisResults.sentiment?.negative || 0) * 0.35),
                                },
                                {
                                  source: 3,
                                  target: 7,
                                  value: Math.round((analysisResults.sentiment?.negative || 0) * 0.05),
                                },
                                {
                                  source: 4,
                                  target: 6,
                                  value: Math.round((analysisResults.sentiment?.neutral || 0) * 0.2),
                                },
                                {
                                  source: 4,
                                  target: 7,
                                  value: Math.round((analysisResults.sentiment?.neutral || 0) * 0.6),
                                },
                                {
                                  source: 4,
                                  target: 8,
                                  value: Math.round((analysisResults.sentiment?.neutral || 0) * 0.1),
                                },
                                {
                                  source: 5,
                                  target: 7,
                                  value: Math.round((analysisResults.sentiment?.positive || 0) * 0.3),
                                },
                                {
                                  source: 5,
                                  target: 8,
                                  value: Math.round((analysisResults.sentiment?.positive || 0) * 0.6),
                                },
                              ],
                            }}
                          />
                        </CardContent>
                      </Card>

                      {/* Review Summary Table */}
                      {analysisResults.reviewSummary && analysisResults.reviewSummary.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Review Summary</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ReviewSummaryTable reviews={analysisResults.reviewSummary} pageSize={10} />
                          </CardContent>
                        </Card>
                      )}

                      {/* Influential Reviews Analysis */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Most Influential Reviews</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <InfluentialReviews reviewData={analysisResults.reviewSummary || []} />
                        </CardContent>
                      </Card>

                      {/* Negative Review Prediction */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Negative Review Prediction Model</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <NegativeReviewPrediction reviewData={analysisResults.reviewSummary || []} />
                        </CardContent>
                      </Card>

                      {/* K-means Review Clustering */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Review Clustering Analysis (K-means)</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ReviewClusteringGraph
                            reviewData={analysisResults.reviewSummary || []}
                            clusters={[
                              { id: 0, x: 0.8, y: 0.3, z: 0.7, name: "Quality Positive" },
                              { id: 1, x: 0.2, y: 0.7, z: 0.3, name: "Quality Negative" },
                              { id: 2, x: 0.7, y: 0.3, z: 0.6, name: "Price Positive" },
                              { id: 3, x: 0.3, y: 0.6, z: 0.4, name: "Price Negative" },
                              { id: 4, x: 0.8, y: 0.4, z: 0.8, name: "Experience Positive" },
                              { id: 5, x: 0.3, y: 0.6, z: 0.2, name: "Experience Negative" },
                            ]}
                          />
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </TabsContent>

                {/* Sentiment Tab */}
                <TabsContent value="sentiment">
                  <div className="space-y-8">
                    {/* Sentiment Pie Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle>{t("analyze.results.cards.sentiment.title")}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <SentimentPieChart
                          data={[
                            {
                              name: t("analyze.results.sentiment.positive"),
                              value: analysisResults.sentiment.positive,
                            },
                            {
                              name: t("analyze.results.sentiment.negative"),
                              value: analysisResults.sentiment.negative,
                            },
                            {
                              name: t("analyze.results.sentiment.neutral"),
                              value: analysisResults.sentiment.neutral,
                            },
                          ]}
                          reviewCount={analysisResults.reviewCount}
                          topStrengths={analysisResults.strengths}
                          topWeaknesses={analysisResults.weaknesses}
                        />
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                          <h3 className="text-lg font-semibold mb-2">{t("analyze.results.cards.insights")}</h3>
                          <p className="text-gray-700 leading-relaxed">{generateSentimentCommentary()}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Net Promoter Score */}
                    {analysisResults.reviewSummary && analysisResults.reviewSummary.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Net Promoter Score (eNPS)</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <NetPromoterScore
                            ratings={analysisResults.reviewSummary.map((r: any) => Math.round(r.score * 5))}
                          />
                        </CardContent>
                      </Card>
                    )}

                    {/* Rating Distribution Chart */}
                    {analysisResults.reviewSummary && analysisResults.reviewSummary.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Rating Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <RatingDistributionChart
                            ratings={analysisResults.reviewSummary.map((r: any) => Math.round(r.score * 5))}
                          />
                        </CardContent>
                      </Card>
                    )}

                    {/* Rating Box Plot in Sentiment tab */}
                    {analysisResults.reviewSummary && analysisResults.reviewSummary.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Rating Statistical Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <RatingBoxPlot
                            ratings={analysisResults.reviewSummary.map((r: any) => Math.round(r.score * 5))}
                          />
                        </CardContent>
                      </Card>
                    )}

                    {/* Tone Breakdown */}
                    <Card>
                      <CardHeader>
                        <CardTitle>{t("analyze.results.cards.tone.title")}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ToneBarChart
                          data={[
                            {
                              name: t("analyze.results.sentiment.positive"),
                              value: analysisResults.sentiment.positive,
                            },
                            {
                              name: t("analyze.results.sentiment.neutral"),
                              value: analysisResults.sentiment.neutral,
                            },
                            {
                              name: t("analyze.results.sentiment.negative"),
                              value: analysisResults.sentiment.negative,
                            },
                          ]}
                          topStrengths={analysisResults.strengths}
                          topWeaknesses={analysisResults.weaknesses}
                        />
                      </CardContent>
                    </Card>

                    {/* Influential Reviews */}
                    <Card>
                      <CardHeader>
                        <CardTitle>{t("analyze.results.cards.influential.title")}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <InfluentialReviews reviews={analysisResults.reviewSummary || []} />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Themes Tab */}
                <TabsContent value="themes">
                  <div className="space-y-8">
                    {/* Keyword Cloud */}
                    {analysisResults.themes && analysisResults.themes.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>{t("analyze.results.cards.themes.title")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <KeywordCloud
                            keywords={analysisResults.themes.map((theme: any) => ({
                              text: theme.theme,
                              value: theme.count,
                            }))}
                          />
                          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <h3 className="text-lg font-semibold mb-2">{t("analyze.results.cards.themes.insights")}</h3>
                            <p className="text-gray-700 leading-relaxed">{generateThemesCommentary()}</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Emotions Bar Chart */}
                    {analysisResults.emotions && analysisResults.emotions.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>{t("analyze.results.cards.emotions.title")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <EmotionsBarChart
                            data={analysisResults.emotions || []}
                            reviewCount={analysisResults.reviewCount}
                          />
                          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <h3 className="text-lg font-semibold mb-2">
                              {t("analyze.results.cards.emotions.insights")}
                            </h3>
                            <p className="text-gray-700 leading-relaxed">{generateEmotionsCommentary()}</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Strengths and Weaknesses */}
                    {((analysisResults.strengths && analysisResults.strengths.length > 0) ||
                      (analysisResults.weaknesses && analysisResults.weaknesses.length > 0)) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Strengths */}
                        {analysisResults.strengths && analysisResults.strengths.length > 0 && (
                          <Card>
                            <CardHeader>
                              <CardTitle>{t("analyze.results.cards.strengths.title")}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <StrengthsWeaknessesBarChart
                                strengths={analysisResults.strengths.map((s: any) => ({
                                  name: s.strength,
                                  value: s.count,
                                }))}
                              />
                              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <h3 className="text-lg font-semibold mb-2">
                                  {t("analyze.results.cards.strengths.analysis")}
                                </h3>
                                <p className="text-gray-700 leading-relaxed">{generateStrengthsCommentary()}</p>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Weaknesses */}
                        {analysisResults.weaknesses && analysisResults.weaknesses.length > 0 && (
                          <Card>
                            <CardHeader>
                              <CardTitle>{t("analyze.results.cards.weaknesses.title")}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <StrengthsWeaknessesBarChart
                                weaknesses={analysisResults.weaknesses.map((w: any) => ({
                                  name: w.weakness,
                                  value: w.count,
                                }))}
                              />
                              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <h3 className="text-lg font-semibold mb-2">
                                  {t("analyze.results.cards.weaknesses.insights")}
                                </h3>
                                <p className="text-gray-700 leading-relaxed">{generateWeaknessesCommentary()}</p>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}

                    {/* Review Timeline */}
                    {hasReviewDatesData() && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Review Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ReviewCountGraph data={analysisResults.reviewDates} />
                        </CardContent>
                      </Card>
                    )}

                    {/* K-means Review Clustering in Themes tab */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Review Clustering by Themes (K-means)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ReviewClusteringGraph
                          reviewData={analysisResults.reviewSummary || []}
                          clusters={[
                            { id: 0, x: 0.8, y: 0.3, z: 0.7, name: "Quality Positive" },
                            { id: 1, x: 0.2, y: 0.7, z: 0.3, name: "Quality Negative" },
                            { id: 2, x: 0.7, y: 0.3, z: 0.6, name: "Price Positive" },
                            { id: 3, x: 0.3, y: 0.6, z: 0.4, name: "Price Negative" },
                            { id: 4, x: 0.8, y: 0.4, z: 0.8, name: "Experience Positive" },
                            { id: 5, x: 0.3, y: 0.6, z: 0.2, name: "Experience Negative" },
                          ]}
                        />
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                          <h3 className="text-lg font-semibold mb-2">Clustering Insights</h3>
                          <p className="text-gray-700 leading-relaxed">
                            This K-means clustering analysis groups reviews based on their content similarity, focusing
                            on key themes like quality, price, and in-store experience. Each cluster represents reviews
                            with similar characteristics, helping identify patterns in customer feedback.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Marketing Tab */}
                <TabsContent value="marketing">
                  <div className="space-y-8">
                    {/* Product Promotion Arguments */}
                    <Card>
                      <CardHeader>
                        <CardTitle>{t("analyze.results.cards.marketing.title")}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ProductPromotionArguments
                          strengths={analysisResults.strengths}
                          weaknesses={analysisResults.weaknesses}
                          keywords={analysisResults.themes.map((theme: any) => ({
                            text: theme.theme,
                            value: theme.count,
                          }))}
                        />
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                          <h3 className="text-lg font-semibold mb-2">
                            {t("analyze.results.cards.marketing.insights")}
                          </h3>
                          <p className="text-gray-700 leading-relaxed">{generateMarketingCommentary()}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Customer Tab */}
                <TabsContent value="customer">
                  <div className="space-y-8">
                    {/* Customer Satisfaction Flow */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Customer Satisfaction Flow</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <SatisfactionFlowChart
                          data={{
                            nodes: [
                              { name: "Unhappy Customer" },
                              { name: "Neutral Experience" },
                              { name: "Positive Experience" },
                              { name: "Negative Review" },
                              { name: "Moderate Review" },
                              { name: "Positive Review" },
                              { name: "Lost Customer" },
                              { name: "Repeat Customer" },
                              { name: "Brand Advocate" },
                            ],
                            links: [
                              {
                                source: 0,
                                target: 3,
                                value: Math.round((analysisResults.sentiment?.negative || 0) * 0.3),
                              },
                              {
                                source: 0,
                                target: 4,
                                value: Math.round((analysisResults.sentiment?.negative || 0) * 0.1),
                              },
                              {
                                source: 1,
                                target: 3,
                                value: Math.round((analysisResults.sentiment?.neutral || 0) * 0.1),
                              },
                              {
                                source: 1,
                                target: 4,
                                value: Math.round((analysisResults.sentiment?.neutral || 0) * 0.6),
                              },
                              {
                                source: 1,
                                target: 5,
                                value: Math.round((analysisResults.sentiment?.neutral || 0) * 0.3),
                              },
                              {
                                source: 2,
                                target: 4,
                                value: Math.round((analysisResults.sentiment?.positive || 0) * 0.1),
                              },
                              {
                                source: 2,
                                target: 5,
                                value: Math.round((analysisResults.sentiment?.positive || 0) * 0.8),
                              },
                              {
                                source: 3,
                                target: 6,
                                value: Math.round((analysisResults.sentiment?.negative || 0) * 0.35),
                              },
                              {
                                source: 3,
                                target: 7,
                                value: Math.round((analysisResults.sentiment?.negative || 0) * 0.05),
                              },
                              {
                                source: 4,
                                target: 6,
                                value: Math.round((analysisResults.sentiment?.neutral || 0) * 0.2),
                              },
                              {
                                source: 4,
                                target: 7,
                                value: Math.round((analysisResults.sentiment?.neutral || 0) * 0.6),
                              },
                              {
                                source: 4,
                                target: 8,
                                value: Math.round((analysisResults.sentiment?.neutral || 0) * 0.1),
                              },
                              {
                                source: 5,
                                target: 7,
                                value: Math.round((analysisResults.sentiment?.positive || 0) * 0.3),
                              },
                              {
                                source: 5,
                                target: 8,
                                value: Math.round((analysisResults.sentiment?.positive || 0) * 0.6),
                              },
                            ],
                          }}
                        />
                      </CardContent>
                    </Card>

                    {/* Time Between Purchase and Review */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Time Between Purchase and Review</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <TimeBetweenPurchaseReview />
                      </CardContent>
                    </Card>

                    {/* Temporal Heatmap */}
                    {hasReviewDatesData() && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Review Activity Heatmap</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <TemporalHeatmap data={analysisResults.reviewDates} />
                        </CardContent>
                      </Card>
                    )}

                    {/* Review Summary Table */}
                    {analysisResults.reviewSummary && analysisResults.reviewSummary.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Review Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ReviewSummaryTable reviews={analysisResults.reviewSummary} pageSize={10} />
                        </CardContent>
                      </Card>
                    )}

                    {/* Opinion Trend Graph */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Opinion Trend</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <OpinionTrendGraph data={analysisResults.comprehensiveAnalysis?.trend || "stable"} />
                      </CardContent>
                    </Card>

                    {/* Negative Review Prediction in Customer tab */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Customer Churn Risk Prediction</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <NegativeReviewPrediction reviewData={analysisResults.reviewSummary || []} />
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                          <h3 className="text-lg font-semibold mb-2">Churn Risk Analysis</h3>
                          <p className="text-gray-700 leading-relaxed">
                            This predictive model analyzes the probability of customers leaving negative reviews based
                            on various factors including review patterns, sentiment trends, and customer behavior
                            indicators. Use these insights to proactively address potential issues.
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Influential Reviews in Customer tab */}
                    <Card>
                      <CardHeader>
                        <CardTitle>High-Impact Customer Reviews</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <InfluentialReviews reviewData={analysisResults.reviewSummary || []} />
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                          <h3 className="text-lg font-semibold mb-2">Review Impact Analysis</h3>
                          <p className="text-gray-700 leading-relaxed">
                            These influential reviews have the highest potential impact on other customers' purchasing
                            decisions. Monitor these closely and consider reaching out to these customers for further
                            engagement or issue resolution.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
