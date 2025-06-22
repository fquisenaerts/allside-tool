"use server"

import { createAdminClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// Check if the user_usage table exists
export async function checkUserUsageTable() {
  try {
    const supabase = createAdminClient()

    // Check if the table exists
    const { data, error } = await supabase.from("user_usage").select("id").limit(1)

    if (error && error.code === "42P01") {
      // Table doesn't exist, create it
      console.log("user_usage table doesn't exist, creating it...")
      await createUserUsageTable()
      return { success: true, created: true }
    } else if (error) {
      console.error("Error checking user_usage table:", error)
      return { success: false, error: error.message }
    }

    return { success: true, exists: true }
  } catch (error: any) {
    console.error("Error in checkUserUsageTable:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}

// Create the user_usage table if it doesn't exist
async function createUserUsageTable() {
  try {
    const supabase = createAdminClient()

    // Execute SQL to create the table
    const { error } = await supabase.rpc("create_user_usage_table")

    if (error) {
      console.error("Error creating user_usage table:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error in createUserUsageTable:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}

// Get the current month's review usage for a user
export async function getUserReviewUsage(userId: string) {
  if (!userId) return { success: false, error: "User ID is required" }

  try {
    const supabase = createAdminClient()
    const currentMonth = new Date().toISOString().slice(0, 7) // Format: YYYY-MM

    // Get the current month's usage
    const { data, error } = await supabase
      .from("user_usage")
      .select("reviews_analyzed")
      .eq("user_id", userId)
      .eq("month", currentMonth)
      .maybeSingle()

    if (error) {
      console.error("Error fetching user review usage:", error)
      return { success: false, error: error.message }
    }

    // If no record exists for this month, return 0
    const reviewsAnalyzed = data ? data.reviews_analyzed : 0

    return { success: true, reviewsAnalyzed }
  } catch (error: any) {
    console.error("Error in getUserReviewUsage:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}

// Update the user's review usage
export async function updateUserReviewUsage(userId: string, newReviewCount: number) {
  if (!userId) return { success: false, error: "User ID is required" }

  try {
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
      console.error("Error fetching existing usage record:", fetchError)
      return { success: false, error: fetchError.message }
    }

    let result
    if (existingRecord) {
      // Update existing record
      const newTotal = existingRecord.reviews_analyzed + newReviewCount
      result = await supabase
        .from("user_usage")
        .update({ reviews_analyzed: newTotal, updated_at: new Date().toISOString() })
        .eq("id", existingRecord.id)
    } else {
      // Create new record
      result = await supabase.from("user_usage").insert({
        user_id: userId,
        month: currentMonth,
        reviews_analyzed: newReviewCount,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }

    if (result.error) {
      console.error("Error updating user review usage:", result.error)
      return { success: false, error: result.error.message }
    }

    revalidatePath("/analyze")
    return { success: true }
  } catch (error: any) {
    console.error("Error in updateUserReviewUsage:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}
