"use server"

import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// Type for establishment data
type EstablishmentData = {
  url: string
  userId?: string
  user_id?: string
  name: string
  type: string
  analysisResults?: any
}

// Save establishment with analysis results
export async function saveEstablishment(data: any) {
  try {
    // Ensure we have a user ID (check both userId and user_id fields)
    const userId = data.userId || data.user_id

    if (!userId) {
      console.error("Missing user ID in saveEstablishment:", data)
      return { success: false, error: "Missing user ID" }
    }

    // Ensure we have the required fields
    if (!data.name || !data.url) {
      console.error("Missing required fields in saveEstablishment:", data)
      return { success: false, error: "Missing required fields" }
    }

    console.log("Saving establishment with user ID:", userId)

    // Check if the establishment already exists for this user
    const { data: existingData, error: checkError } = await supabase
      .from("establishments")
      .select("id")
      .eq("url", data.url)
      .eq("user_id", userId)
      .maybeSingle()

    if (checkError) {
      console.error("Error checking for existing establishment:", checkError)
      return { success: false, error: checkError.message }
    }

    // If it exists, update it
    if (existingData) {
      const { error: updateError } = await supabase
        .from("establishments")
        .update({
          name: data.name,
          type: data.type,
          analysis_results: data.analysisResults || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingData.id)

      if (updateError) {
        console.error("Error updating establishment:", updateError)
        return { success: false, error: updateError.message }
      }

      revalidatePath("/my-establishments")
      return { success: true, id: existingData.id, message: "Establishment updated successfully" }
    }

    // Otherwise, insert a new record
    const { data: insertData, error: insertError } = await supabase
      .from("establishments")
      .insert({
        user_id: userId,
        url: data.url,
        name: data.name,
        type: data.type,
        analysis_results: data.analysisResults || null,
        created_at: new Date().toISOString(),
      })
      .select()

    if (insertError) {
      console.error("Error inserting establishment:", insertError)
      return { success: false, error: insertError.message }
    }

    revalidatePath("/my-establishments")
    return { success: true, id: insertData[0].id, message: "Establishment saved successfully" }
  } catch (error: any) {
    console.error("Save establishment error:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}

// Get all establishments for a user
export async function getUserEstablishments(userId: string) {
  try {
    const { data, error } = await supabase
      .from("establishments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching establishments:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error: any) {
    console.error("Get establishments error:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}

// Get a specific establishment with analysis results
export async function getEstablishment(id: string) {
  try {
    const { data, error } = await supabase.from("establishments").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching establishment:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("Get establishment error:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}

// Delete an establishment
export async function deleteEstablishment(id: string, userId: string) {
  try {
    // Verify the establishment belongs to the user
    const { data: establishment, error: fetchError } = await supabase
      .from("establishments")
      .select("user_id")
      .eq("id", id)
      .single()

    if (fetchError) {
      return { success: false, error: fetchError.message }
    }

    if (establishment.user_id !== userId) {
      return { success: false, error: "You don't have permission to delete this establishment" }
    }

    // Delete the establishment
    const { error } = await supabase.from("establishments").delete().eq("id", id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/my-establishments")
    return { success: true }
  } catch (error: any) {
    console.error("Unexpected error deleting establishment:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}
