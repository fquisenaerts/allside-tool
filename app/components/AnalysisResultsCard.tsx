import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Globe, ThumbsUp, TrendingUp } from "lucide-react"

interface AnalysisResultsCardProps {
  results: any
  index: number
}

export function AnalysisResultsCard({ results, index }: AnalysisResultsCardProps) {
  // Extract data from results
  const totalReviews = results.reviewCount || 0
  const language = results.language || "English"
  const positivePercentage = Math.round(results.sentiment?.positive || 0)
  const overallSentiment = positivePercentage >= 70 ? "positive" : positivePercentage >= 40 ? "neutral" : "negative"

  // Get themes (filter out generic ones)
  const keyThemes =
    results.themes
      ?.filter((theme: any) => theme.theme && theme.theme !== "general feedback" && theme.theme !== "Unknown")
      .map((theme: any) => theme.theme) || []

  // Get marketing insights
  const adCopyTargeting = results.comprehensiveAnalysis?.marketingInsights || []

  // Get improvement suggestions
  const improvementSuggestions = results.comprehensiveAnalysis?.recommendations || []

  // Determine opinion trend
  const opinionTrend = results.comprehensiveAnalysis?.trend || "Stable"

  return (
    <Card className="w-full mb-8">
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">Analysis Results {index + 1}</h2>
            <ThumbsUp
              className={`h-6 w-6 ${overallSentiment === "positive" ? "text-green-500" : overallSentiment === "neutral" ? "text-yellow-500" : "text-red-500"}`}
            />
          </div>

          {/* Language and review count */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-gray-500">
              <Globe className="h-5 w-5" />
              <span>Original language: {language}</span>
            </div>
            <p className="text-gray-500">Based on {totalReviews} reviews</p>
          </div>

          {/* Overall Sentiment */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Overall Sentiment</h3>
            <div className="flex items-center gap-3">
              <Badge
                className={`text-white px-4 py-1 text-sm rounded-full ${
                  overallSentiment === "positive"
                    ? "bg-green-600"
                    : overallSentiment === "neutral"
                      ? "bg-yellow-500"
                      : "bg-red-600"
                }`}
              >
                {overallSentiment}
              </Badge>
              <span className="text-gray-700">Score: {positivePercentage}.0%</span>
            </div>
          </div>

          {/* Key Themes */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Key Themes</h3>
            <div className="flex flex-wrap gap-2">
              {keyThemes.length > 0 ? (
                keyThemes.map((theme: string, i: number) => (
                  <Badge key={i} variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                    {theme}
                  </Badge>
                ))
              ) : (
                <p className="text-gray-500">No specific themes identified.</p>
              )}
            </div>
          </div>

          {/* Ad Copy and Targeting Suggestions */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">Ad Copy and Targeting Suggestions</h3>
            <ul className="list-disc pl-6 space-y-2">
              {adCopyTargeting.length > 0 ? (
                <>
                  <li>
                    <span className="font-semibold">Copy:</span> {adCopyTargeting[0]}
                  </li>
                  {adCopyTargeting[1] && (
                    <li>
                      <span className="font-semibold">Targeting:</span> {adCopyTargeting[1]}
                    </li>
                  )}
                </>
              ) : (
                <li>No specific marketing insights available.</li>
              )}
            </ul>
          </div>

          {/* Product Improvement Suggestions */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">Product Improvement Suggestions</h3>
            <ul className="list-disc pl-6 space-y-2">
              {improvementSuggestions.length > 0 ? (
                improvementSuggestions.map((suggestion: string, i: number) => <li key={i}>{suggestion}</li>)
              ) : (
                <li>No specific improvement suggestions available.</li>
              )}
            </ul>
          </div>

          {/* Opinion Trend */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Opinion Trend</h3>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-green-500">{opinionTrend}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
