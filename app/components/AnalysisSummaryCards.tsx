import { Card, CardContent } from "@/components/ui/card"
import { Star, MessageSquare, TrendingUp, ThumbsUp } from "lucide-react"

interface AnalysisSummaryCardsProps {
  totalReviews: number
  averageRating: number
  sentimentScore: number
  averageReviewLength?: number
}

export function AnalysisSummaryCards({
  totalReviews,
  averageRating,
  sentimentScore,
  averageReviewLength,
}: AnalysisSummaryCardsProps) {
  // Format the average rating to one decimal place
  const formattedRating = averageRating.toFixed(1)

  // Determine the sentiment color based on the score
  const getSentimentColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-green-500"
    if (score >= 40) return "text-yellow-500"
    if (score >= 20) return "text-orange-500"
    return "text-red-500"
  }

  // Determine the sentiment label based on the score
  const getSentimentLabel = (score: number) => {
    if (score >= 80) return "Excellent"
    if (score >= 60) return "Good"
    if (score >= 40) return "Mixed"
    if (score >= 20) return "Poor"
    return "Critical"
  }

  // Format the sentiment score as a percentage
  const formattedSentimentScore = `${Math.round(sentimentScore)}%`

  // Determine the engagement level based on average review length
  const getEngagementLevel = (length: number) => {
    if (length >= 500) return "Very High"
    if (length >= 300) return "High"
    if (length >= 150) return "Moderate"
    if (length >= 50) return "Low"
    return "Very Low"
  }

  // Determine the engagement color based on length
  const getEngagementColor = (length: number) => {
    if (length >= 500) return "text-purple-600"
    if (length >= 300) return "text-blue-600"
    if (length >= 150) return "text-blue-500"
    if (length >= 50) return "text-gray-600"
    return "text-gray-500"
  }

  // Format the average review length
  const formattedReviewLength = averageReviewLength ? Math.round(averageReviewLength) : null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Reviews</p>
              <p className="text-3xl font-bold">{totalReviews}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Average Rating</p>
              <div className="flex items-center">
                <p className="text-3xl font-bold">{formattedRating}</p>
                <Star className="h-5 w-5 text-yellow-500 ml-1" />
              </div>
              <p className="text-xs text-gray-500">out of 5</p>
            </div>
            <Star className="h-8 w-8 text-yellow-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Sentiment Score</p>
              <p className={`text-3xl font-bold ${getSentimentColor(sentimentScore)}`}>{formattedSentimentScore}</p>
              <p className="text-xs text-gray-500">{getSentimentLabel(sentimentScore)}</p>
            </div>
            <ThumbsUp className={`h-8 w-8 ${getSentimentColor(sentimentScore)}`} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Average Review Length</p>
              {formattedReviewLength ? (
                <>
                  <p className={`text-3xl font-bold ${getEngagementColor(formattedReviewLength)}`}>
                    {formattedReviewLength}
                  </p>
                  <p className="text-xs text-gray-500">{getEngagementLevel(formattedReviewLength)} Engagement</p>
                </>
              ) : (
                <p className="text-3xl font-bold text-gray-400">N/A</p>
              )}
            </div>
            <TrendingUp
              className={`h-8 w-8 ${formattedReviewLength ? getEngagementColor(formattedReviewLength) : "text-gray-400"}`}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
