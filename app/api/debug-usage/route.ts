import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Get all usage records for this user
    const { data: allUsage, error: allError } = await supabase
      .from("user_usage")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (allError) {
      console.error("Error fetching all usage:", allError)
      return NextResponse.json({ error: allError.message }, { status: 500 })
    }

    const currentMonth = new Date().toISOString().slice(0, 7)

    // Get current month's usage
    const { data: currentUsage, error: currentError } = await supabase
      .from("user_usage")
      .select("*")
      .eq("user_id", userId)
      .eq("month", currentMonth)
      .maybeSingle()

    if (currentError && !currentError.message.includes("No rows")) {
      console.error("Error fetching current usage:", currentError)
    }

    return NextResponse.json({
      userId,
      currentMonth,
      allUsage,
      currentUsage,
      totalRecords: allUsage?.length || 0,
    })
  } catch (error: any) {
    console.error("Debug usage error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
