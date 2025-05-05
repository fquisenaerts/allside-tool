import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"
import * as bcrypt from "bcrypt"

// Create a Supabase client with the service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, company, plan } = await request.json()

    // Generate a UUID for the user
    const userId = uuidv4()

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Current timestamp
    const now = new Date().toISOString()

    // Step 1: Try to insert directly into auth.users
    try {
      const { error: authError } = await supabase.rpc("insert_auth_user", {
        p_id: userId,
        p_email: email,
        p_encrypted_password: hashedPassword,
        p_email_confirmed_at: now,
        p_created_at: now,
        p_updated_at: now,
        p_raw_user_meta_data: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          company,
          plan,
          full_name: `${firstName} ${lastName}`,
        }),
      })

      if (authError) {
        console.error("Auth user insertion error:", authError)
        return NextResponse.json(
          {
            success: false,
            error: `Auth user insertion failed: ${authError.message}`,
            details: { authError },
          },
          { status: 500 },
        )
      }
    } catch (authInsertError: any) {
      console.error("Auth user insertion exception:", authInsertError)
      return NextResponse.json(
        {
          success: false,
          error: `Auth user insertion exception: ${authInsertError.message}`,
          details: { authInsertError },
        },
        { status: 500 },
      )
    }

    // Step 2: Insert into public.users
    try {
      const { error: publicError } = await supabase.from("users").insert({
        id: userId,
        email,
        name: `${firstName} ${lastName}`,
        role: "user",
        created_at: now,
      })

      if (publicError) {
        console.error("Public user insertion error:", publicError)
        // Continue anyway - we'll show the error but not block the signup
      }
    } catch (publicInsertError: any) {
      console.error("Public user insertion exception:", publicInsertError)
      // Continue anyway - we'll show the error but not block the signup
    }

    // Return success with the user ID
    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email,
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          company,
          plan,
          full_name: `${firstName} ${lastName}`,
        },
      },
    })
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
