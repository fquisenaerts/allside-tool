import { NextResponse } from "next/server"
import Stripe from "stripe"
import { supabase } from "@/lib/supabase"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export async function GET(req: Request) {
  const url = new URL(req.url)
  const sessionId = url.searchParams.get("session_id")

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
  }

  try {
    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 })
    }

    // Update the checkout session in our database
    await supabase
      .from("checkout_sessions")
      .update({
        status: session.status,
        completed_at: new Date().toISOString(),
      })
      .eq("session_id", sessionId)

    return NextResponse.json({
      success: true,
      status: session.status,
      customer: session.customer,
      subscription: session.subscription,
    })
  } catch (error: any) {
    console.error("Error verifying payment:", error)
    return NextResponse.json({ error: error.message || "Error verifying payment" }, { status: 500 })
  }
}
