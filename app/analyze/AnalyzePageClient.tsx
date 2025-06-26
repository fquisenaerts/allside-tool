"use client"

import { useState, useEffect, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, ArrowLeft, AlertCircle, Download, RotateCcw } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import { analyzeSentiment } from "../actions"
import { AnalyzePageMenu } from "../components/AnalyzePageMenu" // Import new sidebar component
import { generatePDFReport } from "../utils/pdfGenerator"
import { SaveEstablishment } from "../components/SaveEstablishment"
import { useTranslation } from "../hooks/useTranslation"
import { ComprehensiveAnalysisDisplay } from "../components/ComprehensiveAnalysisDisplay"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox" // Import Checkbox

export default function AnalyzePageClient() {
  const { t } = useTranslation()
  const [url1, setUrl1] = useState("")
  const [url2, setUrl2] = useState("")
  const [reviews, setReviews] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [gmbUrl, setGmbUrl] = useState("")
  const [tripAdvisorUrl, setTripAdvisorUrl] = useState("")
  const [bookingUrl, setBookingUrl] = useState("")
  const [trustpilotCompanyDomain, setTrustpilotCompanyDomain] = useState("")
  const [airbnbUrl, setAirbnbUrl] = useState("")
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
  const [reviewsAnalyzedThisMonth, setReviewsAnalyzedThisMonth] = useState(0)
  const [isLoadingUsage, setIsLoadingUsage] = useState(true)
  const [refreshUsageCounter, setRefreshUsageCounter] = useState(0)
  const [reviewCount, setReviewCount] = useState<number>(100) // Default to 100 reviews
  // Add new state variables for better progress tracking:
  const [loadingProgress, setLoadingProgress] = useState("")
  const [loadingStep, setLoadingStep] = useState(0)
  const [totalSteps] = useState(4)
  const [activeInputTab, setActiveInputTab] = useState("gmb") // Renamed to avoid conflict
  const [activeAnalysisTab, setActiveAnalysisTab] = useState("overview") // New state for analysis tabs
  const [isResetting, setIsResetting] = useState(false)
  const [isUnlimited, setIsUnlimited] = useState(false)
  const [monthlyLimit, setMonthlyLimit] = useState(200)
  const [isAnalyzeAllReviews, setIsAnalyzeAllReviews] = useState(false) // New state for "Analyze all reviews" checkbox

  const searchParams = useSearchParams()
  const router = useRouter()

  const hasLoadedUsageRef = useRef(false)
  const [isClient, setIsClient] = useState(false) // New state for client-side rendering

  useEffect(() => {
    setIsClient(true) // Set to true once component mounts on client
  }, [])

  // Load review usage from database
  const fetchReviewUsage = async (userId: string) => {
    if (!userId) {
      setIsLoadingUsage(false)
      return
    }

    setIsLoadingUsage(true)
    try {
      console.log("📊 Main Page: Fetching review usage for user:", userId)

      const response = await fetch(`/api/review-usage?userId=${userId}&_t=${Date.now()}`, {
        cache: "no-store",
      })

      // Check if the response is OK before trying to parse it as JSON
      if (!response.ok) {
        const errorText = await response.text() // Read response as text for debugging
        console.error("❌ Main Page: Error fetching review usage. Status:", response.status, "Response:", errorText)
        setReviewsAnalyzedThisMonth(0)
        return
      }

      let data
      try {
        data = await response.json()
      } catch (jsonError: any) {
        const errorText = await response.text() // Read response again if json() failed
        console.error(
          "❌ Main Page: JSON parsing error for review usage. Raw response:",
          errorText,
          "Error:",
          jsonError,
        )
        setError("Failed to parse review usage data. Please try again.")
        setReviewsAnalyzedThisMonth(0)
        return
      }

      if (!data.success) {
        console.error("❌ Main Page: Error fetching review usage:", data.error)
        // Continue execution even if there's an error
        setReviewsAnalyzedThisMonth(0)
      } else {
        console.log("✅ Main Page: Fetched review usage:", data.reviewsAnalyzed)
        setReviewsAnalyzedThisMonth(data.reviewsAnalyzed || 0)
      }
    } catch (error) {
      console.error("💥 Main Page: Error in fetchReviewUsage:", error)
      // Set a default value to prevent UI issues
      setReviewsAnalyzedThisMonth(0)
    } finally {
      setIsLoadingUsage(false)
    }
  }

  // Update review usage in database
  const updateReviewUsage = async (userId: string, newReviewCount: number) => {
    if (!userId || !newReviewCount || newReviewCount <= 0) {
      console.log("❌ Invalid parameters for updateReviewUsage:", { userId, newReviewCount })
      return
    }

    try {
      console.log(`📊 Main Page: Adding ${newReviewCount} reviews to existing usage for user ${userId}`)

      const response = await fetch("/api/update-review-usage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, reviewCount: newReviewCount }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Main Page: Error response:", errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log("📊 Main Page: Response data:", data)

      if (!data.success) {
        console.error("❌ Main Page: API returned error:", data.error)
        throw new Error(data.error)
      }

      console.log("✅ Main Page: Successfully added review usage. New total:", data.newTotal)

      // Update the local state with the new total from the server
      setReviewsAnalyzedThisMonth(data.newTotal)

      // Trigger refresh of the counter component
      setRefreshUsageCounter((prev) => prev + 1)

      // Also refresh the usage data
      await fetchReviewUsage(userId)
    } catch (error) {
      console.error("💥 Main Page: Error in updateReviewUsage:", error)
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
            setIsUnlimited(true)
          } else if (userData.user.user_metadata.plan === "custom") {
            setReviewLimit(Number.POSITIVE_INFINITY) // Unlimited reviews
            setIsUnlimited(true)
          } else {
            setReviewLimit(200) // Free trial limit
            setIsUnlimited(false)
          }
        }
      } else {
        // If no user, redirect to login
        router.push("/login")
        return
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
      } else if (urlParam.includes("trustpilot.com")) {
        const domainMatch = urlParam.match(/trustpilot\.com\/review\/([^/]+)/)
        if (domainMatch && domainMatch[1]) {
          setTrustpilotCompanyDomain(domainMatch[1])
        } else {
          // Fallback if the URL format is unexpected, or prompt user to enter domain
          console.warn("Could not extract company domain from Trustpilot URL:", urlParam)
        }
      } else if (urlParam.includes("airbnb.com")) {
        setAirbnbUrl(urlParam)
      } else {
        setUrl1(urlParam)
      }
    }
  }, [searchParams, router])

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
        const reviewsToFetch = isAnalyzeAllReviews && hasAccess("unlimited_reviews") ? 10000 : reviewCount // Use a very high number for "all" if unlimited access, otherwise use reviewCount
        if (type === "Google My Business") {
          input = { type: "gmb", content: url, reviewCount: reviewsToFetch }
        } else if (type === "TripAdvisor") {
          input = { type: "tripadvisor", content: url, reviewCount: reviewsToFetch }
        } else if (type === "Booking.com") {
          input = { type: "booking", content: url, reviewCount: reviewsToFetch }
        } else if (type === "Trustpilot") {
          input = { type: "trustpilot", companyDomain: url, count: reviewsToFetch }
        } else if (type === "Airbnb") {
          input = { type: "airbnb", content: url, reviewCount: reviewsToFetch }
        } else if (type === "URL Comparison") {
          input = { type: "url", content: url, reviewCount: reviewsToFetch }
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

        // Update reviews analyzed count in database
        if (user && combinedResults.reviewCount > 0) {
          console.log("🔄 Calling updateReviewUsage for bulk analysis with:", user.id, combinedResults.reviewCount)
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
      comprehensiveAnalysis: {}, // Initialize comprehensiveAnalysis
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

      // Combine comprehensive analysis (simple merge for now, can be more complex if needed)
      if (result.comprehensiveAnalysis) {
        Object.assign(combined.comprehensiveAnalysis, result.comprehensiveAnalysis)
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

      // Determine the actual review count to use
      const reviewsToFetch = isAnalyzeAllReviews && hasAccess("unlimited_reviews") ? 10000 : reviewCount // Use a very high number for "all" if unlimited access, otherwise use reviewCount

      if (url1 && url2) {
        // Handle comparison of two URLs
        setIsBulkAnalysis(true)
        setBulkUrls([url1, url2])
        setBulkType("URL Comparison")
        await handleBulkAnalyze([url1, url2], "URL Comparison")
        return // Exit after handling bulk analysis
      } else if (url1) {
        input = { type: "url", content: url1, reviewCount: reviewsToFetch }
        analyzedUrl = url1
        type = "URL"
      } else if (gmbUrl) {
        input = { type: "gmb", content: gmbUrl, reviewCount: reviewsToFetch }
        analyzedUrl = gmbUrl
        type = "Google My Business"
        setLoadingProgress(`Fetching ${reviewsToFetch} reviews from Google My Business...`)
      } else if (tripAdvisorUrl) {
        input = {
          type: "tripadvisor",
          content: tripAdvisorUrl,
          reviewCount: reviewsToFetch,
        }
        analyzedUrl = tripAdvisorUrl
        type = "TripAdvisor"
        setLoadingProgress(`Fetching ${reviewsToFetch} reviews from TripAdvisor...`)
      } else if (bookingUrl) {
        input = {
          type: "booking",
          content: bookingUrl,
          reviewCount: reviewsToFetch,
        }
        analyzedUrl = bookingUrl
        type = "Booking.com"
        setLoadingProgress(`Fetching ${reviewsToFetch} reviews from Booking.com...`)
      } else if (trustpilotCompanyDomain) {
        input = {
          type: "trustpilot",
          companyDomain: trustpilotCompanyDomain,
          count: reviewsToFetch,
        }
        analyzedUrl = trustpilotCompanyDomain
        type = "Trustpilot"
        setLoadingProgress(`Fetching ${reviewsToFetch} reviews from Trustpilot...`)
      } else if (airbnbUrl) {
        input = { type: "airbnb", content: airbnbUrl, reviewCount: reviewsToFetch }
        analyzedUrl = airbnbUrl
        type = "Airbnb"
        setLoadingProgress(`Fetching ${reviewsToFetch} reviews from Airbnb...`)
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
            console.log("🔄 Calling updateReviewUsage with:", user.id, results.reviewCount)
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
    setActiveAnalysisTab("overview") // Reset to overview when starting new analysis
    setIsAnalyzeAllReviews(false) // Reset checkbox state
    setReviewCount(100) // Reset review count to default
  }

  const getSubscriptionBadge = () => {
    if (isLoadingSubscription) return null

    if (!subscription) {
      return (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Free Trial</AlertTitle>
          <AlertDescription>You're using the free trial with limited features.</AlertDescription>
          <div className="mt-2">
            <Button size="sm" onClick={() => (window.location.href = "https://buy.stripe.com/8wM5kpgmA7na9eU4gg")}>
              Upgrade to Standard
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
          <AlertTitle>Free Trial Active</AlertTitle>
          <AlertDescription>Your trial expires in {daysLeft > 0 ? daysLeft : 0} days.</AlertDescription>
          <div className="mt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => (window.location.href = "https://buy.stripe.com/8wM5kpgmA7na9eU4gg")}
            >
              Upgrade to Standard
            </Button>
          </div>
        </Alert>
      )
    }

    if (subscription.status === "active") {
      return (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <Info className="h-4 w-4 text-green-600" />
          <AlertTitle>Standard Plan Active</AlertTitle>
          <AlertDescription>
            Your {subscription.plan_id} plan is active until{" "}
            {new Date(subscription.current_period_end).toLocaleDateString()}.
          </AlertDescription>
        </Alert>
      )
    }

    return null
  }

  const progressPercentage = monthlyLimit === 0 ? 0 : Math.min(100, (reviewsAnalyzedThisMonth / monthlyLimit) * 100)

  const resetUsageCounter = async () => {
    setIsResetting(true)
    try {
      if (!user?.id) {
        console.error("User ID is missing, cannot reset usage counter.")
        return
      }

      const response = await fetch("/api/reset-review-usage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Failed to reset usage counter:", errorData.error || "Unknown error")
        return
      }

      // Optimistically update the state
      setReviewsAnalyzedThisMonth(0)
      setRefreshUsageCounter((prev) => prev + 1)

      // Re-fetch the usage to ensure the state is correct
      await fetchReviewUsage(user.id)

      console.log("Usage counter reset successfully.")
    } catch (error) {
      console.error("Error resetting usage counter:", error)
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-row bg-white text-black">
      {/* Vertical Sidebar for Analyze Page */}
      <AnalyzePageMenu />

      {/* Main Content Area */}
      <main className="flex-grow p-8">
        <div className="w-full mx-auto">
          <h1 className="text-4xl font-bold mb-4 text-center text-black">Review Analysis</h1>
          <p className="text-xl text-gray-600 mb-8 text-center">
            Analyze and understand customer reviews with AI-powered precision
          </p>
          {getSubscriptionBadge()}
          <Card className="mb-6 bg-white border-gray-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-black text-lg flex items-center justify-between">
                Monthly Review Usage
                {user && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetUsageCounter}
                    disabled={isResetting}
                    className="text-black border-gray-300 hover:bg-gray-100"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    {isResetting ? "Resetting..." : "Reset Usage"}
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingUsage ? (
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>
                      {reviewsAnalyzedThisMonth} {isUnlimited ? "reviews analyzed" : `of ${monthlyLimit} reviews`}
                    </span>
                    {!isUnlimited && <span>{Math.max(0, monthlyLimit - reviewsAnalyzedThisMonth)} remaining</span>}
                  </div>
                  {!isUnlimited && <Progress value={progressPercentage} className="h-2 bg-gray-200" />}
                  {isUnlimited && <div className="text-green-700 font-medium">✨ Unlimited reviews available</div>}
                </div>
              )}
            </CardContent>
          </Card>
          {showInputForm ? (
            isClient ? ( // Conditionally render Tabs only on client after mount
              <div className="max-w-6xl mx-auto">
                <Tabs defaultValue={activeInputTab} onValueChange={setActiveInputTab} className="space-y-8">
                  <TabsList className="grid w-full grid-cols-7">
                    <TabsTrigger value="url">URL</TabsTrigger>
                    <TabsTrigger value="text">Text</TabsTrigger>
                    <TabsTrigger value="file">File</TabsTrigger>
                    <TabsTrigger value="gmb">Google My Business</TabsTrigger>
                    <TabsTrigger value="tripadvisor">TripAdvisor</TabsTrigger>
                    <TabsTrigger value="booking">Booking.com</TabsTrigger>
                    <TabsTrigger value="trustpilot">Trustpilot</TabsTrigger>
                    <TabsTrigger value="airbnb">
                      <div className="flex items-center">
                        <Image src="/images/airbnb-logo.png" alt="Airbnb" width={20} height={20} className="mr-2" />
                        Airbnb
                      </div>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="url">
                    <div className="space-y-4">
                      <Input
                        type="url"
                        placeholder="Enter URL to analyze reviews from"
                        value={url1}
                        onChange={(e) => setUrl1(e.target.value)}
                        className="h-12 text-lg text-black"
                      />
                      <Input
                        type="url"
                        placeholder="Optional: Second URL to compare"
                        value={url2}
                        onChange={(e) => setUrl2(e.target.value)}
                        className="h-12 text-lg text-black"
                      />
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 mb-2">
                          <Checkbox
                            id="analyze-all-reviews-url"
                            checked={isAnalyzeAllReviews}
                            onCheckedChange={(checked) => {
                              setIsAnalyzeAllReviews(checked as boolean)
                              if (checked) {
                                setReviewCount(10000) // Set to a very high number for "all"
                              } else {
                                setReviewCount(100) // Reset to default if unchecked
                              }
                            }}
                            disabled={!hasAccess("unlimited_reviews")} // Disable if user doesn't have unlimited access
                          />
                          <label
                            htmlFor="analyze-all-reviews-url"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-black"
                          >
                            Analyze all reviews (requires Standard or Custom plan)
                          </label>
                        </div>
                        <label htmlFor="reviewCount" className="text-black text-sm font-medium">
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
                          className="h-12 text-lg text-black"
                          disabled={isAnalyzeAllReviews} // Disable if "Analyze all reviews" is checked
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="text">
                    <Textarea
                      placeholder="Paste reviews here for analysis..."
                      value={reviews}
                      onChange={(e) => setReviews(e.target.value)}
                      className="min-h-[200px] text-lg text-black"
                    />
                  </TabsContent>

                  <TabsContent value="file">
                    <div className="flex items-center justify-center h-[200px] border-2 border-dashed rounded-lg">
                      <Input
                        type="file"
                        accept=".xls,.xlsx"
                        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                        className="max-w-sm text-black"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="gmb">
                    <div className="space-y-4">
                      <div className="text-black mb-2 font-medium">How to get your Google My Business URL:</div>
                      <Input
                        type="url"
                        placeholder="Enter Google My Business URL"
                        value={gmbUrl}
                        onChange={(e) => setGmbUrl(e.target.value)}
                        className="h-12 text-lg mb-4 text-black"
                      />
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 mb-2">
                          <Checkbox
                            id="analyze-all-reviews-gmb"
                            checked={isAnalyzeAllReviews}
                            onCheckedChange={(checked) => {
                              setIsAnalyzeAllReviews(checked as boolean)
                              if (checked) {
                                setReviewCount(10000) // Set to a very high number for "all"
                              } else {
                                setReviewCount(100) // Reset to default if unchecked
                              }
                            }}
                            disabled={!hasAccess("unlimited_reviews")} // Disable if user doesn't have unlimited access
                          />
                          <label
                            htmlFor="analyze-all-reviews-gmb"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-black"
                          >
                            Analyze all reviews (requires Standard or Custom plan)
                          </label>
                        </div>
                        <label htmlFor="reviewCount" className="text-black text-sm font-medium">
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
                          className="h-12 text-lg text-black"
                          disabled={isAnalyzeAllReviews} // Disable if "Analyze all reviews" is checked
                        />
                      </div>
                      <ol className="list-decimal pl-5 mt-1 space-y-1 text-sm text-gray-700">
                        <li>Go to Google Maps and search for your business</li>
                        <li>Click on your business listing</li>
                        <li>Copy the URL from your browser's address bar</li>
                      </ol>
                      <div className="text-sm text-gray-700 mt-1">
                        <strong>Example:</strong> https://www.google.com/maps/place/Starbucks/@37.7749,-122.4194,15z/
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="tripadvisor">
                    <div className="space-y-4">
                      <div className="text-black mb-2 font-medium">How to get your TripAdvisor URL:</div>
                      <Input
                        type="url"
                        placeholder="Enter TripAdvisor URL"
                        value={tripAdvisorUrl}
                        onChange={(e) => setTripAdvisorUrl(e.target.value)}
                        className="h-12 text-lg mb-4 text-black"
                      />
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 mb-2">
                          <Checkbox
                            id="analyze-all-reviews-tripadvisor"
                            checked={isAnalyzeAllReviews}
                            onCheckedChange={(checked) => {
                              setIsAnalyzeAllReviews(checked as boolean)
                              if (checked) {
                                setReviewCount(10000) // Set to a very high number for "all"
                              } else {
                                setReviewCount(100) // Reset to default if unchecked
                              }
                            }}
                            disabled={!hasAccess("unlimited_reviews")} // Disable if user doesn't have unlimited access
                          />
                          <label
                            htmlFor="analyze-all-reviews-tripadvisor"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-black"
                          >
                            Analyze all reviews (requires Standard or Custom plan)
                          </label>
                        </div>
                        <label htmlFor="reviewCount" className="text-black text-sm font-medium">
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
                          className="h-12 text-lg text-black"
                          disabled={isAnalyzeAllReviews} // Disable if "Analyze all reviews" is checked
                        />
                      </div>
                      <ol className="list-decimal pl-5 mt-1 space-y-1 text-sm text-gray-700">
                        <li>Go to TripAdvisor and search for your business</li>
                        <li>Click on your business listing</li>
                        <li>Navigate to the reviews section</li>
                        <li>Copy the URL from your browser's address bar</li>
                      </ol>
                      <div className="text-sm text-gray-700 mt-1">
                        <strong>Example:</strong>
                        https://www.tripadvisor.com/Hotel_Review-g60763-d208453-Reviews-Hilton_New_York_Times_Square-New_York_City_New_York.html
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="booking">
                    <div className="space-y-4">
                      <div className="text-black mb-2 font-medium">How to get your Booking.com URL:</div>
                      <Input
                        type="url"
                        placeholder="Enter Booking.com URL"
                        value={bookingUrl}
                        onChange={(e) => setBookingUrl(e.target.value)}
                        className="h-12 text-lg mb-4 text-black"
                      />
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 mb-2">
                          <Checkbox
                            id="analyze-all-reviews-booking"
                            checked={isAnalyzeAllReviews}
                            onCheckedChange={(checked) => {
                              setIsAnalyzeAllReviews(checked as boolean)
                              if (checked) {
                                setReviewCount(10000) // Set to a very high number for "all"
                              } else {
                                setReviewCount(100) // Reset to default if unchecked
                              }
                            }}
                            disabled={!hasAccess("unlimited_reviews")} // Disable if user doesn't have unlimited access
                          />
                          <label
                            htmlFor="analyze-all-reviews-booking"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-black"
                          >
                            Analyze all reviews (requires Standard or Custom plan)
                          </label>
                        </div>
                        <label htmlFor="reviewCount" className="text-black text-sm font-medium">
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
                          className="h-12 text-lg text-black"
                          disabled={isAnalyzeAllReviews} // Disable if "Analyze all reviews" is checked
                        />
                      </div>
                      <ol className="list-decimal pl-5 mt-1 space-y-1 text-sm text-gray-700">
                        <li>Go to Booking.com and search for your property</li>
                        <li>Click on your property listing</li>
                        <li>Navigate to the reviews section</li>
                        <li>Copy the URL from your browser's address bar</li>
                      </ol>
                      <div className="text-sm text-gray-700 mt-1">
                        <strong>Example:</strong> https://www.booking.com/hotel/us/bellagio.html
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="trustpilot">
                    <div className="space-y-4">
                      <div className="text-black mb-2 font-medium">How to get your Trustpilot Company Domain:</div>
                      <Input
                        type="text"
                        placeholder="Enter Trustpilot Company Domain (e.g., example.com)"
                        value={trustpilotCompanyDomain}
                        onChange={(e) => setTrustpilotCompanyDomain(e.target.value)}
                        className="h-12 text-lg mb-4 text-black"
                      />
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 mb-2">
                          <Checkbox
                            id="analyze-all-reviews-trustpilot"
                            checked={isAnalyzeAllReviews}
                            onCheckedChange={(checked) => {
                              setIsAnalyzeAllReviews(checked as boolean)
                              if (checked) {
                                setReviewCount(10000) // Set to a very high number for "all"
                              } else {
                                setReviewCount(100) // Reset to default if unchecked
                              }
                            }}
                            disabled={!hasAccess("unlimited_reviews")} // Disable if user doesn't have unlimited access
                          />
                          <label
                            htmlFor="analyze-all-reviews-trustpilot"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-black"
                          >
                            Analyze all reviews (requires Standard or Custom plan)
                          </label>
                        </div>
                        <label htmlFor="reviewCount" className="text-black text-sm font-medium">
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
                          className="h-12 text-lg text-black"
                          disabled={isAnalyzeAllReviews} // Disable if "Analyze all reviews" is checked
                        />
                      </div>
                      <ol className="list-decimal pl-5 mt-1 space-y-1 text-sm text-gray-700">
                        <li>Go to Trustpilot and search for your business (e.g., "pipedrive")</li>
                        <li>
                          From the business's Trustpilot page, identify the domain in the URL (e.g., "pipedrive.com")
                        </li>
                        <li>Enter only the domain name (e.g., "pipedrive.com")</li>
                      </ol>
                      <div className="text-sm text-gray-700 mt-1">
                        <strong>Example:</strong> For https://www.trustpilot.com/review/pipedrive.com, enter
                        `pipedrive.com`
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="airbnb">
                    <div className="space-y-4">
                      <div className="text-black mb-2 font-medium">How to get your Airbnb URL:</div>
                      <Input
                        type="url"
                        placeholder="Enter Airbnb URL"
                        value={airbnbUrl}
                        onChange={(e) => setAirbnbUrl(e.target.value)}
                        className="h-12 text-lg mb-4 text-black"
                      />
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 mb-2">
                          <Checkbox
                            id="analyze-all-reviews-airbnb"
                            checked={isAnalyzeAllReviews}
                            onCheckedChange={(checked) => {
                              setIsAnalyzeAllReviews(checked as boolean)
                              if (checked) {
                                setReviewCount(10000) // Set to a very high number for "all"
                              } else {
                                setReviewCount(100) // Reset to default if unchecked
                              }
                            }}
                            disabled={!hasAccess("unlimited_reviews")} // Disable if user doesn't have unlimited access
                          />
                          <label
                            htmlFor="analyze-all-reviews-airbnb"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-black"
                          >
                            Analyze all reviews (requires Standard or Custom plan)
                          </label>
                        </div>
                        <label htmlFor="reviewCount" className="text-black text-sm font-medium">
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
                          className="h-12 text-lg text-black"
                          disabled={isAnalyzeAllReviews} // Disable if "Analyze all reviews" is checked
                        />
                      </div>
                      <ol className="list-decimal pl-5 mt-1 space-y-1 text-sm text-gray-700">
                        <li>Go to Airbnb and search for your listing</li>
                        <li>Click on your listing</li>
                        <li>Copy the URL from your browser's address bar</li>
                      </ol>
                      <div className="text-sm text-gray-700 mt-1">
                        <strong>Example:</strong> https://www.airbnb.com/rooms/123456789
                      </div>
                    </div>
                  </TabsContent>

                  <div className="flex justify-center">
                    <Button
                      onClick={handleAnalyze}
                      disabled={loading}
                      className="bg-black text-white hover:bg-gray-800 h-12 px-8 text-lg"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                            <span>{loadingProgress || "Analyzing..."}</span>
                            {loadingStep > 0 && (
                              <span className="text-xs opacity-75">
                                Step {loadingStep} of {totalSteps}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        "Analyze Reviews"
                      )}
                    </Button>
                  </div>
                </Tabs>
              </div>
            ) : (
              // Placeholder for server-side rendering to avoid empty space
              <div className="max-w-6xl mx-auto h-[500px] flex items-center justify-center text-gray-500">
                Loading form...
              </div>
            )
          ) : (
            /* Replace Tabs with a div, as the inner TabsList is being removed */
            <div className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto">
              {/* Left Sidebar for Analysis Tabs */}
              <div className="md:w-64 flex-shrink-0 bg-gray-50 p-4 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold mb-4 text-black">Analysis Sections</h2>
                {/* Replaced TabsList with a div and TabsTrigger with Buttons */}
                <div className="flex flex-col h-auto items-start justify-start bg-transparent p-0 space-y-1">
                  <Button
                    onClick={() => setActiveAnalysisTab("overview")}
                    className={cn(
                      "w-full justify-start",
                      activeAnalysisTab === "overview" ? "bg-gray-200 shadow-none" : "bg-transparent hover:bg-gray-100",
                      "text-black",
                    )}
                  >
                    Overview
                  </Button>
                  <Button
                    onClick={() => setActiveAnalysisTab("sentiment")}
                    className={cn(
                      "w-full justify-start",
                      activeAnalysisTab === "sentiment"
                        ? "bg-gray-200 shadow-none"
                        : "bg-transparent hover:bg-gray-100",
                      "text-black",
                    )}
                  >
                    Sentiment
                  </Button>
                  <Button
                    onClick={() => setActiveAnalysisTab("themes")}
                    className={cn(
                      "w-full justify-start",
                      activeAnalysisTab === "themes" ? "bg-gray-200 shadow-none" : "bg-transparent hover:bg-gray-100",
                      "text-black",
                    )}
                  >
                    Themes
                  </Button>
                  <Button
                    onClick={() => setActiveAnalysisTab("customer")}
                    className={cn(
                      "w-full justify-start",
                      activeAnalysisTab === "customer" ? "bg-gray-200 shadow-none" : "bg-transparent hover:bg-gray-100",
                      "text-black",
                    )}
                  >
                    Customer
                  </Button>
                  <Button
                    onClick={() => setActiveAnalysisTab("marketing")}
                    className={cn(
                      "w-full justify-start",
                      activeAnalysisTab === "marketing"
                        ? "bg-gray-200 shadow-none"
                        : "bg-transparent hover:bg-gray-100",
                      "text-black",
                    )}
                  >
                    Marketing
                  </Button>
                </div>
              </div>

              {/* Main Content Area for Analysis Results */}
              <div className="flex-grow">
                <div className="w-full mx-auto mb-8 flex items-center justify-between">
                  <Button variant="outline" onClick={resetAnalysis} className="gap-2 text-black border-gray-300">
                    <ArrowLeft className="h-4 w-4" />
                    New Analysis
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleDownloadPDF} className="gap-2 text-black border-gray-300">
                      <Download className="h-4 w-4" />
                      Download PDF
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

                {/* Use the ComprehensiveAnalysisDisplay component to show all visualizations */}
                <ComprehensiveAnalysisDisplay
                  analysisResults={analysisResults}
                  onDownloadPDF={handleDownloadPDF}
                  activeTab={activeAnalysisTab}
                />
              </div>
            </div>
          )}
          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded max-w-6xl mx-auto">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
              {error.includes("Invalid Google Maps URL") && (
                <div className="mt-2 text-sm">
                  <p className="font-semibold">Tips for Google My Business URLs:</p>
                  <ul className="list-disc pl-5 mt-1">
                    <li>Make sure the URL contains your business name</li>
                    <li>The URL should be from Google Maps, not Google Search</li>
                    <li>Try searching for your business on Google Maps and copying that URL</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
