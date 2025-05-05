"use client"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, ArrowLeft, AlertCircle } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import { analyzeSentiment } from "../actions"
import { Header } from "../components/Header"
import { Footer } from "../components/Footer"
import { generatePDFReport } from "../utils/pdfGenerator"
import { SaveEstablishment } from "../components/SaveEstablishment"
import { SentimentPieChart } from "../components/SentimentPieChart"
import { EmotionsBarChart } from "../components/EmotionsBarChart"
import { KeywordCloud } from "../components/KeywordCloud"
import { StrengthsWeaknessesBarChart } from "../components/StrengthsWeaknessesBarChart"
import { ProductPromotionArguments } from "../components/ProductPromotionArguments"
import { ReviewTimelineGraph } from "../components/ReviewTimelineGraph"
import { NetPromoterScore } from "../components/NetPromoterScore"
import { TimeBetweenPurchaseReview } from "../components/TimeBetweenPurchaseReview"
import { RatingDistributionChart } from "../components/RatingDistributionChart"
import { TemporalHeatmap } from "../components/TemporalHeatmap"
import { NoticesPerMonthChart } from "../components/NoticesPerMonthChart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnalysisResultsCard } from "../components/AnalysisResultsCard"
import { AnalysisSummaryCards } from "../components/AnalysisSummaryCards"
import { ReviewSummaryTable } from "../components/ReviewSummaryTable"
import { ToneBarChart } from "../components/ToneBarChart"
import { RatingBoxPlot } from "../components/RatingBoxPlot"
import { NegativeReviewPrediction } from "../components/NegativeReviewPrediction"
import { ReviewClusteringGraph } from "../components/ReviewClusteringGraph"
import { InfluentialReviews } from "../components/InfluentialReviews"

export default function AnalyzePage() {
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

  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession()
      if (data?.session?.user) {
        setUser(data.session.user)

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
      setError("Bulk analysis is only available on the Custom plan. Please upgrade to access this feature.")
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
        throw new Error("No results could be obtained from any of the URLs")
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
      } else {
        throw new Error("Failed to combine analysis results")
      }
    } catch (error: any) {
      console.error("Bulk analysis error:", error)
      setAnalysisResults(null)
      setError(error.message || "An error occurred during bulk analysis")
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

  const handleAnalyze = async () => {
    // Check if user is logged in
    if (!user) {
      router.push("/login")
      return
    }

    setLoading(true)
    setError(null)
    try {
      let input: any = {}
      let analyzedUrl = null
      let type = null

      if (url1) {
        input = { type: "url", content: url1 }
        analyzedUrl = url1
        type = "URL"
      } else if (gmbUrl) {
        input = { type: "gmb", content: gmbUrl }
        analyzedUrl = gmbUrl
        type = "Google My Business"
      } else if (tripAdvisorUrl) {
        input = { type: "tripadvisor", content: tripAdvisorUrl }
        analyzedUrl = tripAdvisorUrl
        type = "TripAdvisor"
      } else if (bookingUrl) {
        input = { type: "booking", content: bookingUrl }
        analyzedUrl = bookingUrl
        type = "Booking.com"
      } else if (file) {
        const arrayBuffer = await file.arrayBuffer()
        input = { type: "file", content: arrayBuffer }
        analyzedUrl = file.name
        type = "File"
      } else if (reviews) {
        input = { type: "text", content: reviews }
        analyzedUrl = "Text Input"
        type = "Text"
      } else {
        setError("Please enter a URL or text to analyze.")
        setLoading(false)
        return
      }

      console.log("Starting analysis with input type:", input.type)

      try {
        const results = await analyzeSentiment(input)
        if (results) {
          console.log("Analysis results:", results)

          // Check if review count exceeds the limit for the user's plan
          if (results.reviewCount > reviewLimit && !hasAccess("unlimited_reviews")) {
            setError(
              `Your current plan allows analysis of up to ${reviewLimit} reviews. This analysis contains ${results.reviewCount} reviews. Please upgrade to analyze more reviews.`,
            )
            setShowUpgradeModal(true)
            // Still show results but with a warning
          }

          setAnalysisResults(results)
          setShowInputForm(false)
          setCurrentUrl(analyzedUrl)
          setAnalysisType(type)
        } else {
          throw new Error("No analysis results returned")
        }
      } catch (error: any) {
        console.error("Analysis error:", error)
        setError(error.message || "An error occurred during analysis")
      }
    } catch (error: any) {
      console.error("Analysis error:", error)
      setAnalysisResults(null)
      setError(error.message || "An error occurred during analysis")
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = () => {
    // Check if user has export access
    if (!hasAccess("export")) {
      setError("Exporting reports is only available on paid plans. Please upgrade to access this feature.")
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

    let commentary = `Based on the analysis of ${reviewCount} reviews, your customer sentiment is `

    if (positivePercentage >= 70) {
      commentary += `overwhelmingly positive at ${positivePercentage}%. This is an excellent indicator of strong customer satisfaction and loyalty. Your customers are clearly happy with their experience, which provides a solid foundation for brand advocacy.`
    } else if (positivePercentage >= 50) {
      commentary += `generally positive at ${positivePercentage}%. While this is a good sign, there's room for improvement. The ${neutralPercentage}% neutral and ${negativePercentage}% negative sentiments suggest some areas that could be addressed to enhance overall customer satisfaction.`
    } else if (positivePercentage >= 30) {
      commentary += `mixed, with ${positivePercentage}% positive, ${neutralPercentage}% neutral, and ${negativePercentage}% negative reviews. This indicates significant challenges in customer satisfaction that require attention. Focus on understanding and addressing the common issues raised in negative reviews.`
    } else {
      commentary += `concerning, with only ${positivePercentage}% positive reviews. The high percentage of negative sentiment (${negativePercentage}%) suggests critical issues that need immediate attention to prevent further damage to your brand reputation.`
    }

    // Add specific advice based on sentiment distribution
    if (positivePercentage >= 70) {
      commentary += ` To maintain this excellent performance, continue focusing on your strengths while addressing the small percentage of negative feedback to achieve even higher satisfaction levels.`
    } else if (negativePercentage > 30) {
      commentary += ` Consider implementing a systematic approach to address customer complaints and improve the aspects of your product or service that are generating negative feedback.`
    }

    return commentary
  }

  // Generate personalized commentary for emotions
  const generateEmotionsCommentary = () => {
    if (!analysisResults || !analysisResults.emotions || analysisResults.emotions.length === 0) return ""

    const emotions = analysisResults.emotions
    const topEmotions = emotions.slice(0, 3)
    const primaryEmotion = topEmotions[0]

    let commentary = `The emotional analysis reveals that "${primaryEmotion.emotion}" is the dominant emotion expressed by your customers`

    if (topEmotions.length > 1) {
      commentary += `, followed by "${topEmotions[1].emotion}"`
      if (topEmotions.length > 2) {
        commentary += ` and "${topEmotions[2].emotion}"`
      }
    }
    commentary += `. `

    // Add emotion-specific insights
    switch (primaryEmotion.emotion.toLowerCase()) {
      case "satisfaction":
        commentary += `This high level of satisfaction indicates your product or service is meeting customer expectations. Customers who feel satisfied are more likely to become repeat buyers and recommend your brand to others.`
        break
      case "joy":
      case "happiness":
        commentary += `The prevalence of joy in customer feedback is a powerful indicator that your offering is creating positive emotional experiences. This emotional connection can be leveraged in marketing to strengthen brand loyalty.`
        break
      case "trust":
        commentary += `Trust is a fundamental emotion for building long-term customer relationships. Your customers feel confident in your brand's reliability and integrity, which is a valuable asset for customer retention.`
        break
      case "anticipation":
        commentary += `Customers expressing anticipation are excited about future experiences with your brand. This presents an opportunity to nurture this enthusiasm through engaging communication about upcoming features or offerings.`
        break
      case "disappointment":
        commentary += `The presence of disappointment suggests a gap between customer expectations and their actual experience. Identifying and addressing these unmet expectations should be a priority to improve customer satisfaction.`
        break
      case "frustration":
        commentary += `Customer frustration often stems from difficulties in using your product or service, or from unresolved issues. Improving user experience and customer support processes could help reduce this negative emotion.`
        break
      case "anger":
        commentary += `Anger is a strong negative emotion that requires immediate attention. These customers are at high risk of churning and sharing negative word-of-mouth. Proactive outreach and resolution strategies are essential.`
        break
      default:
        commentary += `Understanding this emotional response helps you connect with customers on a deeper level and tailor your marketing and product development to better meet their emotional needs.`
    }

    return commentary
  }

  // Generate personalized commentary for themes
  const generateThemesCommentary = () => {
    if (!analysisResults || !analysisResults.themes || analysisResults.themes.length === 0) return ""

    const themes = analysisResults.themes
    const topThemes = themes.slice(0, 5)

    let commentary = `The keyword analysis has identified ${themes.length} distinct themes in your customer reviews, with `

    if (topThemes.length > 0) {
      commentary += `"${topThemes[0].theme}" being mentioned most frequently (${topThemes[0].count} times)`
      if (topThemes.length > 1) {
        commentary += `, followed by "${topThemes[1].theme}" (${topThemes[1].count} times)`
        if (topThemes.length > 2) {
          commentary += ` and "${topThemes[2].theme}" (${topThemes[2].count} times)`
        }
      }
    }
    commentary += `. `

    commentary += `These recurring themes represent the aspects of your product or service that customers find most noteworthy. By focusing your attention on these key areas, you can make targeted improvements that will have the greatest impact on customer satisfaction.`

    // Add specific advice based on top themes
    if (topThemes.length > 0) {
      const topTheme = topThemes[0].theme.toLowerCase()
      if (topTheme.includes("quality") || topTheme.includes("performance")) {
        commentary += ` The emphasis on ${topTheme} suggests that customers value the reliability and effectiveness of your offering. Maintaining high standards in this area should remain a priority.`
      } else if (topTheme.includes("price") || topTheme.includes("cost") || topTheme.includes("value")) {
        commentary += ` The focus on ${topTheme} indicates that customers are price-sensitive and evaluating your offering based on perceived value. Consider reviewing your pricing strategy or better communicating the value proposition.`
      } else if (topTheme.includes("service") || topTheme.includes("support") || topTheme.includes("staff")) {
        commentary += ` The prominence of ${topTheme} highlights the importance of human interactions in your customer experience. Investing in staff training and support processes could yield significant improvements in customer satisfaction.`
      }
    }

    return commentary
  }

  // Generate personalized commentary for strengths
  const generateStrengthsCommentary = () => {
    if (!analysisResults || !analysisResults.strengths || analysisResults.strengths.length === 0) return ""

    const strengths = analysisResults.strengths
    const topStrengths = strengths.slice(0, 3)

    let commentary = `Your analysis has identified ${strengths.length} key strengths in your customer feedback. `

    if (topStrengths.length > 0) {
      commentary += `The most frequently mentioned strength is "${topStrengths[0].strength}" (mentioned ${topStrengths[0].count} times)`
      if (topStrengths.length > 1) {
        commentary += `, followed by "${topStrengths[1].strength}" (${topStrengths[1].count} times)`
        if (topStrengths.length > 2) {
          commentary += ` and "${topStrengths[2].strength}" (${topStrengths[2].count} times)`
        }
      }
    }
    commentary += `. `

    commentary += `These strengths represent your competitive advantages and should be highlighted in your marketing communications. They are the aspects of your business that customers value most and contribute significantly to your positive reviews.`

    // Add specific marketing advice based on top strengths
    if (topStrengths.length > 0) {
      commentary += ` Consider featuring testimonials that specifically mention your "${topStrengths[0].strength}" in promotional materials to leverage this recognized strength and attract new customers who value this aspect.`
    }

    return commentary
  }

  // Generate personalized commentary for weaknesses
  const generateWeaknessesCommentary = () => {
    if (!analysisResults || !analysisResults.weaknesses || analysisResults.weaknesses.length === 0) return ""

    const weaknesses = analysisResults.weaknesses
    const topWeaknesses = weaknesses.slice(0, 3)

    let commentary = `The analysis has identified ${weaknesses.length} areas for improvement based on your customer feedback. `

    if (topWeaknesses.length > 0) {
      commentary += `The most frequently mentioned concern is "${topWeaknesses[0].weakness}" (mentioned ${topWeaknesses[0].count} times)`
      if (topWeaknesses.length > 1) {
        commentary += `, followed by "${topWeaknesses[1].weakness}" (${topWeaknesses[1].count} times)`
        if (topWeaknesses.length > 2) {
          commentary += ` and "${topWeaknesses[2].weakness}" (${topWeaknesses[2].count} times)`
        }
      }
    }
    commentary += `. `

    commentary += `Addressing these specific concerns could significantly improve your overall customer satisfaction and reduce negative reviews. Each of these areas represents an opportunity to enhance your offering and better meet customer expectations.`

    // Add specific improvement advice based on top weakness
    if (topWeaknesses.length > 0) {
      const topWeakness = topWeaknesses[0].weakness.toLowerCase()
      if (topWeakness.includes("price") || topWeakness.includes("expensive")) {
        commentary += ` For concerns about "${topWeaknesses[0].weakness}", consider either adjusting your pricing strategy or better communicating the value proposition to justify the current price point.`
      } else if (topWeakness.includes("service") || topWeakness.includes("support")) {
        commentary += ` To address issues with "${topWeaknesses[0].weakness}", investing in customer service training and improving response times could lead to significant improvements in customer satisfaction.`
      } else if (topWeakness.includes("quality") || topWeakness.includes("defect")) {
        commentary += ` For concerns about "${topWeaknesses[0].weakness}", implementing stricter quality control measures and reviewing your production processes could help address these issues.`
      } else {
        commentary += ` Creating a focused improvement plan for "${topWeaknesses[0].weakness}" should be prioritized to address this most common customer concern.`
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

    let commentary = `Your Employee Net Promoter Score (eNPS) of ${score} indicates `

    if (score >= 70) {
      commentary += `an exceptional level of customer loyalty. This is an outstanding result that places you among the top-performing companies. Your customers are highly likely to recommend your brand to others, which is a powerful driver of organic growth.`
    } else if (score >= 50) {
      commentary += `a strong level of customer loyalty. This is a good result that suggests most of your customers are satisfied enough to recommend your brand to others. There is still room for improvement to convert more passives into promoters.`
    } else if (score >= 30) {
      commentary += `a moderate level of customer loyalty. While positive, this score suggests there's significant room for improvement. Focus on understanding what would turn your passive customers into promoters.`
    } else if (score >= 0) {
      commentary += `a concerning level of customer loyalty. With a score just above neutral, you have many detractors and passives. Immediate attention is needed to identify and address the issues causing customer dissatisfaction.`
    } else {
      commentary += `a negative level of customer loyalty. With more detractors than promoters, your business is at risk of negative word-of-mouth affecting your reputation. Urgent intervention is required to understand and address the root causes of customer dissatisfaction.`
    }

    commentary += ` The eNPS is calculated by subtracting the percentage of detractors (customers who gave 1-3 stars) from the percentage of promoters (customers who gave 5 stars). Passives (4 stars) are not counted in the final calculation but represent an opportunity for improvement.`

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

    let commentary = `This timeline shows the distribution of ${totalReviews} reviews over a ${dateRange}-day period. `

    if (trend === "increasing") {
      commentary += `There's a positive trend with review volume increasing over time, which suggests growing customer engagement and interest in sharing feedback about your product or service. This could be due to increased customer base, improved prompting for reviews, or higher customer satisfaction.`
    } else if (trend === "decreasing") {
      commentary += `There's a downward trend in review volume over time, which might indicate decreasing customer engagement or changes in how reviews are being collected. Consider evaluating your review collection process or investigating if there have been changes in customer satisfaction.`
    } else {
      commentary += `The review volume has remained relatively stable over this period, indicating consistent customer engagement with your review platforms.`
    }

    commentary += ` The highest number of reviews (${peakData.count}) was received on ${peakDate}. `

    if (peakData.count > 3 * (totalReviews / reviewDates.length)) {
      commentary += `This significant spike might correspond to a specific event, promotion, product launch, or external factor that generated increased customer feedback. Understanding what drove this peak could provide insights for future engagement strategies.`
    }

    return commentary
  }

  // Generate personalized commentary for temporal heatmap
  const generateHeatmapCommentary = () => {
    return `This temporal heatmap visualizes when customers are most likely to leave reviews, broken down by day of the week and hour of the day. Darker colors indicate higher volumes of reviews during those specific time periods. This visualization helps identify patterns in customer behavior that can inform your marketing and customer service strategies.

The heatmap reveals when your customers are most actively engaged with your brand online. These peak times represent optimal windows for responding to reviews promptly, launching new promotions, or scheduling social media posts for maximum visibility. Understanding these temporal patterns can help you allocate customer service resources more efficiently and time your communications for periods of high customer engagement.`
  }

  // Generate personalized commentary for purchase-review time
  const generatePurchaseReviewCommentary = () => {
    return `This chart illustrates how much time typically passes between a customer's purchase and when they leave a review. Understanding this timing is crucial for optimizing your review collection strategy and interpreting feedback appropriately.

Reviews left very soon after purchase (0-3 days) often reflect the initial impression, delivery experience, and customer service, while reviews left after longer periods (15+ days) tend to focus more on product durability, long-term performance, and overall satisfaction. The distribution shown here can help you determine the optimal timing for sending review request emails to maximize response rates. It also provides context for interpreting the content of reviews based on when they were submitted relative to the purchase date.`
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

    let commentary = `This chart displays the distribution of star ratings across your ${total} reviews, with an average rating of ${roundedAverage.toFixed(2)} out of 5 stars. `

    if (percentages[5] + percentages[4] > 80) {
      commentary += `With ${percentages[5] + percentages[4]}% of reviews being 4 or 5 stars, your product or service is receiving overwhelmingly positive ratings. This excellent rating profile suggests high customer satisfaction and is likely to positively influence potential customers' purchasing decisions.`
    } else if (percentages[5] + percentages[4] > 60) {
      commentary += `With ${percentages[5] + percentages[4]}% of reviews being 4 or 5 stars, your product or service is generally well-received. However, there's room for improvement in addressing the concerns of customers who left lower ratings.`
    } else if (percentages[1] + percentages[2] > 40) {
      commentary += `With ${percentages[1] + percentages[2]}% of reviews being 1 or 2 stars, your product or service is facing significant customer satisfaction challenges. Urgent attention is needed to address the issues causing these negative ratings.`
    } else {
      commentary += `Your rating distribution shows a mixed reception, with ratings spread across the spectrum. This suggests inconsistent experiences among your customers, which could be due to product variability, service inconsistency, or different customer expectations.`
    }

    commentary += ` Understanding this distribution helps you gauge overall customer satisfaction and identify opportunities for improvement. Each star rating category represents different levels of customer experience that can inform targeted enhancement strategies.`

    return commentary
  }

  // Generate personalized commentary for marketing insights
  const generateMarketingCommentary = () => {
    if (!analysisResults) return ""

    const { strengths, weaknesses, themes } = analysisResults

    let commentary = `The marketing insights tool provides data-driven messaging strategies based on your customer sentiment analysis. `

    if (strengths && strengths.length > 0) {
      commentary += `By leveraging your identified strengths like "${strengths[0].strength}" in your marketing arguments, you can create more compelling and authentic messaging that resonates with potential customers. `
    }

    if (weaknesses && weaknesses.length > 0) {
      commentary += `The counter-arguments section helps you address common objections related to "${weaknesses[0].weakness}" that might be preventing conversions. `
    }

    commentary += `These insights allow you to align your marketing strategy with actual customer experiences rather than assumptions. By focusing on the aspects that customers genuinely value and proactively addressing their concerns, you can create more effective marketing campaigns that drive higher conversion rates and attract customers who are more likely to be satisfied with your offering.`

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

    let commentary = `This chart shows the distribution of reviews by month. `

    if (monthlyArray.length > 1) {
      commentary += `The highest volume of reviews was received in ${peakMonth.month} with ${peakMonth.count} reviews. `

      // Identify any seasonal patterns
      if (monthlyArray.length >= 12) {
        commentary += `Looking at the yearly pattern, you can identify any seasonal trends in review volume that might correlate with your business cycles, marketing campaigns, or industry seasonality. `
      }

      commentary += `Understanding these monthly patterns can help you anticipate periods of higher review activity and allocate resources accordingly. It can also help you identify if there are specific months where you might need to be more proactive in soliciting reviews to maintain a consistent flow of feedback.`
    } else {
      commentary += `With data from only one month (${peakMonth.month}), it's not yet possible to identify trends over time. As you collect more reviews, this chart will become more valuable for identifying seasonal patterns and long-term trends in customer feedback.`
    }

    return commentary
  }

  const getSubscriptionBadge = () => {
    if (isLoadingSubscription) return null

    if (!subscription) {
      return (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No active subscription</AlertTitle>
          <AlertDescription>You don't have an active subscription. Some features may be limited.</AlertDescription>
          <div className="mt-2">
            <Button size="sm" onClick={() => (window.location.href = "https://buy.stripe.com/8wM5kpgmA7na9eU4gg")}>
              Upgrade Now
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
          <AlertTitle>Free Trial</AlertTitle>
          <AlertDescription>
            You're currently on a free trial. {daysLeft > 0 ? `${daysLeft} days remaining.` : "Your trial ends today."}
          </AlertDescription>
          <div className="mt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => (window.location.href = "https://buy.stripe.com/8wM5kpgmA7na9eU4gg")}
            >
              Upgrade to Standard Plan
            </Button>
          </div>
        </Alert>
      )
    }

    if (subscription.status === "active") {
      return (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <Info className="h-4 w-4 text-green-600" />
          <AlertTitle>Active Subscription</AlertTitle>
          <AlertDescription>
            You have an active {subscription.plan_id} subscription. Next billing date:{" "}
            {new Date(subscription.current_period_end).toLocaleDateString()}
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
          <h1 className="text-4xl font-bold mb-4 text-center text-white">Ad Sentiment Analyzer</h1>
          <p className="text-xl text-gray-400 mb-8 text-center">
            Analyze customer reviews to improve your advertising messages and product features.
          </p>
          {getSubscriptionBadge()}
          {showInputForm ? (
            <div className="max-w-6xl mx-auto">
              {" "}
              {/* Keep form centered */}
              <Tabs defaultValue="gmb" className="space-y-8">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="url">Product URLs</TabsTrigger>
                  <TabsTrigger value="text">Paste Reviews</TabsTrigger>
                  <TabsTrigger value="file">Upload XLS</TabsTrigger>
                  <TabsTrigger value="gmb">Google Reviews</TabsTrigger>
                  <TabsTrigger value="tripadvisor">TripAdvisor</TabsTrigger>
                  <TabsTrigger value="booking">Booking.com</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="url">
                  <div className="space-y-4">
                    <Input
                      type="url"
                      placeholder="Enter the first product URL..."
                      value={url1}
                      onChange={(e) => setUrl1(e.target.value)}
                      className="h-12 text-lg"
                    />
                    <Input
                      type="url"
                      placeholder="Enter the second product URL (optional)..."
                      value={url2}
                      onChange={(e) => setUrl2(e.target.value)}
                      className="h-12 text-lg"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="text">
                  <Textarea
                    placeholder="Paste your reviews here..."
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
                    <Input
                      type="url"
                      placeholder="Enter Google Maps business listing URL..."
                      value={gmbUrl}
                      onChange={(e) => setGmbUrl(e.target.value)}
                      className="h-12 text-lg"
                    />

                    <Alert className="bg-blue-50 border-blue-200 text-blue-800">
                      <Info className="h-4 w-4 text-blue-500" />
                      <AlertDescription className="text-sm">
                        <strong>How to get the correct URL:</strong>
                      </AlertDescription>
                    </Alert>

                    <ol className="list-decimal pl-5 mt-1 space-y-1 text-sm text-gray-700">
                      <li>Go to Google Maps and search for a business</li>
                      <li>Click on the business name to open its details</li>
                      <li>Copy the entire URL from your browser's address bar</li>
                    </ol>

                    <div className="text-sm text-gray-700 mt-1">
                      <strong>Example:</strong> https://www.google.com/maps/place/Starbucks/@37.7749,-122.4194,15z/
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="tripadvisor">
                  <div className="space-y-4">
                    <Input
                      type="url"
                      placeholder="Enter TripAdvisor review page URL..."
                      value={tripAdvisorUrl}
                      onChange={(e) => setTripAdvisorUrl(e.target.value)}
                      className="h-12 text-lg"
                    />

                    <Alert className="bg-blue-50 border-blue-200 text-blue-800">
                      <Info className="h-4 w-4 text-blue-500" />
                      <AlertDescription className="text-sm">
                        <strong>How to get the correct URL:</strong>
                      </AlertDescription>
                    </Alert>

                    <ol className="list-decimal pl-5 mt-1 space-y-1 text-sm text-gray-700">
                      <li>Go to TripAdvisor and search for a hotel, restaurant, or attraction</li>
                      <li>Click on the listing to open its details page</li>
                      <li>Click on the "Reviews" tab if not already there</li>
                      <li>Copy the entire URL from your browser's address bar</li>
                    </ol>

                    <div className="text-sm text-gray-700 mt-1">
                      <strong>Example:</strong>{" "}
                      https://www.tripadvisor.com/Hotel_Review-g60763-d208453-Reviews-Hilton_New_York_Times_Square-New_York_City_New_York.html
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="booking">
                  <div className="space-y-4">
                    <Input
                      type="url"
                      placeholder="Enter Booking.com hotel page URL..."
                      value={bookingUrl}
                      onChange={(e) => setBookingUrl(e.target.value)}
                      className="h-12 text-lg"
                    />

                    <Alert className="bg-blue-50 border-blue-200 text-blue-800">
                      <Info className="h-4 w-4 text-blue-500" />
                      <AlertDescription className="text-sm">
                        <strong>How to get the correct URL:</strong>
                      </AlertDescription>
                    </Alert>

                    <ol className="list-decimal pl-5 mt-1 space-y-1 text-sm text-gray-700">
                      <li>Go to Booking.com and search for a hotel</li>
                      <li>Click on the hotel to open its details page</li>
                      <li>Make sure you're on the hotel's main page or reviews page</li>
                      <li>Copy the entire URL from your browser's address bar</li>
                    </ol>

                    <div className="text-sm text-gray-700 mt-1">
                      <strong>Example:</strong> https://www.booking.com/hotel/us/bellagio.html
                    </div>
                  </div>
                </TabsContent>

                <div className="flex justify-center">
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
                        Analyzing...
                      </div>
                    ) : (
                      "Analyze Sentiment"
                    )}
                  </Button>
                </div>
              </Tabs>
            </div>
          ) : (
            <div className="w-full mx-auto mb-8 flex items-center justify-between">
              <Button variant="outline" onClick={resetAnalysis} className="gap-2 text-white">
                <ArrowLeft className="h-4 w-4" />
                New Analysis
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
          )}
          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded max-w-6xl mx-auto">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
              {error.includes("Invalid Google Maps URL") && (
                <div className="mt-2 text-sm">
                  <p className="font-semibold">Please ensure your Google Maps URL:</p>
                  <ul className="list-disc pl-5 mt-1">
                    <li>Is from Google Maps (contains "google.com/maps")</li>
                    <li>Points to a specific business listing (contains "/place/")</li>
                    <li>Is copied directly from your browser's address bar</li>
                  </ul>
                </div>
              )}
            </div>
          )}
          {analysisResults && (
            <div className="mt-8 bg-white p-6 rounded-lg w-full">
              <h2 className="text-2xl font-bold mb-4">Analysis Results</h2>

              {/* Analysis Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
                <TabsList className="grid grid-cols-5 mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
                  <TabsTrigger value="themes">Themes</TabsTrigger>
                  <TabsTrigger value="customer">Customer Insights</TabsTrigger>
                  <TabsTrigger value="marketing">Marketing</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced Analytics</TabsTrigger>
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
                          <AnalysisSummaryCards
                            totalReviews={analysisResults.reviewCount}
                            averageRating={avgRating}
                            sentimentScore={sentimentScore}
                            averageReviewLength={avgLength}
                          />
                        )
                      })()}

                      <AnalysisResultsCard results={analysisResults} index={0} />

                      {/* Sentiment Pie Chart */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Sentiment Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <SentimentPieChart
                            data={[
                              { name: "Positive", value: analysisResults.sentiment.positive },
                              { name: "Negative", value: analysisResults.sentiment.negative },
                              { name: "Neutral", value: analysisResults.sentiment.neutral },
                            ]}
                            reviewCount={analysisResults.reviewCount}
                            topStrengths={analysisResults.strengths}
                            topWeaknesses={analysisResults.weaknesses}
                          />
                          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <h3 className="text-lg font-semibold mb-2">Analysis Insights</h3>
                            <p className="text-gray-700 leading-relaxed">{generateSentimentCommentary()}</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Tone Breakdown */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Tone Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ToneBarChart
                            data={[
                              { name: "Positive", value: analysisResults.sentiment.positive },
                              { name: "Neutral", value: analysisResults.sentiment.neutral },
                              { name: "Negative", value: analysisResults.sentiment.negative },
                            ]}
                            topStrengths={analysisResults.strengths}
                            topWeaknesses={analysisResults.weaknesses}
                          />
                        </CardContent>
                      </Card>

                      {/* Emotions Bar Chart */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Emotional Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <EmotionsBarChart data={analysisResults.emotions} reviewCount={analysisResults.reviewCount} />
                          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <h3 className="text-lg font-semibold mb-2">Emotional Insights</h3>
                            <p className="text-gray-700 leading-relaxed">{generateEmotionsCommentary()}</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Keyword Cloud */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Key Themes</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <KeywordCloud
                            keywords={analysisResults.themes.map((theme: any) => ({
                              text: theme.theme,
                              value: theme.count,
                            }))}
                          />
                          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <h3 className="text-lg font-semibold mb-2">Theme Insights</h3>
                            <p className="text-gray-700 leading-relaxed">{generateThemesCommentary()}</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Strengths */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Top Strengths</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <StrengthsWeaknessesBarChart data={analysisResults.strengths} type="strengths" />
                          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <h3 className="text-lg font-semibold mb-2">Strengths Analysis</h3>
                            <p className="text-gray-700 leading-relaxed">{generateStrengthsCommentary()}</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Weaknesses */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Weaknesses cited</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <StrengthsWeaknessesBarChart data={analysisResults.weaknesses} type="weaknesses" />
                          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <h3 className="text-lg font-semibold mb-2">Improvement Opportunities</h3>
                            <p className="text-gray-700 leading-relaxed">{generateWeaknessesCommentary()}</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Net Promoter Score */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Net Promoter Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <NetPromoterScore
                            ratings={analysisResults.reviewSummary.map((r: any) => Math.round(r.score * 5))}
                          />
                          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <h3 className="text-lg font-semibold mb-2">NPS Insights</h3>
                            <p className="text-gray-700 leading-relaxed">{generateNPSCommentary()}</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Rating Distribution */}
                      <Card className="mb-6">
                        <CardHeader>
                          <CardTitle>Rating Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <RatingDistributionChart
                            ratings={analysisResults.reviewSummary.map((r: any) => r.score * 5)}
                          />
                          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <h3 className="text-lg font-semibold mb-2">Rating Insights</h3>
                            <p className="text-gray-700 leading-relaxed">{generateRatingCommentary()}</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Marketing Insights */}
                      <Card className="mb-6">
                        <CardHeader>
                          <CardTitle>Marketing Insights</CardTitle>
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
                            <h3 className="text-lg font-semibold mb-2">Marketing Commentary</h3>
                            <p className="text-gray-700 leading-relaxed">{generateMarketingCommentary()}</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Review Summary Table */}
                      <Card className="mb-6">
                        <CardHeader>
                          <CardTitle>Summary of Reviews</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ReviewSummaryTable reviews={analysisResults.reviewSummary} />
                        </CardContent>
                      </Card>

                      {/* Rating Box Plot */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Rating Distribution by Category</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <RatingBoxPlot reviewData={analysisResults.reviewSummary} />
                        </CardContent>
                      </Card>

                      {/* Review Clustering Graph */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Review Clustering</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ReviewClusteringGraph reviewData={analysisResults.reviewSummary} />
                        </CardContent>
                      </Card>

                      {/* Negative Review Prediction */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Negative Review Prediction</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <NegativeReviewPrediction reviewData={analysisResults.reviewSummary} />
                        </CardContent>
                      </Card>

                      {/* Influential Reviews */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Influential Reviews</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <InfluentialReviews reviewData={analysisResults.reviewSummary} />
                        </CardContent>
                      </Card>

                      {/* Review Timeline Graph */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Review Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {hasReviewDatesData() ? (
                            <ReviewTimelineGraph data={analysisResults.reviewDates} />
                          ) : (
                            <div className="text-center p-8 bg-gray-50 rounded-lg">
                              <p className="text-gray-500">Data not available in your document</p>
                            </div>
                          )}
                          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <h3 className="text-lg font-semibold mb-2">Timeline Insights</h3>
                            <p className="text-gray-700 leading-relaxed">
                              {hasReviewDatesData()
                                ? generateTimelineCommentary()
                                : "Data not available in your document"}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Notices Per Month Chart */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Reviews Per Month</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {hasReviewDatesData() ? (
                            <NoticesPerMonthChart data={analysisResults.reviewDates} />
                          ) : (
                            <div className="text-center p-8 bg-gray-50 rounded-lg">
                              <p className="text-gray-500">Data not available in your document</p>
                            </div>
                          )}
                          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <h3 className="text-lg font-semibold mb-2">Monthly Distribution Insights</h3>
                            <p className="text-gray-700 leading-relaxed">
                              {hasReviewDatesData()
                                ? generateNoticesPerMonthCommentary()
                                : "Data not available in your document"}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Temporal Heatmap */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Review Timing Heatmap</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {hasReviewDatesData() ? (
                            <TemporalHeatmap data={analysisResults.reviewDates} />
                          ) : (
                            <div className="text-center p-8 bg-gray-50 rounded-lg">
                              <p className="text-gray-500">Data not available in your document</p>
                            </div>
                          )}
                          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <h3 className="text-lg font-semibold mb-2">Timing Pattern Insights</h3>
                            <p className="text-gray-700 leading-relaxed">
                              {hasReviewDatesData()
                                ? generateHeatmapCommentary()
                                : "Data not available in your document"}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </TabsContent>

                {/* Sentiment Tab */}
                <TabsContent value="sentiment">
                  {analysisResults && (
                    <div className="space-y-6">
                      {/* Sentiment Pie Chart */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Sentiment Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <SentimentPieChart
                            data={[
                              { name: "Positive", value: analysisResults.sentiment.positive },
                              { name: "Negative", value: analysisResults.sentiment.negative },
                              { name: "Neutral", value: analysisResults.sentiment.neutral },
                            ]}
                            reviewCount={analysisResults.reviewCount}
                            topStrengths={analysisResults.strengths}
                            topWeaknesses={analysisResults.weaknesses}
                          />
                          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <h3 className="text-lg font-semibold mb-2">Analysis Insights</h3>
                            <p className="text-gray-700 leading-relaxed">{generateSentimentCommentary()}</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Tone Breakdown */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Tone Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ToneBarChart
                            data={[
                              { name: "Positive", value: analysisResults.sentiment.positive },
                              { name: "Neutral", value: analysisResults.sentiment.neutral },
                              { name: "Negative", value: analysisResults.sentiment.negative },
                            ]}
                            topStrengths={analysisResults.strengths}
                            topWeaknesses={analysisResults.weaknesses}
                          />
                        </CardContent>
                      </Card>

                      {/* Rating Distribution */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Rating Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <RatingDistributionChart
                            ratings={analysisResults.reviewSummary.map((r: any) => r.score * 5)}
                          />
                          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <h3 className="text-lg font-semibold mb-2">Rating Insights</h3>
                            <p className="text-gray-700 leading-relaxed">{generateRatingCommentary()}</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Net Promoter Score */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Net Promoter Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <NetPromoterScore
                            ratings={analysisResults.reviewSummary.map((r: any) => Math.round(r.score * 5))}
                          />
                          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <h3 className="text-lg font-semibold mb-2">NPS Insights</h3>
                            <p className="text-gray-700 leading-relaxed">{generateNPSCommentary()}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </TabsContent>

                {/* Themes Tab */}
                <TabsContent value="themes">
                  {analysisResults && (
                    <div className="space-y-6">
                      {/* Keyword Cloud */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Key Themes</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <KeywordCloud
                            keywords={analysisResults.themes.map((theme: any) => ({
                              text: theme.theme,
                              value: theme.count,
                            }))}
                          />
                          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <h3 className="text-lg font-semibold mb-2">Theme Insights</h3>
                            <p className="text-gray-700 leading-relaxed">{generateThemesCommentary()}</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Strengths */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Top Strengths</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <StrengthsWeaknessesBarChart data={analysisResults.strengths} type="strengths" />
                          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <h3 className="text-lg font-semibold mb-2">Strengths Analysis</h3>
                            <p className="text-gray-700 leading-relaxed">{generateStrengthsCommentary()}</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Weaknesses */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Weaknesses cited</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <StrengthsWeaknessesBarChart data={analysisResults.weaknesses} type="weaknesses" />
                          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <h3 className="text-lg font-semibold mb-2">Improvement Opportunities</h3>
                            <p className="text-gray-700 leading-relaxed">{generateWeaknessesCommentary()}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </TabsContent>

                {/* Customer Insights Tab */}
                <TabsContent value="customer">
                  {analysisResults && (
                    <div className="space-y-6">
                      {/* Emotions Bar Chart */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Emotional Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <EmotionsBarChart data={analysisResults.emotions} reviewCount={analysisResults.reviewCount} />
                          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <h3 className="text-lg font-semibold mb-2">Emotional Insights</h3>
                            <p className="text-gray-700 leading-relaxed">{generateEmotionsCommentary()}</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Review Timeline Graph */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Review Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {hasReviewDatesData() ? (
                            <ReviewTimelineGraph data={analysisResults.reviewDates} />
                          ) : (
                            <div className="text-center p-8 bg-gray-50 rounded-lg">
                              <p className="text-gray-500">Data not available in your document</p>
                            </div>
                          )}
                          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <h3 className="text-lg font-semibold mb-2">Timeline Insights</h3>
                            <p className="text-gray-700 leading-relaxed">
                              {hasReviewDatesData()
                                ? generateTimelineCommentary()
                                : "Data not available in your document"}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Notices Per Month Chart */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Reviews Per Month</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {hasReviewDatesData() ? (
                            <NoticesPerMonthChart data={analysisResults.reviewDates} />
                          ) : (
                            <div className="text-center p-8 bg-gray-50 rounded-lg">
                              <p className="text-gray-500">Data not available in your document</p>
                            </div>
                          )}
                          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <h3 className="text-lg font-semibold mb-2">Monthly Distribution Insights</h3>
                            <p className="text-gray-700 leading-relaxed">
                              {hasReviewDatesData()
                                ? generateNoticesPerMonthCommentary()
                                : "Data not available in your document"}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Temporal Heatmap */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Review Timing Heatmap</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {hasReviewDatesData() ? (
                            <TemporalHeatmap data={analysisResults.reviewDates} />
                          ) : (
                            <div className="text-center p-8 bg-gray-50 rounded-lg">
                              <p className="text-gray-500">Data not available in your document</p>
                            </div>
                          )}
                          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <h3 className="text-lg font-semibold mb-2">Timing Pattern Insights</h3>
                            <p className="text-gray-700 leading-relaxed">
                              {hasReviewDatesData()
                                ? generateHeatmapCommentary()
                                : "Data not available in your document"}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Time Between Purchase and Review */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Purchase-Review Time</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {hasReviewDatesData() ? (
                            <TimeBetweenPurchaseReview data={analysisResults.reviewDates} />
                          ) : (
                            <div className="text-center p-8 bg-gray-50 rounded-lg">
                              <p className="text-gray-500">Data not available in your document</p>
                            </div>
                          )}
                          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <h3 className="text-lg font-semibold mb-2">Purchase-Review Insights</h3>
                            <p className="text-gray-700 leading-relaxed">
                              {hasReviewDatesData()
                                ? generatePurchaseReviewCommentary()
                                : "Data not available in your document"}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Review Clustering Graph */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Review Clustering</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ReviewClusteringGraph reviewData={analysisResults.reviewSummary} />
                        </CardContent>
                      </Card>

                      {/* Influential Reviews */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Influential Reviews</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <InfluentialReviews reviewData={analysisResults.reviewSummary} />
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </TabsContent>

                {/* Marketing Tab */}
                <TabsContent value="marketing">
                  {analysisResults && (
                    <div className="space-y-6">
                      {/* Marketing Insights */}
                      <Card className="mb-6">
                        <CardHeader>
                          <CardTitle>Marketing Insights</CardTitle>
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
                            <h3 className="text-lg font-semibold mb-2">Marketing Commentary</h3>
                            <p className="text-gray-700 leading-relaxed">{generateMarketingCommentary()}</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Emotions Bar Chart (Marketing Context) */}
                      <Card className="mb-6">
                        <CardHeader>
                          <CardTitle>Emotional Targeting</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <EmotionsBarChart
                            data={analysisResults.emotions}
                            reviewCount={analysisResults.reviewCount}
                            explanation="Understanding the emotional responses of your customers allows you to craft marketing messages that resonate on a deeper level. Target these primary emotions in your advertising copy to create stronger connections with your audience."
                          />
                          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <h3 className="text-lg font-semibold mb-2">Emotional Marketing Strategy</h3>
                            <p className="text-gray-700 leading-relaxed">
                              The emotional analysis above reveals the predominant feelings expressed by your customers.
                              Leveraging these emotions in your marketing creates more resonant messaging that connects
                              on a deeper level. For each primary emotion, consider these targeted approaches:
                              {analysisResults.emotions &&
                                analysisResults.emotions.length > 0 &&
                                analysisResults.emotions[0] && (
                                  <span>
                                    <br />
                                    <br />
                                    <strong>{analysisResults.emotions[0].emotion}:</strong> Create marketing that
                                    emphasizes this emotional response, using language, imagery, and storytelling that
                                    evokes similar feelings in potential customers. This alignment between your
                                    marketing and customers' emotional experience creates authenticity and strengthens
                                    brand connection.
                                  </span>
                                )}
                              <br />
                              <br />
                              Emotional marketing bypasses rational decision-making processes and connects directly with
                              the psychological drivers of purchasing behavior. By aligning your messaging with the
                              emotions already associated with your product, you create more compelling and effective
                              marketing campaigns.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </TabsContent>

                {/* Advanced Analytics Tab */}
                <TabsContent value="advanced">
                  {analysisResults && (
                    <div className="space-y-6">
                      {/* Rating Box Plot */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Rating Distribution by Category</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <RatingBoxPlot reviewData={analysisResults.reviewSummary} />
                        </CardContent>
                      </Card>

                      {/* Negative Review Prediction */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Negative Review Prediction</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <NegativeReviewPrediction reviewData={analysisResults.reviewSummary} />
                        </CardContent>
                      </Card>

                      {/* Review Clustering Graph */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Review Clustering</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ReviewClusteringGraph reviewData={analysisResults.reviewSummary} />
                        </CardContent>
                      </Card>

                      {/* Influential Reviews */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Influential Reviews</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <InfluentialReviews reviewData={analysisResults.reviewSummary} />
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex justify-end mt-4">
                <Button onClick={handleDownloadPDF} className="bg-white text-black hover:bg-white/90">
                  Download PDF Report
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {showUpgradeModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Upgrade Your Plan</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  This feature is only available on paid plans. Please upgrade to access it.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <Button
                  onClick={() => {
                    setShowUpgradeModal(false)
                    window.location.href = "https://buy.stripe.com/8wM5kpgmA7na9eU4gg"
                  }}
                  className="bg-white text-black hover:bg-white/90"
                >
                  Upgrade Now
                </Button>
                <Button
                  onClick={() => setShowUpgradeModal(false)}
                  variant="ghost"
                  className="mt-2 text-gray-500 hover:bg-gray-100"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
