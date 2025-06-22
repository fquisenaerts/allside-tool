"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

export default function SubscriptionClientPage() {
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchSubscription = async () => {
      setLoading(true)

      // Get current user
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        setLoading(false)
        return
      }

      setUser(session.user)

      // Get subscription data
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (data) {
        setSubscription(data)
      }

      setLoading(false)
    }

    fetchSubscription()
  }, [])

  const handleUpgrade = () => {
    window.location.href = "https://buy.stripe.com/8wM5kpgmA7na9eU4gg"
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-3xl font-bold mb-8">My Subscription</h1>

      {!user ? (
        <Card>
          <CardContent className="pt-6">
            <p>Please log in to view your subscription details.</p>
          </CardContent>
        </Card>
      ) : subscription ? (
        <Card>
          <CardHeader>
            <CardTitle>{subscription.plan_id || "Free Trial"}</CardTitle>
            <CardDescription>
              Status:{" "}
              <span className={`font-medium ${subscription.status === "active" ? "text-green-600" : "text-amber-600"}`}>
                {subscription.status || "inactive"}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Subscription Features</h3>
                <div className="mt-1 grid grid-cols-2 gap-4">
                  {subscription.features ? (
                    <>
                      <div>
                        <p className="text-sm font-medium">Establishments</p>
                        <p className="text-2xl font-bold">{subscription.features.establishments || "Unlimited"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Reviews</p>
                        <p className="text-2xl font-bold">{subscription.features.reviews || "Unlimited"}</p>
                      </div>
                    </>
                  ) : (
                    <p>No feature limits defined</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Subscription Period</h3>
                <div className="mt-1">
                  <p>
                    <span className="font-medium">Started:</span> {formatDate(subscription.current_period_start)}
                  </p>
                  <p>
                    <span className="font-medium">Renews/Expires:</span> {formatDate(subscription.current_period_end)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            {subscription.plan_id === "free_trial" && (
              <Button onClick={handleUpgrade} className="w-full">
                Upgrade to Premium
              </Button>
            )}
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Active Subscription</CardTitle>
            <CardDescription>You don't have an active subscription yet.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Subscribe to our premium plan to unlock all features and analyze unlimited reviews.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleUpgrade} className="w-full">
              Subscribe Now
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
