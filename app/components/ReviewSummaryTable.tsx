"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Copy,
  Check,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

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
  pageSize?: number
}

export function ReviewSummaryTable({ reviews = [], pageSize = 10 }: ReviewSummaryTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [generatedResponses, setGeneratedResponses] = useState<{ [key: number]: string }>({})
  const [loadingResponses, setLoadingResponses] = useState<{ [key: number]: boolean }>({})
  const [copiedResponses, setCopiedResponses] = useState<{ [key: number]: boolean }>({})

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

  const goToFirstPage = () => {
    setCurrentPage(1)
  }

  const goToLastPage = () => {
    setCurrentPage(totalPages)
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
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

  const handleGenerateResponse = async (reviewIndex: number) => {
    const globalIndex = startIndex + reviewIndex
    setLoadingResponses((prev) => ({ ...prev, [globalIndex]: true }))

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const review = currentReviews[reviewIndex]
    const response = generateUniqueResponse(review, globalIndex)

    setGeneratedResponses((prev) => ({ ...prev, [globalIndex]: response }))
    setLoadingResponses((prev) => ({ ...prev, [globalIndex]: false }))
  }

  const handleCopyResponse = async (reviewIndex: number) => {
    const globalIndex = startIndex + reviewIndex
    const response = generatedResponses[globalIndex]

    if (response) {
      try {
        await navigator.clipboard.writeText(response)
        setCopiedResponses((prev) => ({ ...prev, [globalIndex]: true }))

        // Reset copied state after 2 seconds
        setTimeout(() => {
          setCopiedResponses((prev) => ({ ...prev, [globalIndex]: false }))
        }, 2000)
      } catch (err) {
        console.error("Failed to copy text: ", err)
      }
    }
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show smart pagination
      const start = Math.max(1, currentPage - 2)
      const end = Math.min(totalPages, currentPage + 2)

      if (start > 1) {
        pages.push(1)
        if (start > 2) pages.push("...")
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (end < totalPages) {
        if (end < totalPages - 1) pages.push("...")
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Summary of Reviews</h2>
        <div className="text-sm text-gray-500">Total: {reviews.length} reviews</div>
      </div>

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
          {currentReviews.map((review, index) => {
            const globalIndex = startIndex + index
            const hasGeneratedResponse = generatedResponses[globalIndex]
            const isLoading = loadingResponses[globalIndex]
            const isCopied = copiedResponses[globalIndex]

            return (
              <TableRow key={globalIndex}>
                <TableCell className="font-medium">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">{getSentimentIcon(review.sentiment || "neutral")}</div>
                    <div className="flex-grow">
                      <div className="text-sm text-gray-500 mb-1">Review #{globalIndex + 1}</div>
                      {review.text}
                    </div>
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
                <TableCell>
                  {!hasGeneratedResponse ? (
                    <Button
                      onClick={() => handleGenerateResponse(index)}
                      disabled={isLoading}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Generate Response
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-sm bg-gray-50 p-3 rounded-md border">{hasGeneratedResponse}</div>
                      <Button onClick={() => handleCopyResponse(index)} variant="outline" size="sm" className="w-full">
                        {isCopied ? (
                          <>
                            <Check className="h-4 w-4 mr-2 text-green-600" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Response
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {/* Enhanced Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1}-{endIndex} of {reviews.length} reviews
          </div>

          <div className="flex items-center space-x-2">
            {/* First page button */}
            <Button variant="outline" size="sm" onClick={goToFirstPage} disabled={currentPage === 1} className="px-2">
              <ChevronsLeft className="h-4 w-4" />
            </Button>

            {/* Previous page button */}
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="px-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page numbers */}
            <div className="flex items-center space-x-1">
              {getPageNumbers().map((page, index) => (
                <div key={index}>
                  {page === "..." ? (
                    <span className="px-2 py-1 text-gray-400">...</span>
                  ) : (
                    <Button
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(page as number)}
                      className="px-3 py-1 min-w-[32px]"
                    >
                      {page}
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Next page button */}
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="px-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Last page button */}
            <Button
              variant="outline"
              size="sm"
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
              className="px-2"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Page size info */}
      <div className="text-xs text-gray-400 mt-2 text-center">Showing {pageSize} reviews per page</div>
    </div>
  )
}
