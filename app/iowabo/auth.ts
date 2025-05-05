"use server"

import { cookies } from "next/headers"
import { supabase } from "@/lib/supabase"
import { createClient } from "@supabase/supabase-js"

// Create an admin client with service role for better permissions
const adminClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Check if the backoffice_token cookie exists and is valid
export async function validateBackofficeToken() {
  const cookieStore = cookies()
  const backofficeToken = cookieStore.get("backoffice_token")?.value

  if (!backofficeToken) {
    return { valid: false, reason: "no_token" }
  }

  try {
    // First try with admin client for better permissions
    try {
      const { data: adminData, error: adminError } = await adminClient
        .from("backoffice_admins")
        .select("id, email")
        .eq("token", backofficeToken)
        .maybeSingle()

      if (!adminError && adminData) {
        return { valid: true, admin: adminData }
      }

      // Log the error but continue to try regular client
      if (adminError) {
        console.error("[SERVER]\nAdmin client token validation error:", adminError)
      }
    } catch (adminClientError) {
      console.error("[SERVER]\nAdmin client exception:", adminClientError)
    }

    // Fallback to regular client
    const { data, error } = await supabase
      .from("backoffice_admins")
      .select("id, email")
      .eq("token", backofficeToken)
      .maybeSingle()

    if (error) {
      console.error("[SERVER]\nToken validation error:", error)
      return { valid: false, reason: "db_error", error }
    }

    if (!data) {
      console.log("[SERVER]\nNo admin found with the provided token")
      return { valid: false, reason: "invalid_token" }
    }

    return { valid: true, admin: data }
  } catch (error) {
    console.error("[SERVER]\nToken validation exception:", error)
    return { valid: false, reason: "exception", error }
  }
}

// Clear the backoffice token cookie
export async function clearBackofficeToken() {
  cookies().delete("backoffice_token")
  return { success: true }
}
