import { supabase } from "@/lib/supabase"

export interface SubscriptionFeatures {
  establishments: number
  reviews: number
  sentiment_analysis: boolean
  keywords: boolean
  enps: boolean
  response_generation: boolean
  csv_export: boolean
}

export interface Subscription {
  id: string
  user_id: string
  stripe_subscription_id?: string
  stripe_customer_id?: string
  status: "active" | "trialing" | "canceled" | "incomplete" | "past_due"
  plan_id: string
  current_period_start?: string
  current_period_end?: string
  cancel_at_period_end: boolean
  canceled_at?: string
  trial_start?: string
  trial_end?: string
  features: SubscriptionFeatures
  created_at: string
  updated_at: string
}

export async function getUserSubscription(userId?: string): Promise<Subscription | null> {
  if (!userId) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null
    userId = user.id
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (error || !data) return null
  return data as Subscription
}

export function hasFeatureAccess(subscription: Subscription | null, feature: keyof SubscriptionFeatures): boolean {
  if (!subscription) return false

  // Check if subscription is active or in trial
  const isActiveOrTrial = ["active", "trialing"].includes(subscription.status)
  if (!isActiveOrTrial) return false

  // Check if the feature is enabled
  return !!subscription.features?.[feature]
}

export function getSubscriptionLimits(subscription: Subscription | null): SubscriptionFeatures {
  if (!subscription) {
    // Default limits for no subscription
    return {
      establishments: 0,
      reviews: 0,
      sentiment_analysis: false,
      keywords: false,
      enps: false,
      response_generation: false,
      csv_export: false,
    }
  }

  return (
    subscription.features || {
      establishments: 0,
      reviews: 0,
      sentiment_analysis: false,
      keywords: false,
      enps: false,
      response_generation: false,
      csv_export: false,
    }
  )
}

export function getRemainingDays(subscription: Subscription | null): number {
  if (!subscription) return 0

  let endDate: string | undefined

  if (subscription.status === "trialing") {
    endDate = subscription.trial_end
  } else if (subscription.status === "active") {
    endDate = subscription.current_period_end
  }

  if (!endDate) return 0

  const end = new Date(endDate)
  const now = new Date()
  const diffTime = end.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return Math.max(0, diffDays)
}
