"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getSubscriptionDetails } from "../utils/subscription"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function SubscriptionStatus() {
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchUserAndSubscription() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setLoading(false)
          return
        }

        setUserId(user.id)

        const subscriptionDetails = await getSubscriptionDetails(user.id)
        setSubscription(subscriptionDetails)
      } catch (error) {
        console.error("Error fetching subscription:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndSubscription()
  }, [])

  const handleUpgrade = () => {
    router.push("/subscribe")
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p>Loading subscription information...</p>
        </CardContent>
      </Card>
    )
  }

  if (!userId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p>Please log in to view your subscription.</p>
          <Button onClick={() => router.push("/login")} className="mt-4">
            Log In
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Your Subscription
          {subscription?.isSubscribed && (
            <Badge variant="outline" className={subscription.status === "active" ? "bg-green-100" : "bg-yellow-100"}>
              {subscription.status}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Manage your subscription and billing information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Current Plan</h3>
            <p className="text-lg font-bold">{subscription?.isSubscribed ? "Premium Plan" : "Free Plan"}</p>
          </div>

          {subscription?.isSubscribed && (
            <div>
              <h3 className="font-medium">Next Billing Date</h3>
              <p>{formatDate(subscription.renewalDate)}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {subscription?.isSubscribed ? (
          <Button variant="outline" onClick={() => router.push("/account/billing")}>
            Manage Subscription
          </Button>
        ) : (
          <Button onClick={handleUpgrade}>Upgrade to Premium</Button>
        )}
      </CardFooter>
    </Card>
  )
}
