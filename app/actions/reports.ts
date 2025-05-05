"use server"

import { supabase } from "@/lib/supabase"

interface SubscribeToReportsParams {
  userId: string
  email: string
  frequency: string
  establishmentId?: string
  establishmentUrl: string
  establishmentName?: string
}

export async function subscribeToReports({
  userId,
  email,
  frequency,
  establishmentId,
  establishmentUrl,
  establishmentName,
}: SubscribeToReportsParams) {
  try {
    // Validate inputs
    if (!userId || !email || !frequency || !establishmentUrl) {
      return { success: false, error: "Missing required fields" }
    }

    // Check if user already has a subscription for this establishment
    const { data: existingSubscription, error: fetchError } = await supabase
      .from("report_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("establishment_url", establishmentUrl)
      .single()

    if (fetchError && fetchError.code !== "PGSQL_ERROR_NO_ROWS") {
      console.error("Error checking for existing subscription:", fetchError)
      return { success: false, error: "Failed to check for existing subscription" }
    }

    if (existingSubscription) {
      // Update existing subscription
      const { error: updateError } = await supabase
        .from("report_subscriptions")
        .update({
          email,
          frequency,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingSubscription.id)

      if (updateError) {
        console.error("Error updating subscription:", updateError)
        return { success: false, error: "Failed to update subscription" }
      }

      return { success: true }
    } else {
      // Create new subscription
      const { error: insertError } = await supabase.from("report_subscriptions").insert({
        user_id: userId,
        email,
        frequency,
        establishment_id: establishmentId,
        establishment_url: establishmentUrl,
        establishment_name: establishmentName || "Unnamed Establishment",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (insertError) {
        console.error("Error creating subscription:", insertError)
        return { success: false, error: "Failed to create subscription" }
      }

      return { success: true }
    }
  } catch (error) {
    console.error("Error in subscribeToReports:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
