"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThumbsUp, MessageSquare, AlertTriangle, Star } from "lucide-react"

interface InfluentialReviewsProps {
  reviewData: any[]
  explanation?: string
}

export function InfluentialReviews({ reviewData, explanation }: InfluentialReviewsProps) {
  // Process the data to find influential reviews
  const influentialReviews = useMemo(() => {
    if (!reviewData || reviewData.length === 0) {
      return []
    }

    // Create a scoring system for influence
    const scoredReviews = reviewData.map((review) => {
      // Start with a base score
      let influenceScore = 0

      // Factor 1: Likes/Upvotes (if available)
      if (review.likes !== undefined) {
        influenceScore += review.likes * 10
      }

      // Factor 2: Review length (longer reviews tend to be more detailed)
      const length = review.text?.length || 0
      influenceScore += Math.min(length / 20, 50) // Cap at 50 points for length

      // Factor 3: Extreme sentiment (very positive or very negative reviews)
      const sentimentScore = review.score || 0.5
      const sentimentInfluence = Math.abs(sentimentScore - 0.5) * 2 * 30 // Up to 30 points for extreme sentiment
      influenceScore += sentimentInfluence

      // Factor 4: Rating extremity (1-star or 5-star reviews)
      if (review.rating) {
        const ratingExtremity = (Math.abs(review.rating - 3) / 2) * 20 // Up to 20 points for extreme ratings
        influenceScore += ratingExtremity
      }

      return {
        ...review,
        influenceScore,
        // Calculate a normalized score for display (0-100)
        normalizedInfluence: Math.min(Math.round(influenceScore / 2), 100),
      }
    })

    // Sort by influence score (descending)
    return scoredReviews.sort((a, b) => b.influenceScore - a.influenceScore).slice(0, 5) // Top 5 most influential
  }, [reviewData])

  // Generate explanation if not provided
  const generateExplanation = () => {
    if (explanation) return explanation

    if (influentialReviews.length === 0) {
      return "No influential reviews identified in the dataset."
    }

    const topReview = influentialReviews[0]
    const sentiment = topReview.sentiment || (topReview.score > 0.5 ? "positive" : "negative")

    return `
      Influential reviews are those that have the greatest potential impact on other customers' purchasing decisions. 
      
      These reviews are identified based on factors such as length (detail), sentiment extremity, rating, and social proof indicators like likes or upvotes when available.
      
      The most influential review in your dataset is a ${sentiment} review with an influence score of ${topReview.normalizedInfluence}/100. ${topReview.likes !== undefined ? `It has received ${topReview.likes} likes/upvotes.` : ""}
      
      Paying special attention to these influential reviews can help you understand what aspects of your product or service are most likely to impact potential customers' decisions.
    `
  }

  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return ""
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  // Helper function to get sentiment color
  const getSentimentColor = (sentiment: string, score: number) => {
    if (sentiment === "positive" || score > 0.7) return "text-green-500"
    if (sentiment === "negative" || score < 0.3) return "text-red-500"
    return "text-yellow-500"
  }

  // Helper function to get sentiment icon
  const getSentimentIcon = (sentiment: string, score: number) => {
    if (sentiment === "positive" || score > 0.7) return <ThumbsUp className="h-5 w-5 text-green-500" />
    if (sentiment === "negative" || score < 0.3) return <AlertTriangle className="h-5 w-5 text-red-500" />
    return <MessageSquare className="h-5 w-5 text-yellow-500" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Most Influential Reviews</CardTitle>
      </CardHeader>
      <CardContent>
        {influentialReviews.length > 0 ? (
          <div className="space-y-6">
            {influentialReviews.map((review, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    {getSentimentIcon(review.sentiment, review.score)}
                    <span className={`ml-2 font-semibold ${getSentimentColor(review.sentiment, review.score)}`}>
                      {review.sentiment || (review.score > 0.5 ? "Positive" : "Negative")}
                    </span>
                    {review.rating && (
                      <div className="ml-3 flex items-center">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="ml-1">{review.rating}</span>
                      </div>
                    )}
                  </div>
                  <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                    Influence: {review.normalizedInfluence}/100
                  </div>
                </div>

                <p className="text-gray-700 mb-2">{truncateText(review.text, 300)}</p>

                <div className="flex justify-between text-sm text-gray-500">
                  <div>{review.date && <span>Date: {review.date}</span>}</div>
                  <div className="flex items-center">
                    {review.likes !== undefined && (
                      <div className="flex items-center mr-3">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        <span>{review.likes}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      <span>{review.text?.length || 0} chars</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No influential reviews available</p>
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-2">About Influential Reviews</h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{generateExplanation()}</p>
        </div>
      </CardContent>
    </Card>
  )
}
