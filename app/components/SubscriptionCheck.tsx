"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Lock } from "lucide-react"

interface SubscriptionCheckProps {
  requiredPlan?: string
  requiredFeature?: string
  children: React.ReactNode
}

export function SubscriptionCheck({ requiredPlan = "standard", requiredFeature, children }: SubscriptionCheckProps) {
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkSubscription()
  }, [])

  const checkSubscription = async () => {
    setLoading(true)
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setHasAccess(false)
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

      if (error) {
        console.error("Error fetching subscription:", error)
        setHasAccess(false)
        return
      }

      setSubscription(subscriptionData)

      // Check if user has access based on plan and feature
      if (subscriptionData) {
        // Check if subscription is active or in trial
        const isActiveOrTrial = ["active", "trialing"].includes(subscriptionData.status)

        // Check plan level
        const hasPlanAccess =
          subscriptionData.plan_id === requiredPlan ||
          subscriptionData.plan_id === "custom" ||
          (requiredPlan === "free_trial" && isActiveOrTrial)

        // Check feature access if specified
        let hasFeatureAccess = true
        if (requiredFeature && subscriptionData.features) {
          hasFeatureAccess = !!subscriptionData.features[requiredFeature]
        }

        setHasAccess(isActiveOrTrial && hasPlanAccess && hasFeatureAccess)
      } else {
        setHasAccess(false)
      }
    } catch (error) {
      console.error("Error checking subscription:", error)
      setHasAccess(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-4 text-center">Checking subscription...</div>
  }

  if (!hasAccess) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lock className="mr-2 h-5 w-5 text-red-500" />
            Feature Not Available
          </CardTitle>
          <CardDescription>
            This feature requires a {requiredPlan === "standard" ? "Standard" : "Premium"} subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-4">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <p className="text-sm">
                {requiredFeature
                  ? `Access to ${requiredFeature} requires an upgrade to continue.`
                  : "You need to upgrade your subscription to access this feature."}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                The Standard plan includes 1 establishment record, up to 2000 reviews, sentiment analysis, keywords,
                ENPS, and more.
              </p>
            </div>
          </div>
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

  return <>{children}</>
}
