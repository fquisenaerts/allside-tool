"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react"

interface Review {
  text: string
  sentiment: "positive" | "neutral" | "negative"
  strengths: string[]
  weaknesses: string[]
  keywords: string[]
  platform?: string
  score?: number
}

interface ReviewSummaryTableProps {
  reviews?: Review[]
}

export function ReviewSummaryTable({ reviews = [] }: ReviewSummaryTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const totalPages = Math.ceil(reviews.length / pageSize)

  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, reviews.length)
  const currentReviews = reviews.slice(startIndex, endIndex)

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  if (!reviews || reviews.length === 0) {
    return <div className="text-center text-gray-500">No reviews to display</div>
  }

  const getSentimentIcon = (sentiment: "positive" | "neutral" | "negative") => {
    const iconClass = "w-10 h-10" // Increased size from w-5 h-5
    switch (sentiment) {
      case "positive":
        return <CheckCircle className={`${iconClass} text-green-500`} />
      case "neutral":
        return <AlertCircle className={`${iconClass} text-orange-500`} />
      case "negative":
        return <XCircle className={`${iconClass} text-red-500`} />
      default:
        return <AlertCircle className={`${iconClass} text-gray-500`} />
    }
  }

  const generateUniqueResponse = (review: Review, index: number) => {
    const sentiment = review.sentiment
    const strengths = review.strengths || []
    const weaknesses = review.weaknesses || []
    const keywords = review.keywords || []
    const score = review.score || 0

    // Create different response templates based on sentiment and review content
    const positiveTemplates = [
      `Thank you for your wonderful feedback! ${strengths.length > 0 ? `We're thrilled that you appreciated our ${strengths.join(" and ")}.` : ""} ${keywords.length > 0 ? `Your mention of ${keywords[0]} really made our day.` : ""} We hope to welcome you back soon!`,

      `We're delighted to hear about your positive experience! ${strengths.length > 0 ? `It's great to know that our ${strengths[0]} met your expectations.` : ""} ${keywords.length > 0 ? `We particularly value your comments about ${keywords[0]}.` : ""} Thank you for taking the time to share your thoughts.`,

      `Your glowing review means a lot to us! ${strengths.length > 0 ? `We take pride in our ${strengths.join(" and ")}.` : ""} ${keywords.length > 0 ? `We're especially happy that you highlighted our ${keywords[0]}.` : ""} We look forward to serving you again in the future.`,

      `We're so grateful for your kind words! ${strengths.length > 0 ? `Your appreciation of our ${strengths[0]} is exactly what we strive for.` : ""} ${keywords.length > 0 ? `Your comments about ${keywords[0]} are particularly encouraging.` : ""} Thank you for your support!`,

      `Thank you for this fantastic review! ${strengths.length > 0 ? `We're pleased that you enjoyed our ${strengths.join(" and ")}.` : ""} ${keywords.length > 0 ? `Your mention of ${keywords[0]} highlights exactly what we aim to deliver.` : ""} We hope to exceed your expectations again soon.`,
    ]

    const neutralTemplates = [
      `Thank you for sharing your feedback. ${strengths.length > 0 ? `We're glad you appreciated our ${strengths[0]}.` : ""} ${weaknesses.length > 0 ? `We've noted your comments about ${weaknesses[0]} and will work on improvements.` : ""} We value your balanced perspective and hope to serve you better next time.`,

      `We appreciate your honest review. ${strengths.length > 0 ? `It's good to know that our ${strengths[0]} met your expectations.` : ""} ${weaknesses.length > 0 ? `Your feedback regarding ${weaknesses[0]} has been shared with our team.` : ""} Thank you for helping us improve.`,

      `Thank you for taking the time to share your experience. ${strengths.length > 0 ? `We're pleased that you liked our ${strengths[0]}.` : ""} ${weaknesses.length > 0 ? `We understand your concerns about ${weaknesses[0]} and are working to address them.` : ""} We hope to make your next experience with us even better.`,

      `We value your feedback and insights. ${strengths.length > 0 ? `We're happy that our ${strengths[0]} stood out to you.` : ""} ${weaknesses.length > 0 ? `Your comments about ${weaknesses[0]} are helpful for our continuous improvement efforts.` : ""} Please don't hesitate to reach out if you have any other suggestions.`,

      `Thank you for your review. ${strengths.length > 0 ? `We're glad that you noticed our ${strengths[0]}.` : ""} ${weaknesses.length > 0 ? `We take your feedback about ${weaknesses[0]} seriously and are looking into it.` : ""} We appreciate your candid assessment and hope to better meet your expectations in the future.`,
    ]

    const negativeTemplates = [
      `We're truly sorry to hear about your disappointing experience. ${weaknesses.length > 0 ? `Your feedback about ${weaknesses.join(" and ")} is valuable to us.` : ""} We would like to make things right - please contact our customer service team at support@example.com so we can address your concerns personally.`,

      `We apologize that we didn't meet your expectations. ${weaknesses.length > 0 ? `We take your comments about ${weaknesses[0]} very seriously.` : ""} We'd appreciate the opportunity to discuss this further and find a solution. Please reach out to our manager at manager@example.com.`,

      `Thank you for bringing these issues to our attention. ${weaknesses.length > 0 ? `We're sorry about the problems you experienced with ${weaknesses.join(" and ")}.` : ""} We're committed to improving and would value the chance to make this right for you. Please contact us directly at feedback@example.com.`,

      `We sincerely apologize for your negative experience. ${weaknesses.length > 0 ? `Your concerns regarding ${weaknesses[0]} have been shared with our leadership team.` : ""} We hold ourselves to higher standards and would like to learn more about what happened. Please contact us at customercare@example.com.`,

      `We're disappointed to hear that we fell short of your expectations. ${weaknesses.length > 0 ? `We appreciate your honest feedback about ${weaknesses[0]}.` : ""} We're taking immediate steps to address these issues and would welcome the opportunity to regain your trust. Please reach out to us at resolution@example.com.`,
    ]

    // Select template based on sentiment and ensure variety
    let templates
    if (sentiment === "positive") {
      templates = positiveTemplates
    } else if (sentiment === "neutral") {
      templates = neutralTemplates
    } else {
      templates = negativeTemplates
    }

    // Use the review index to select different templates for variety
    const templateIndex = index % templates.length
    return templates[templateIndex]
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Summary of Reviews</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/3">Review</TableHead>
            <TableHead className="w-1/6">Strengths</TableHead>
            <TableHead className="w-1/6">Keywords</TableHead>
            <TableHead className="w-1/3">Recommended Response</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentReviews.map((review, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">{getSentimentIcon(review.sentiment || "neutral")}</div>
                  <div className="flex-grow">{review.text}</div>
                </div>
              </TableCell>
              <TableCell>
                {review.strengths?.map((strength, i) => (
                  <Badge key={i} variant="outline" className="mr-1 mb-1">
                    {strength}
                  </Badge>
                )) || "No strengths identified"}
              </TableCell>
              <TableCell>
                {review.keywords?.length > 0 ? (
                  review.keywords.map((keyword, i) => (
                    <Badge key={i} variant="secondary" className="mr-1 mb-1">
                      {keyword}
                    </Badge>
                  ))
                ) : (
                  <span className="text-gray-400">No keywords</span>
                )}
              </TableCell>
              <TableCell>{generateUniqueResponse(review, startIndex + index)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1}-{endIndex} of {reviews.length} reviews
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={goToPreviousPage} disabled={currentPage === 1}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <div className="flex items-center px-3">
              <span className="text-sm font-medium">
                Page {currentPage} of {totalPages}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={goToNextPage} disabled={currentPage === totalPages}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
