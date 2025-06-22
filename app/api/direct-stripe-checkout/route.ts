import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    // Get the URL parameters
    const url = new URL(req.url)
    const userId = url.searchParams.get("userId")
    const email = url.searchParams.get("email")

    console.log("Direct checkout request received:", { userId, email, url: req.url })

    // Direct Stripe payment link
    const stripePaymentLink = "https://buy.stripe.com/8wM5kpgmA7na9eU4gg"

    console.log("Redirecting to:", stripePaymentLink)

    // Return a redirect response
    return new Response(null, {
      status: 302,
      headers: {
        Location: stripePaymentLink,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("Error in direct checkout:", error)

    // Return a more detailed error response
    return NextResponse.json(
      {
        error: "Failed to redirect to Stripe",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
