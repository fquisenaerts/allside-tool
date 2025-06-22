"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"
import { useTranslation } from "../hooks/useTranslation"

interface ReviewUsageCounterProps {
  user: any
  userPlan: string
  subscription: any
  refreshTrigger: number
  currentUsage: number
}

export function ReviewUsageCounter({
  user,
  userPlan,
  subscription,
  refreshTrigger,
  currentUsage,
}: ReviewUsageCounterProps) {
  const { t } = useTranslation()
  const [reviewsAnalyzed, setReviewsAnalyzed] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isResetting, setIsResetting] = useState(false)

  // Determine the monthly limit based on subscription
  const getMonthlyLimit = () => {
    if (!subscription) return 200 // Free trial default

    if (subscription.status === "trialing") return 200
    if (subscription.plan_id === "standard") return Number.POSITIVE_INFINITY
    if (subscription.plan_id === "custom") return Number.POSITIVE_INFINITY
    return 200
  }

  const monthlyLimit = getMonthlyLimit()
  const isUnlimited = monthlyLimit === Number.POSITIVE_INFINITY

  useEffect(() => {
    setReviewsAnalyzed(currentUsage)
    setIsLoading(false)
  }, [currentUsage, refreshTrigger])

  const resetUsageCounter = async () => {
    if (!user) return

    setIsResetting(true)
    try {
      const response = await fetch("/api/reset-review-usage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      })

      if (response.ok) {
        setReviewsAnalyzed(0)
      }
    } catch (error) {
      console.error("Error resetting usage:", error)
    } finally {
      setIsResetting(false)
    }
  }

  const progressPercentage = isUnlimited ? 0 : Math.min((reviewsAnalyzed / monthlyLimit) * 100, 100)

  return (
    <Card className="mb-6 bg-white/10 border-white/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-lg flex items-center justify-between">
          Monthly Review Usage
          {user && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetUsageCounter}
              disabled={isResetting}
              className="text-white border-white/30 hover:bg-white/10"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {isResetting ? "Resetting..." : "Reset Usage"}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-4 bg-white/20 rounded animate-pulse"></div>
            <div className="h-2 bg-white/20 rounded animate-pulse"></div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-white/80">
              <span>
                {reviewsAnalyzed} {isUnlimited ? "reviews analyzed" : `of ${monthlyLimit} reviews`}
              </span>
              {!isUnlimited && <span>{Math.max(0, monthlyLimit - reviewsAnalyzed)} remaining</span>}
            </div>
            {!isUnlimited && <Progress value={progressPercentage} className="h-2 bg-white/20" />}
            {isUnlimited && <div className="text-sm text-green-400 font-medium">✨ Unlimited reviews available</div>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
