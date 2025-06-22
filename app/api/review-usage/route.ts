import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

// Cache for review usage data to avoid frequent database queries
const usageCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 60 * 1000 // 1 minute cache

export function invalidateCache(userId: string) {
  usageCache.delete(userId)
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
    }

    // Check cache first
    const cachedData = usageCache.get(userId)
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      console.log("📊 Returning cached review usage data for user:", userId)
      return NextResponse.json({ success: true, ...cachedData.data })
    }

    console.log("📊 Fetching fresh review usage data for user:", userId)

    try {
      const supabase = createAdminClient()
      const currentMonth = new Date().toISOString().slice(0, 7) // Format: YYYY-MM

      console.log("📊 Querying user_usage table for month:", currentMonth)

      // Get the current month's usage
      const { data, error } = await supabase
        .from("user_usage")
        .select("reviews_analyzed")
        .eq("user_id", userId)
        .eq("month", currentMonth)
        .maybeSingle()

      if (error) {
        console.error("❌ Database error fetching user review usage:", error)
        // Return 0 instead of failing completely
        return NextResponse.json({ success: true, reviewsAnalyzed: 0 })
      }

      // If no record exists for this month, return 0
      const reviewsAnalyzed = data ? data.reviews_analyzed : 0

      console.log("✅ Found review usage data:", { data, reviewsAnalyzed })

      // Update cache
      usageCache.set(userId, {
        data: { reviewsAnalyzed },
        timestamp: Date.now(),
      })

      return NextResponse.json({ success: true, reviewsAnalyzed })
    } catch (dbError: any) {
      console.error("💥 Database connection error:", dbError)
      // Return 0 instead of failing completely
      return NextResponse.json({ success: true, reviewsAnalyzed: 0 })
    }
  } catch (error: any) {
    console.error("💥 Error in get-review-usage API:", error)
    return NextResponse.json(
      { success: false, error: error.message || "An unexpected error occurred" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  // Redirect POST requests to the update-review-usage endpoint
  try {
    const body = await request.json()

    const response = await fetch(new URL("/api/update-review-usage", request.url).toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    return response
  } catch (error) {
    console.error("Error in POST review-usage:", error)
    return NextResponse.json({ success: false, error: "Failed to process request" }, { status: 500 })
  }
}
