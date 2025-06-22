import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { invalidateCache } from "../review-usage/route"

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
    }

    const supabase = createAdminClient()
    const currentMonth = new Date().toISOString().slice(0, 7) // Format: YYYY-MM

    // Reset the user's review usage for the current month
    const { error } = await supabase
      .from("user_usage")
      .update({ reviews_analyzed: 0, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("month", currentMonth)

    if (error) {
      console.error("Error resetting user review usage:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Invalidate the cache for this user
    invalidateCache(userId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in reset-review-usage API:", error)
    return NextResponse.json(
      { success: false, error: error.message || "An unexpected error occurred" },
      { status: 500 },
    )
  }
}
