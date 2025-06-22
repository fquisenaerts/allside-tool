"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

interface SubscribeToReportsParams {
  email: string
  frequency: string
  establishmentId?: string
  establishmentUrl: string
  establishmentName?: string
}

export async function subscribeToReports({
  email,
  frequency,
  establishmentId,
  establishmentUrl,
  establishmentName,
}: SubscribeToReportsParams) {
  try {
    // Validate inputs
    if (!email || !establishmentUrl || !frequency) {
      return { success: false, error: "Missing required fields" }
    }

    // Get the current user
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "You must be logged in to subscribe to reports" }
    }

    // Check if subscription already exists
    const { data: existingSubscription } = await supabase
      .from("report_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("establishment_url", establishmentUrl)
      .single()

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
        user_id: user.id,
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
