import { NextResponse } from "next/server"
import Stripe from "stripe"

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export async function GET(req: Request) {
  try {
    console.log("Creating test checkout session...")

    // Get the price ID from environment variables
    const priceId = process.env.STRIPE_STANDARD_PRICE_ID

    if (!priceId) {
      console.error("Price ID not found in environment variables")
      return NextResponse.json({ error: "Price ID not configured" }, { status: 500 })
    }

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: "test@example.com",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/payment/cancel`,
    })

    console.log("Test checkout session created:", session.id)

    // Redirect directly to the checkout URL
    return NextResponse.redirect(session.url!)
  } catch (error: any) {
    console.error("Error creating test checkout session:", error)
    return NextResponse.json({ error: error.message || "Error creating test checkout session" }, { status: 500 })
  }
}
