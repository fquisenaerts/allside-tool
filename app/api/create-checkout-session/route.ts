import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
})

// Initialize Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { priceId, userId, successUrl, cancelUrl } = await req.json()

    // Validate required fields
    if (!priceId) {
      return NextResponse.json({ error: "Price ID is required" }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    console.log(`Creating checkout session with price ID: ${priceId} for user: ${userId}`)

    // Get user email for the customer
    const { data: userData, error: userError } = await supabase.from("users").select("email").eq("id", userId).single()

    if (userError || !userData) {
      console.error("Error fetching user data:", userError)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/payment/cancel`,
      customer_email: userData.email,
      client_reference_id: userId, // This will be available in the webhook
      metadata: {
        userId: userId, // Additional reference to the user
      },
    })

    console.log("Checkout session created:", session.id)

    // Store the checkout session in the database for reference
    const { error: insertError } = await supabase.from("checkout_sessions").insert({
      session_id: session.id,
      user_id: userId,
      price_id: priceId,
      status: "created",
      created_at: new Date().toISOString(),
    })

    if (insertError) {
      console.error("Error storing checkout session:", insertError)
      // Continue anyway as this is just for tracking
    }

    return NextResponse.json({ id: session.id, url: session.url })
  } catch (error: any) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json({ error: error.message || "Error creating checkout session" }, { status: 500 })
  }
}
