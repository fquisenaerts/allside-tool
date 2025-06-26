import { getUserReviewUsage } from "@/app/actions/usage"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
  }

  try {
    const result = await getUserReviewUsage(userId)
    if (result.success) {
      return NextResponse.json({ success: true, reviewsAnalyzed: result.reviewsAnalyzed })
    } else {
      // Ensure error message is always a string, even if result.error is not
      const errorMessage = typeof result.error === "string" ? result.error : JSON.stringify(result.error)
      console.error("API Route - getUserReviewUsage failed:", errorMessage)
      return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
    }
  } catch (error: any) {
    console.error("API Route - Uncaught error in GET /api/review-usage:", error)
    // Ensure error message is always a string
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ success: false, error: `Internal Server Error: ${errorMessage}` }, { status: 500 })
  }
}
