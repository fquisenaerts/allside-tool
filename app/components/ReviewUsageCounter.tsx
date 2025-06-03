"use client"

import { useState, useEffect, useRef } from "react"
import { Progress } from "@/components/ui/progress"
import type { User } from "@supabase/supabase-js"

interface ReviewUsageCounterProps {
  user: User | null
  userPlan: string
  subscription: any
  refreshTrigger?: number
}

export function ReviewUsageCounter({ user, userPlan, subscription, refreshTrigger = 0 }: ReviewUsageCounterProps) {
  const [reviewsAnalyzed, setReviewsAnalyzed] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use refs to prevent infinite loops
  const isMountedRef = useRef(true)
  const hasLoadedRef = useRef(false)
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const shouldShowCounter = userPlan === "free_trial" || subscription?.status !== "active"

  // Function to fetch review usage data
  const fetchReviewUsage = async (userId: string) => {
    if (!userId || !isMountedRef.current) {
      return 0
    }

    try {
      console.log("Fetching review usage for user:", userId)

      const response = await fetch(`/api/review-usage?userId=${userId}`)

      if (!isMountedRef.current) return 0

      // Check if the response is OK before trying to parse it as JSON
      if (!response.ok) {
        console.error("Error fetching review usage. Status:", response.status)
        return 0
      }

      const data = await response.json()

      if (!isMountedRef.current) return 0

      if (!data.success) {
        console.error("Error fetching review usage:", data.error)
        return 0
      } else {
        console.log("Fetched review usage:", data.reviewsAnalyzed)
        return data.reviewsAnalyzed || 0
      }
    } catch (error) {
      console.error("Error in fetchReviewUsage:", error)
      return 0
    }
  }

  // Initial fetch on mount
  useEffect(() => {
    isMountedRef.current = true
    hasLoadedRef.current = false

    const loadData = async () => {
      if (!shouldShowCounter || !user?.id || hasLoadedRef.current) {
        setIsLoading(false)
        return
      }

      try {
        const reviewCount = await fetchReviewUsage(user.id)

        if (isMountedRef.current) {
          console.log("Setting reviewsAnalyzed state to:", reviewCount)
          setReviewsAnalyzed(reviewCount)
          hasLoadedRef.current = true
        }
      } catch (err) {
        console.error("Error loading review usage:", err)
        if (isMountedRef.current) {
          setError("Failed to load review usage data")
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false)
        }
      }
    }

    // Add a small delay before the initial fetch
    fetchTimeoutRef.current = setTimeout(loadData, 1000)

    return () => {
      isMountedRef.current = false
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current)
      }
    }
  }, [user?.id, shouldShowCounter]) // Only re-run if user ID or shouldShowCounter changes

  // Handle refresh trigger
  useEffect(() => {
    if (refreshTrigger <= 0 || !user || !shouldShowCounter || !isMountedRef.current) {
      return
    }

    const refreshData = async () => {
      try {
        setIsLoading(true)
        const reviewCount = await fetchReviewUsage(user.id)

        if (isMountedRef.current) {
          console.log("Refreshed reviewsAnalyzed state to:", reviewCount)
          setReviewsAnalyzed(reviewCount)
        }
      } catch (err) {
        console.error("Error refreshing review usage:", err)
        if (isMountedRef.current) {
          setError("Failed to refresh review usage data")
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false)
        }
      }
    }

    // Clear any existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current)
    }

    // Set a new timeout with a delay
    fetchTimeoutRef.current = setTimeout(refreshData, 2000)

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current)
      }
    }
  }, [refreshTrigger, user?.id, shouldShowCounter]) // Only re-run if refreshTrigger, user ID, or shouldShowCounter changes

  // Only show for free trial users
  if (!shouldShowCounter) {
    return null
  }

  // Create a skeleton loader that matches the final component's appearance
  if (isLoading) {
    return (
      <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-white font-medium">Monthly Review Usage</h3>
          <div className="w-16 h-6 bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="h-2 mb-2 bg-gray-700 rounded-full animate-pulse"></div>
        <div className="h-4 w-3/4 bg-gray-700 rounded animate-pulse"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <h3 className="text-white font-medium mb-2">Monthly Review Usage</h3>
        <p className="text-red-400 text-sm">Error loading usage data. Please refresh the page.</p>
      </div>
    )
  }

  // If we have the data, render the actual counter
  const reviewCount = reviewsAnalyzed ?? 0
  const percentage = Math.min(100, (reviewCount / 200) * 100)
  const remaining = 200 - reviewCount

  return (
    <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-white font-medium">Monthly Review Usage</h3>
        <span className="text-white font-bold">{reviewCount}/200</span>
      </div>
      <Progress value={percentage} className="h-2 mb-2 bg-gray-700" indicatorClassName="bg-blue-500" />
      <div className="flex justify-between items-center">
        <p className="text-gray-400 text-sm">
          {remaining > 0
            ? `You have ${remaining} reviews remaining this month.`
            : "You've reached your monthly review limit."}
        </p>
        {remaining <= 50 && (
          <span className="text-xs px-2 py-1 bg-yellow-500 text-black rounded-full font-medium">
            {remaining <= 0 ? "Limit reached" : `${remaining} left`}
          </span>
        )}
      </div>
      {remaining <= 0 && (
        <div className="mt-2 text-center">
          <a
            href="https://buy.stripe.com/8wM5kpgmA7na9eU4gg"
            className="text-xs px-3 py-1 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition-colors"
          >
            Upgrade for unlimited reviews
          </a>
        </div>
      )}
    </div>
  )
}
