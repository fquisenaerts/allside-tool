import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function getUserSubscription(userId: string) {
  if (!userId) return null

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    console.error("Error fetching subscription:", error)
    return null
  }

  return data
}

export async function isUserSubscribed(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId)
  return !!subscription
}

export async function getSubscriptionDetails(userId: string) {
  const subscription = await getUserSubscription(userId)

  if (!subscription) {
    return {
      isSubscribed: false,
      plan: "free",
      renewalDate: null,
      status: "inactive",
    }
  }

  return {
    isSubscribed: true,
    plan: subscription.price_id,
    renewalDate: subscription.current_period_end,
    status: subscription.status,
  }
}
