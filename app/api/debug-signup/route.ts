import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase client with the service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, company, plan } = await request.json()

    // Step 1: Try to create the user with admin API
    console.log("Attempting to create user with admin API...")
    const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        company,
        plan,
        full_name: `${firstName} ${lastName}`,
      },
    })

    if (adminError) {
      console.error("Admin API error:", adminError)

      // Step 2: If admin API fails, try the regular signup
      console.log("Attempting regular signup...")
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            company,
            plan,
            full_name: `${firstName} ${lastName}`,
          },
        },
      })

      if (signupError) {
        console.error("Regular signup error:", signupError)
        return NextResponse.json(
          {
            success: false,
            error: signupError.message,
            details: {
              adminError,
              signupError,
            },
          },
          { status: 500 },
        )
      }

      // If regular signup works, try to insert into users table
      if (signupData.user) {
        try {
          const { error: insertError } = await supabase.from("users").insert({
            id: signupData.user.id,
            email,
            name: `${firstName} ${lastName}`,
            role: "user",
          })

          if (insertError) {
            console.error("Insert error:", insertError)
          }
        } catch (insertError) {
          console.error("Insert exception:", insertError)
        }

        return NextResponse.json({
          success: true,
          user: signupData.user,
          method: "regular_signup",
        })
      }
    }

    // If admin API works, try to insert into users table
    if (adminData?.user) {
      try {
        const { error: insertError } = await supabase.from("users").insert({
          id: adminData.user.id,
          email,
          name: `${firstName} ${lastName}`,
          role: "user",
        })

        if (insertError) {
          console.error("Insert error:", insertError)
        }
      } catch (insertError) {
        console.error("Insert exception:", insertError)
      }

      return NextResponse.json({
        success: true,
        user: adminData.user,
        method: "admin_api",
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create user with both methods",
        details: { adminError },
      },
      { status: 500 },
    )
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An unexpected error occurred",
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
