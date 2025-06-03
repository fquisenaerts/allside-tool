import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

// Simple in-memory cache to reduce database calls
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 30000 // 30 seconds cache

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
    }

    // Check cache first
    const cacheKey = `${userId}-${new Date().toISOString().slice(0, 7)}`
    const cachedData = cache.get(cacheKey)
    const now = Date.now()

    if (cachedData && now - cachedData.timestamp < CACHE_TTL) {
      return NextResponse.json({ success: true, reviewsAnalyzed: cachedData.data })
    }

    // Wrap the Supabase client creation in a try/catch to handle any initialization errors
    let supabase
    try {
      supabase = createAdminClient()
    } catch (adminError: any) {
      console.error("Error creating admin client:", adminError)
      return NextResponse.json(
        { success: false, error: "Database connection error", details: adminError.message },
        { status: 500 },
      )
    }

    const currentMonth = new Date().toISOString().slice(0, 7) // Format: YYYY-MM

    // Get the current month's usage
    try {
      const { data, error } = await supabase
        .from("user_usage")
        .select("reviews_analyzed")
        .eq("user_id", userId)
        .eq("month", currentMonth)
        .maybeSingle()

      if (error) {
        console.error("Error fetching user review usage:", error)

        // If the error is about the table not existing, return 0 instead of an error
        if (error.message.includes("relation") && error.message.includes("does not exist")) {
          console.log("Table doesn't exist yet, returning 0")
          return NextResponse.json({ success: true, reviewsAnalyzed: 0 })
        }

        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }

      // If no record exists for this month, return 0
      const reviewsAnalyzed = data ? data.reviews_analyzed : 0

      // Update cache
      cache.set(cacheKey, { data: reviewsAnalyzed, timestamp: now })

      return NextResponse.json({ success: true, reviewsAnalyzed })
    } catch (queryError: any) {
      console.error("Error executing query:", queryError)
      return NextResponse.json(
        { success: false, error: "Database query error", details: queryError.message },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Error in get-review-usage API:", error)
    return NextResponse.json(
      { success: false, error: error.message || "An unexpected error occurred" },
      { status: 500 },
    )
  }
}
