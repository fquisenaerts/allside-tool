import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

// Initialize Supabase with service role key for admin privileges
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// This is needed to disable the default body parser
export const config = {
  api: {
    bodyParser: false,
  },
}

// Helper to get raw body from request
async function getRawBody(req: NextRequest): Promise<string> {
  const reader = req.body?.getReader()
  if (!reader) {
    throw new Error("Request body is empty")
  }

  const chunks: Uint8Array[] = []

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
  }

  const concatenated = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0))
  let offset = 0
  for (const chunk of chunks) {
    concatenated.set(chunk, offset)
    offset += chunk.length
  }

  return new TextDecoder().decode(concatenated)
}

export async function POST(req: NextRequest) {
  try {
    // Get the raw body
    const rawBody = await getRawBody(req)

    // Get the signature from headers
    const signature = req.headers.get("stripe-signature")

    if (!signature) {
      console.error("Missing stripe-signature header")
      return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 })
    }

    // Verify the event
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!)
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`)
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
    }

    console.log(`Received event: ${event.type}`)

    // Handle the event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session

      // Retrieve the subscription details
      if (!session.subscription) {
        console.error("No subscription found in the session")
        return NextResponse.json({ error: "No subscription found in the session" }, { status: 400 })
      }

      const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription.id

      // Get full subscription details
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)

      // Get customer details
      const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id

      if (!customerId) {
        console.error("No customer found in the session")
        return NextResponse.json({ error: "No customer found in the session" }, { status: 400 })
      }

      const customer = (await stripe.customers.retrieve(customerId)) as Stripe.Customer

      console.log(`Processing subscription for customer: ${customer.email}`)

      // Insert into Supabase
      const { data, error } = await supabaseAdmin.from("subscriptions").insert({
        stripe_subscription_id: subscriptionId,
        stripe_customer_id: customerId,
        email: customer.email,
        status: subscription.status,
        user_id: session.client_reference_id, // If you pass the user ID when creating the checkout session
        price_id: subscription.items.data[0].price.id,
        quantity: subscription.items.data[0].quantity,
        cancel_at_period_end: subscription.cancel_at_period_end,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        created_at: new Date(subscription.created * 1000).toISOString(),
        metadata: subscription.metadata,
      })

      if (error) {
        console.error("Error inserting subscription:", error)
        return NextResponse.json({ error: "Error inserting subscription" }, { status: 500 })
      }

      console.log("Subscription inserted successfully:", data)
    }

    // Return a response to acknowledge receipt of the event
    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: `Webhook error: ${error.message}` }, { status: 500 })
  }
}
