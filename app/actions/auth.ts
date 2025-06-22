"use server"

import { createAdminClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

// Create server-side Supabase client for server actions
function createServerSupabaseClient() {
  const cookieStore = cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // Ignore cookie setting errors in server components
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.set({ name, value: "", ...options })
        } catch (error) {
          // Ignore cookie removal errors in server components
        }
      },
    },
  })
}

// Type for signup data
type SignupData = {
  email: string
  password: string
  firstName: string
  lastName: string
  phone: string // New required field
  company?: string | null // Make company optional and allow null
  plan?: string
}

// Type for login data
type LoginData = {
  email: string
  password: string
}

// Signup function
export async function signup(data: SignupData) {
  const serverSupabase = createServerSupabaseClient()

  // Step 1: Create the user in auth.users
  const { data: authData, error: authError } = await serverSupabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone, // Pass phone number
        company: data.company || null, // Ensure company is null if empty string
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
      phone: data.phone, // Include phone number in public.users table
      company: data.company || null, // Include company in public.users table
    })

    if (insertError) {
      console.error("Error inserting into public.users:", insertError)
      // Continue anyway - the auth user is created
    }
  } catch (insertError) {
    console.error("Exception during public user insert:", insertError)
    // Continue anyway - the auth user is created
  }

  revalidatePath("/")
  return { success: true, user: authData.user }
}

// Login function
export async function login(data: LoginData) {
  const serverSupabase = createServerSupabaseClient()

  const { data: authData, error: authError } = await serverSupabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })

  if (authError) {
    return { success: false, error: authError.message }
  }

  if (!authData.user) {
    return { success: false, error: "Failed to sign in" }
  }

  // Revalidate paths to clear cache
  revalidatePath("/")
  revalidatePath("/analyze")

  // Return success without redirect - let the client handle it
  return { success: true, user: authData.user }
}

// Logout function
export async function logout() {
  const serverSupabase = createServerSupabaseClient()

  // Sign out from Supabase
  const { error } = await serverSupabase.auth.signOut()

  if (error) {
    console.error("Logout error:", error)
    return { success: false, error: error.message }
  }

  // Revalidate paths to clear cache
  revalidatePath("/")
  redirect("/")
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
