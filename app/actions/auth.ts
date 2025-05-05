"use server"

import { createAdminClient, supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// Type for signup data
type SignupData = {
  email: string
  password: string
  firstName: string
  lastName: string
  company?: string
  plan?: string
}

// Type for login data
type LoginData = {
  email: string
  password: string
}

// Signup function
export async function signup(data: SignupData) {
  try {
    // Step 1: Create the user in auth.users
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          company: data.company,
          plan: data.plan,
          name: `${data.firstName} ${data.lastName}`,
          full_name: `${data.firstName} ${data.lastName}`,
        },
      },
    })

    if (authError) {
      return { success: false, error: authError.message }
    }

    if (!authData.user) {
      return { success: false, error: "Failed to create user" }
    }

    // Step 2: Manually insert into public.users table as a fallback
    try {
      const adminClient = createAdminClient()
      const { error: insertError } = await adminClient.from("users").insert({
        id: authData.user.id,
        email: data.email,
        name: `${data.firstName} ${data.lastName}`,
        full_name: `${data.firstName} ${data.lastName}`,
        role: "user",
        created_at: new Date().toISOString(),
      })

      if (insertError) {
        console.error("Error inserting into public.users:", insertError)
        // Continue anyway - the auth user is created
      }
    } catch (insertError) {
      console.error("Exception during public user insert:", insertError)
      // Continue anyway - the auth user is created
    }

    return { success: true, user: authData.user }
  } catch (error: any) {
    console.error("Signup error:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}

// Login function
export async function login(data: LoginData) {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (authError) {
      return { success: false, error: authError.message }
    }

    if (!authData.user) {
      return { success: false, error: "Failed to sign in" }
    }

    return { success: true, user: authData.user }
  } catch (error: any) {
    console.error("Login error:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}

// Logout function
export async function logout() {
  await supabase.auth.signOut()
  revalidatePath("/")
  redirect("/login")
}

// Set user on free trial
export async function setUserOnFreeTrial(userId: string) {
  if (!userId) return { success: false, error: "No user ID provided" }

  try {
    const adminClient = createAdminClient()
    // Create a subscription record
    const { error } = await adminClient.from("subscriptions").insert({
      user_id: userId,
      status: "trialing",
      plan_id: "free_trial",
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
      trial_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      features: {
        establishments: 1,
        reviews: 200,
        sentiment_analysis: true,
        keywords: true,
        enps: true,
        response_generation: true,
        csv_export: true,
      },
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error setting user on free trial:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}
