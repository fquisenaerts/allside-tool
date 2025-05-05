"use server"

import { supabase } from "@/lib/supabase"
import { cookies } from "next/headers"
import { validateBackofficeToken, clearBackofficeToken } from "./auth"
import { createAdminClient } from "@/lib/supabase"

// Function to check if a user is authenticated as a backoffice admin
export async function checkBackofficeAuth() {
  try {
    // First check if the table exists
    const { data: tableCheck, error: tableError } = await supabase.from("backoffice_admins").select("count").limit(1)

    if (tableError) {
      console.error("[SERVER]\nTable check error details:", {
        code: tableError.code,
        message: tableError.message,
        details: tableError.details,
        hint: tableError.hint,
      })

      if (tableError.code === "PGRST116") {
        console.error("[SERVER]\nBackoffice admins table doesn't exist. Please run the SQL script.")
        return { authenticated: false, admin: null, tableExists: false, error: tableError }
      }

      return {
        authenticated: false,
        admin: null,
        tableExists: false,
        error: tableError,
        errorDetails: {
          code: tableError.code,
          message: tableError.message,
          details: tableError.details,
          hint: tableError.hint,
        },
      }
    }

    // Validate the token
    const tokenValidation = await validateBackofficeToken()

    if (!tokenValidation.valid) {
      if (tokenValidation.reason === "invalid_token") {
        console.log("[SERVER]\nNo admin found with the provided token")
        return {
          authenticated: false,
          admin: null,
          tableExists: true,
          error: { message: "Invalid or expired token" },
        }
      }

      if (tokenValidation.reason === "db_error" || tokenValidation.reason === "exception") {
        return {
          authenticated: false,
          admin: null,
          tableExists: true,
          error: tokenValidation.error,
        }
      }

      // No token
      return { authenticated: false, admin: null, tableExists: true }
    }

    // Token is valid
    return { authenticated: true, admin: tokenValidation.admin, tableExists: true }
  } catch (error: any) {
    console.error("[SERVER]\nError checking backoffice auth:", error)
    return {
      authenticated: false,
      admin: null,
      tableExists: true,
      error,
      errorMessage: error.message || "Unknown error",
      errorStack: error.stack,
    }
  }
}

// Function to login to the backoffice
export async function backofficeLogin(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const directLogin = formData.get("directLogin") === "true"

  if (!email || !password) {
    return { success: false, error: "Email and password are required" }
  }

  try {
    // First check if the table exists
    const { data: tableCheck, error: tableError } = await supabase.from("backoffice_admins").select("count").limit(1)

    if (tableError && !directLogin) {
      if (tableError.code === "PGRST116") {
        return {
          success: false,
          error: "The backoffice_admins table doesn't exist. Please run the SQL script in the Supabase SQL Editor.",
          tableExists: false,
        }
      }

      return {
        success: false,
        error: "Error checking table: " + tableError.message,
        errorDetails: tableError,
      }
    }

    // Try with admin client first for better permissions
    const adminClient = createAdminClient()

    // Check if the admin exists with the provided credentials
    const { data: adminData, error: adminError } = await adminClient
      .from("backoffice_admins")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("password", password) // Note: In a real app, you should use hashed passwords

    if (adminError && !directLogin) {
      // Fall back to regular client
      const { data: regularAdminData, error: regularAdminError } = await supabase
        .from("backoffice_admins")
        .select("*")
        .eq("email", email.toLowerCase())
        .eq("password", password)

      if (regularAdminError) {
        return {
          success: false,
          error: "Error checking credentials: " + regularAdminError.message,
          errorDetails: regularAdminError,
        }
      }

      if (!regularAdminData || regularAdminData.length === 0) {
        return { success: false, error: "Invalid credentials" }
      }

      const admin = regularAdminData[0]

      // Generate a token
      const token = crypto.randomUUID()

      // Try to update the admin's token
      const tokenUpdateSuccess = false

      try {
        // Try with API route as a fallback
        const response = await fetch("/api/backoffice-login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        })

        if (response.ok) {
          return { success: true, tableExists: true }
        }
      } catch (apiError) {
        console.error("[SERVER]\nAPI route error:", apiError)
      }

      return {
        success: false,
        error: "Could not update authentication token. Please run the SQL script to fix permissions.",
      }
    }

    if (!adminData || adminData.length === 0) {
      return { success: false, error: "Invalid credentials" }
    }

    const admin = adminData[0]

    // Generate a token
    const token = crypto.randomUUID()

    // Update the admin's token
    const { error: updateError } = await adminClient.from("backoffice_admins").update({ token }).eq("id", admin.id)

    if (updateError) {
      console.error("[SERVER]\nError updating token:", updateError)
      return {
        success: false,
        error: "Could not update authentication token: " + updateError.message,
      }
    }

    // Set the token in a cookie
    cookies().set("backoffice_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // Changed from strict to lax to help with redirects
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    return { success: true, tableExists: true }
  } catch (error: any) {
    console.error("[SERVER]\nError logging in to backoffice:", error)
    return {
      success: false,
      error: "An error occurred during login: " + (error.message || "Unknown error"),
      errorDetails: error,
    }
  }
}

// Function to register a new backoffice admin
export async function backofficeRegister(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string
  const registrationCode = formData.get("registrationCode") as string

  if (!email || !password || !confirmPassword) {
    return { success: false, error: "All fields are required" }
  }

  if (password !== confirmPassword) {
    return { success: false, error: "Passwords do not match" }
  }

  // Check if the registration code is valid
  const validRegistrationCode = "ADMIN123" // Replace with your actual code
  if (registrationCode !== validRegistrationCode) {
    return { success: false, error: "Invalid registration code" }
  }

  try {
    // First check if the table exists
    const { data: tableCheck, error: tableError } = await supabase.from("backoffice_admins").select("count").limit(1)

    if (tableError) {
      if (tableError.code === "PGRST116") {
        return {
          success: false,
          error: "The backoffice_admins table doesn't exist. Please run the SQL script in the Supabase SQL Editor.",
          tableExists: false,
        }
      }

      return {
        success: false,
        error: "Error checking table: " + tableError.message,
        errorDetails: tableError,
      }
    }

    // Use admin client for better permissions
    const adminClient = createAdminClient()

    // Check if the email is already registered
    const { data: existingAdminData, error: checkError } = await adminClient
      .from("backoffice_admins")
      .select("id")
      .eq("email", email.toLowerCase())

    if (checkError) {
      return {
        success: false,
        error: "Error checking existing admin: " + checkError.message,
        errorDetails: checkError,
      }
    }

    if (existingAdminData && existingAdminData.length > 0) {
      return { success: false, error: "Email is already registered" }
    }

    // Generate a token
    const token = crypto.randomUUID()

    // Insert the new admin - UPDATED to include registration_code
    const { error: insertError } = await adminClient.from("backoffice_admins").insert({
      email: email.toLowerCase(),
      password, // Note: In a real app, you should hash the password
      token,
      registration_code: registrationCode, // Add the registration code to the insert
      created_at: new Date().toISOString(),
    })

    if (insertError) {
      return {
        success: false,
        error: "Error creating admin account: " + insertError.message,
        errorDetails: insertError,
      }
    }

    // Set the token in a cookie
    cookies().set("backoffice_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // Changed from strict to lax
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    return { success: true, tableExists: true }
  } catch (error: any) {
    console.error("[SERVER]\nError registering backoffice admin:", error)
    return {
      success: false,
      error: "An error occurred during registration: " + (error.message || JSON.stringify(error)),
      errorDetails: error,
    }
  }
}

// Function to logout from the backoffice
export async function backofficeLogout() {
  return clearBackofficeToken()
}
