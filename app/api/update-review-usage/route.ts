import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    const { userId, reviewCount } = await request.json()

    if (!userId || !reviewCount || reviewCount <= 0) {
      return NextResponse.json({ success: false, error: "Invalid parameters" }, { status: 400 })
    }

    console.log(`📊 API: Adding ${reviewCount} reviews for user ${userId}`)

    const supabase = createAdminClient()
    const currentMonth = new Date().toISOString().slice(0, 7) // Format: YYYY-MM

    // Check if a record exists for this month
    const { data: existingRecord, error: fetchError } = await supabase
      .from("user_usage")
      .select("id, reviews_analyzed")
      .eq("user_id", userId)
      .eq("month", currentMonth)
      .maybeSingle()

    if (fetchError) {
      console.error("❌ API: Error fetching existing usage record:", fetchError)
      return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 })
    }

    let newTotal
    let result

    if (existingRecord) {
      // ADD to existing record
      newTotal = existingRecord.reviews_analyzed + reviewCount
      console.log(
        `📊 API: Updating existing record. Old: ${existingRecord.reviews_analyzed}, Adding: ${reviewCount}, New total: ${newTotal}`,
      )

      result = await supabase
        .from("user_usage")
        .update({
          reviews_analyzed: newTotal,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingRecord.id)
    } else {
      // Create new record
      newTotal = reviewCount
      console.log(`📊 API: Creating new record with ${reviewCount} reviews`)

      result = await supabase.from("user_usage").insert({
        user_id: userId,
        month: currentMonth,
        reviews_analyzed: newTotal,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }

    if (result.error) {
      console.error("❌ API: Error updating user review usage:", result.error)
      return NextResponse.json({ success: false, error: result.error.message }, { status: 500 })
    }

    console.log(`✅ API: Successfully updated usage. New total: ${newTotal}`)

    return NextResponse.json({
      success: true,
      newTotal,
      added: reviewCount,
      message: `Added ${reviewCount} reviews. New total: ${newTotal}`,
    })
  } catch (error: any) {
    console.error("💥 API: Error in updateReviewUsage:", error)
    return NextResponse.json(
      { success: false, error: error.message || "An unexpected error occurred" },
      { status: 500 },
    )
  }
}
