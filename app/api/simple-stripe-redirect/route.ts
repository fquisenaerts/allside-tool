import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    // Use a hardcoded Stripe payment link
    const stripePaymentLink = "https://buy.stripe.com/test_aEU9AFeey3b29eU7ss"

    console.log("Simple redirect to:", stripePaymentLink)

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
    console.error("Error in simple redirect:", error)

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
