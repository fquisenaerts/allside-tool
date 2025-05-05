import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 })
    }

    // Create a Supabase admin client with service role for better permissions
    const adminClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Create a regular Supabase client as fallback
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

    // First try with admin client
    let adminData
    let tokenUpdateSuccess = false
    let admin

    try {
      const { data, error } = await adminClient
        .from("backoffice_admins")
        .select("*")
        .eq("email", email.toLowerCase())
        .eq("password", password)

      if (!error && data && data.length > 0) {
        adminData = data
        admin = data[0]
      }
    } catch (error) {
      console.error("API: Admin client error:", error)
    }

    // Fallback to regular client if admin client failed
    if (!adminData) {
      const { data, error } = await supabase
        .from("backoffice_admins")
        .select("*")
        .eq("email", email.toLowerCase())
        .eq("password", password)

      if (error) {
        console.error("API: Error checking credentials:", error)
        return NextResponse.json(
          { success: false, error: "Error checking credentials", details: error },
          { status: 500 },
        )
      }

      if (!data || data.length === 0) {
        return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
      }

      admin = data[0]
    }

    // Generate a token
    const token = crypto.randomUUID()

    // Try multiple methods to update the token

    // Method 1: Admin client update (most likely to work)
    try {
      const { error } = await adminClient.from("backoffice_admins").update({ token }).eq("id", admin.id)

      if (!error) {
        tokenUpdateSuccess = true
        console.log("API: Token updated successfully with admin client")
      } else {
        console.error("API: Error updating token with admin client:", error)
      }
    } catch (error) {
      console.error("API: Exception in admin client update:", error)
    }

    // Method 2: Direct update with regular client
    if (!tokenUpdateSuccess) {
      try {
        const { error } = await supabase.from("backoffice_admins").update({ token }).eq("id", admin.id)

        if (!error) {
          tokenUpdateSuccess = true
          console.log("API: Token updated successfully with direct update")
        } else {
          console.error("API: Error updating token with direct update:", error)
        }
      } catch (error) {
        console.error("API: Exception in direct update:", error)
      }
    }

    // Method 3: RPC call
    if (!tokenUpdateSuccess) {
      try {
        const { error } = await supabase.rpc("update_admin_token", {
          admin_id: admin.id,
          new_token: token,
        })

        if (!error) {
          tokenUpdateSuccess = true
          console.log("API: Token updated successfully with RPC")
        } else {
          console.error("API: Error updating token with RPC:", error)
        }
      } catch (error) {
        console.error("API: Exception in RPC update:", error)
      }
    }

    if (!tokenUpdateSuccess) {
      return NextResponse.json({ success: false, error: "Could not update authentication token" }, { status: 500 })
    }

    // Set the token in a cookie with more permissive settings
    cookies().set("backoffice_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // Changed from strict to lax for better compatibility
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    return NextResponse.json({ success: true, admin: { email: admin.email } })
  } catch (error: any) {
    console.error("API: Unexpected error in login:", error)
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred", details: error.message },
      { status: 500 },
    )
  }
}
