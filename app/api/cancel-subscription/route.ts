import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

// Initialize Supabase client with service role for admin access
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: Request) {
  try {
    const { subscriptionId, userId } = await req.json()

    if (!subscriptionId) {
      return NextResponse.json({ error: "Subscription ID is required" }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    console.log(`Canceling subscription ${subscriptionId} for user ${userId}`)

    // Get the subscription from our database to verify ownership
    const { data: subscriptionData, error: fetchError } = await supabaseAdmin
      .from("subscriptions")
      .select("stripe_subscription_id, user_id")
      .eq("id", subscriptionId)
      .single()

    if (fetchError || !subscriptionData) {
      console.error("Error fetching subscription:", fetchError)
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 })
    }

    // Verify that the subscription belongs to the user
    if (subscriptionData.user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Cancel the subscription at the end of the current period
    const stripeSubscription = await stripe.subscriptions.update(subscriptionData.stripe_subscription_id, {
      cancel_at_period_end: true,
    })

    // Update our database
    const { error: updateError } = await supabaseAdmin
      .from("subscriptions")
      .update({
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", subscriptionId)

    if (updateError) {
      console.error("Error updating subscription in database:", updateError)
      // Continue anyway as the Stripe update was successful
    }

    return NextResponse.json({
      success: true,
      message: "Subscription will be canceled at the end of the current billing period",
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
    })
  } catch (error: any) {
    console.error("Error canceling subscription:", error)
    return NextResponse.json(
      { error: error.message || "Error canceling subscription" },
      { status: error.statusCode || 500 },
    )
  }
}
