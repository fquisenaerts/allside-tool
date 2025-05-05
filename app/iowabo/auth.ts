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

export async function loginBackoffice(email: string, password: string) {
  try {
    const supabase = createClient()

    // Use Supabase auth to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Login error:", error)
      return { success: false, error: error.message }
    }

    if (!data.user) {
      return { success: false, error: "No user returned from login" }
    }

    // Check if user has backoffice access
    const { data: backofficeData, error: backofficeError } = await supabase
      .from("backoffice_users")
      .select("*")
      .eq("user_id", data.user.id)
      .single()

    if (backofficeError || !backofficeData) {
      console.error("Backoffice access error:", backofficeError)
      return { success: false, error: "You do not have backoffice access" }
    }

    return {
      success: true,
      user: data.user,
      backofficeUser: backofficeData,
    }
  } catch (err) {
    console.error("Unexpected error during login:", err)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function registerBackofficeUser(email: string, password: string, name: string, role: string) {
  try {
    const supabase = createClient()

    // Create the user in Supabase Auth
    const { data: userData, error: userError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    })

    if (userError) {
      console.error("User creation error:", userError)
      return { success: false, error: userError.message }
    }

    if (!userData.user) {
      return { success: false, error: "No user was created" }
    }

    // Add the user to the backoffice_users table
    const { error: backofficeError } = await supabase.from("backoffice_users").insert({
      user_id: userData.user.id,
      name,
      email,
      role,
    })

    if (backofficeError) {
      console.error("Backoffice user creation error:", backofficeError)
      // Try to clean up the auth user since we couldn't create the backoffice user
      await supabase.auth.admin.deleteUser(userData.user.id)
      return { success: false, error: backofficeError.message }
    }

    return { success: true, user: userData.user }
  } catch (err) {
    console.error("Unexpected error during registration:", err)
    return { success: false, error: "An unexpected error occurred" }
  }
}
