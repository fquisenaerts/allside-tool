import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { supabase } from "@/lib/supabase"

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

// This is your Stripe webhook secret for verifying events
const endpointSecret = "whsec_P1xirGogbH77d6LWfvotcYvGPxLf5sqs"

export async function POST(req: NextRequest) {
  const payload = await req.text()
  const signature = req.headers.get("stripe-signature") || ""

  let event: Stripe.Event

  try {
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(payload, signature, endpointSecret)
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  // Handle the event
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        console.log("Checkout session completed:", session.id)

        // Get customer email from the session
        const customerEmail = session.customer_details?.email
        if (!customerEmail) {
          console.error("No customer email found in session")
          return NextResponse.json({ error: "No customer email found" }, { status: 400 })
        }

        // Find the user by email
        const { data: userData, error: userError } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", customerEmail)
          .single()

        if (userError || !userData) {
          console.error("User not found:", customerEmail)
          return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const userId = userData.id

        // Get subscription details from Stripe if available
        let subscriptionData = null
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          subscriptionData = {
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          }
        }

        // Create or update subscription in database
        const { error: subscriptionError } = await supabase.from("subscriptions").upsert({
          user_id: userId,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          plan_id: "standard", // Default to standard plan
          status: subscriptionData?.status || "active",
          current_period_start: subscriptionData?.current_period_start || new Date().toISOString(),
          current_period_end:
            subscriptionData?.current_period_end || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          cancel_at_period_end: subscriptionData?.cancel_at_period_end || false,
          features: {
            establishments: 5,
            reviews: 2000,
            sentiment_analysis: true,
            keywords: true,
            enps: true,
            response_generation: true,
            csv_export: true,
          },
        })

        if (subscriptionError) {
          console.error("Error updating subscription:", subscriptionError)
          return NextResponse.json({ error: "Error updating subscription" }, { status: 500 })
        }

        console.log(`Subscription created for user ${userId}`)
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        console.log("Subscription updated:", subscription.id)

        // Find the subscription in our database
        const { data: subData, error: subError } = await supabase
          .from("subscriptions")
          .select("id, user_id")
          .eq("stripe_subscription_id", subscription.id)
          .single()

        if (subError || !subData) {
          console.error("Subscription not found:", subscription.id)
          return NextResponse.json({ error: "Subscription not found" }, { status: 404 })
        }

        // Update subscription in database
        const { error: updateError } = await supabase
          .from("subscriptions")
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          })
          .eq("id", subData.id)

        if (updateError) {
          console.error("Error updating subscription:", updateError)
          return NextResponse.json({ error: "Error updating subscription" }, { status: 500 })
        }

        console.log(`Subscription updated for user ${subData.user_id}`)
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        console.log("Subscription deleted:", subscription.id)

        // Find the subscription in our database
        const { data: subData, error: subError } = await supabase
          .from("subscriptions")
          .select("id, user_id")
          .eq("stripe_subscription_id", subscription.id)
          .single()

        if (subError || !subData) {
          console.error("Subscription not found:", subscription.id)
          return NextResponse.json({ error: "Subscription not found" }, { status: 404 })
        }

        // Update subscription in database
        const { error: updateError } = await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
            canceled_at: new Date().toISOString(),
          })
          .eq("id", subData.id)

        if (updateError) {
          console.error("Error updating subscription:", updateError)
          return NextResponse.json({ error: "Error updating subscription" }, { status: 500 })
        }

        console.log(`Subscription canceled for user ${subData.user_id}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: "Error processing webhook" }, { status: 500 })
  }
}
