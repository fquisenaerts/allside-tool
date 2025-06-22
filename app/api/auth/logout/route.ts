import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Sign out the user
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Error during sign out:", error)
      // Return a JSON response with the error
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Redirect to homepage
    return NextResponse.redirect(new URL("/", request.url))
  } catch (err) {
    console.error("Unexpected error during logout:", err)
    // Return a JSON response with the error
    return NextResponse.json({ error: "An unexpected error occurred during logout" }, { status: 500 })
  }
}
