"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getUserSubscription, getRemainingDays, getSubscriptionLimits } from "@/app/utils/subscriptionUtils"
import { Calendar, CheckCircle } from "lucide-react"

export function UserSubscriptionInfo() {
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSubscription() {
      setLoading(true)
      const sub = await getUserSubscription()
      setSubscription(sub)
      setLoading(false)
    }

    fetchSubscription()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Subscription</CardTitle>
          <CardDescription>You don't have an active subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Upgrade to our Standard Plan to access all features and analyze up to 2000 reviews.
          </p>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => (window.location.href = "https://buy.stripe.com/8wM5kpgmA7na9eU4gg")}
            className="w-full"
          >
            Upgrade to Standard Plan
          </Button>
        </CardFooter>
      </Card>
    )
  }

  const limits = getSubscriptionLimits(subscription)
  const remainingDays = getRemainingDays(subscription)

  const getStatusBadge = () => {
    switch (subscription.status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "trialing":
        return <Badge className="bg-blue-100 text-blue-800">Trial</Badge>
      case "canceled":
        return <Badge className="bg-red-100 text-red-800">Canceled</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{subscription.status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Your Subscription</CardTitle>
          {getStatusBadge()}
        </div>
        <CardDescription>
          {subscription.plan_id === "standard"
            ? "Standard Plan"
            : subscription.plan_id === "free_trial"
              ? "Free Trial"
              : subscription.plan_id}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {subscription.status === "trialing" && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Trial Period</span>
              <span>{remainingDays} days remaining</span>
            </div>
            <Progress value={((14 - remainingDays) / 14) * 100} className="h-2" />
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
            {subscription.status === "active" ? (
              <span className="text-sm">
                Next billing date: {new Date(subscription.current_period_end).toLocaleDateString()}
              </span>
            ) : subscription.status === "trialing" ? (
              <span className="text-sm">Trial ends: {new Date(subscription.trial_end).toLocaleDateString()}</span>
            ) : (
              <span className="text-sm">
                Subscription ended:{" "}
                {new Date(subscription.canceled_at || subscription.current_period_end).toLocaleDateString()}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              <span>{limits.establishments} establishment</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              <span>Up to {limits.reviews} reviews</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              <span>Sentiment analysis</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              <span>Keyword extraction</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              <span>ENPS calculation</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              <span>Response generation</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {subscription.status === "active" ? (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => (window.location.href = "https://buy.stripe.com/8wM5kpgmA7na9eU4gg")}
          >
            Manage Subscription
          </Button>
        ) : subscription.status === "trialing" ? (
          <Button
            className="w-full"
            onClick={() => (window.location.href = "https://buy.stripe.com/8wM5kpgmA7na9eU4gg")}
          >
            Upgrade to Standard Plan
          </Button>
        ) : (
          <Button
            className="w-full"
            onClick={() => (window.location.href = "https://buy.stripe.com/8wM5kpgmA7na9eU4gg")}
          >
            Reactivate Subscription
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
