import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: Request) {
  try {
    // Get the userId from the query string
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
    }

    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables")
      return NextResponse.json({ success: false, error: "Supabase configuration is missing" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Query the user_usage table for current month
    const currentMonth = new Date().toISOString().slice(0, 7)

    console.log(`Fetching usage for user ${userId} for month ${currentMonth}`)

    const { data, error } = await supabase
      .from("user_usage")
      .select("reviews_analyzed")
      .eq("user_id", userId)
      .eq("month", currentMonth)
      .maybeSingle()

    if (error) {
      console.error("Supabase error fetching review usage:", error)
      // Return 0 instead of error to prevent UI issues
      return NextResponse.json({
        success: true,
        reviewsAnalyzed: 0,
      })
    }

    console.log(`Found usage data:`, data)

    // Return the review usage data
    return NextResponse.json({
      success: true,
      reviewsAnalyzed: data?.reviews_analyzed || 0,
    })
  } catch (error) {
    console.error("Unexpected error in review-usage GET API:", error)
    // Return 0 instead of error to prevent UI issues
    return NextResponse.json({
      success: true,
      reviewsAnalyzed: 0,
    })
  }
}

export async function POST(request: Request) {
  try {
    console.log("POST /api/review-usage called")

    // Parse the request body with error handling
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("Error parsing request body:", parseError)
      return NextResponse.json({ success: false, error: "Invalid JSON in request body" }, { status: 400 })
    }

    console.log("Request body:", body)

    const { userId, reviewCount } = body

    if (!userId || typeof reviewCount !== "number" || reviewCount < 0) {
      console.error("Invalid request parameters:", { userId, reviewCount, type: typeof reviewCount })
      return NextResponse.json(
        {
          success: false,
          error: "User ID is required and review count must be a positive number",
        },
        { status: 400 },
      )
    }

    // Create Supabase client with validation
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase configuration:", {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseServiceKey,
      })
      return NextResponse.json({ success: false, error: "Supabase configuration is missing" }, { status: 500 })
    }

    console.log("Creating Supabase client...")
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const currentMonth = new Date().toISOString().slice(0, 7)
    console.log("Current month:", currentMonth)

    // Use upsert to handle both insert and update in one operation
    const { data, error } = await supabase
      .from("user_usage")
      .upsert(
        {
          user_id: userId,
          month: currentMonth,
          reviews_analyzed: reviewCount,
        },
        {
          onConflict: "user_id,month",
          ignoreDuplicates: false,
        },
      )
      .select()

    if (error) {
      console.error("Error upserting review usage:", error)

      // Try the manual approach as fallback
      try {
        console.log("Trying manual insert/update approach...")

        // Check if record exists
        const { data: existingRecord, error: fetchError } = await supabase
          .from("user_usage")
          .select("reviews_analyzed")
          .eq("user_id", userId)
          .eq("month", currentMonth)
          .maybeSingle()

        if (fetchError) {
          console.error("Error checking existing record:", fetchError)
          return NextResponse.json({ success: false, error: "Failed to check existing usage" }, { status: 500 })
        }

        let newTotal = reviewCount

        if (existingRecord) {
          // Update existing record
          newTotal = existingRecord.reviews_analyzed + reviewCount
          console.log("Updating existing record. Old total:", existingRecord.reviews_analyzed, "New total:", newTotal)

          const { error: updateError } = await supabase
            .from("user_usage")
            .update({ reviews_analyzed: newTotal })
            .eq("user_id", userId)
            .eq("month", currentMonth)

          if (updateError) {
            console.error("Error updating review usage:", updateError)
            return NextResponse.json({ success: false, error: "Failed to update review usage" }, { status: 500 })
          }
        } else {
          // Insert new record
          console.log("Creating new record with total:", reviewCount)

          const { error: insertError } = await supabase.from("user_usage").insert([
            {
              user_id: userId,
              month: currentMonth,
              reviews_analyzed: reviewCount,
            },
          ])

          if (insertError) {
            console.error("Error inserting review usage:", insertError)
            return NextResponse.json({ success: false, error: "Failed to insert review usage" }, { status: 500 })
          }
        }

        console.log("Successfully processed review usage update via fallback method")

        return NextResponse.json({
          success: true,
          message: "Review usage updated successfully",
          newTotal,
        })
      } catch (fallbackError) {
        console.error("Fallback method also failed:", fallbackError)
        return NextResponse.json({ success: false, error: "Failed to update review usage" }, { status: 500 })
      }
    }

    console.log("Successfully processed review usage update via upsert")

    // Return the updated total
    return NextResponse.json({
      success: true,
      message: "Review usage updated successfully",
      newTotal: data?.[0]?.reviews_analyzed || reviewCount,
    })
  } catch (error) {
    console.error("Unexpected error in review-usage API (POST):", error)
    return NextResponse.json({ success: false, error: "An unexpected error occurred" }, { status: 500 })
  }
}
