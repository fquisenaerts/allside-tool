import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { invalidateCache } from "../get-review-usage/route"

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json()
    const { userId, reviewCount } = body

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
    }

    if (typeof reviewCount !== "number" || reviewCount <= 0) {
      return NextResponse.json({ success: false, error: "Valid review count is required" }, { status: 400 })
    }

    const supabase = createAdminClient()
    const currentMonth = new Date().toISOString().slice(0, 7) // Format: YYYY-MM

    // Check if the table exists
    const { error: tableCheckError } = await supabase.from("user_usage").select("count(*)").limit(1).single()

    // If table doesn't exist, create it
    if (
      tableCheckError &&
      tableCheckError.message.includes("relation") &&
      tableCheckError.message.includes("does not exist")
    ) {
      console.log("Table doesn't exist, creating it")

      // Create the table using a raw SQL query
      const { error: createTableError } = await supabase.rpc("create_user_usage_table")

      if (createTableError) {
        console.error("Error creating user_usage table:", createTableError)

        // If the function doesn't exist, try to create the table directly
        if (createTableError.message.includes("function") && createTableError.message.includes("does not exist")) {
          const { error: directCreateError } = await supabase.rpc("execute_sql", {
            sql: `
              CREATE TABLE IF NOT EXISTS public.user_usage (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
                month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
                reviews_analyzed INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                UNIQUE(user_id, month)
              );
              
              -- Add RLS policies
              ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;
              
              -- Allow users to read their own usage data
              CREATE POLICY "Users can read their own usage data"
                ON public.user_usage
                FOR SELECT
                USING (auth.uid() = user_id);
              
              -- Only allow service role to insert/update
              CREATE POLICY "Service role can insert/update usage data"
                ON public.user_usage
                FOR ALL
                USING (auth.jwt() ->> 'role' = 'service_role');
            `,
          })

          if (directCreateError) {
            console.error("Error directly creating user_usage table:", directCreateError)
            return NextResponse.json({ success: false, error: "Failed to create usage table" }, { status: 500 })
          }
        } else {
          return NextResponse.json({ success: false, error: "Failed to create usage table" }, { status: 500 })
        }
      }
    }

    // Check if a record exists for this month
    const { data: existingRecord, error: fetchError } = await supabase
      .from("user_usage")
      .select("id, reviews_analyzed")
      .eq("user_id", userId)
      .eq("month", currentMonth)
      .maybeSingle()

    if (fetchError && !fetchError.message.includes("No rows returned")) {
      console.error("Error fetching existing usage record:", fetchError)
      return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 })
    }

    let result
    if (existingRecord) {
      // Update existing record
      const newTotal = existingRecord.reviews_analyzed + reviewCount
      console.log(`Updating existing record: ${existingRecord.reviews_analyzed} + ${reviewCount} = ${newTotal}`)

      result = await supabase
        .from("user_usage")
        .update({ reviews_analyzed: newTotal, updated_at: new Date().toISOString() })
        .eq("id", existingRecord.id)
    } else {
      // Create new record
      console.log(`Creating new record with initial count: ${reviewCount}`)

      result = await supabase.from("user_usage").insert({
        user_id: userId,
        month: currentMonth,
        reviews_analyzed: reviewCount,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }

    if (result.error) {
      console.error("Error updating user review usage:", result.error)
      return NextResponse.json({ success: false, error: result.error.message }, { status: 500 })
    }

    // Invalidate the cache for this user
    invalidateCache(userId)

    console.log("Successfully updated review usage")
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in update-review-usage API:", error)
    return NextResponse.json(
      { success: false, error: error.message || "An unexpected error occurred" },
      { status: 500 },
    )
  }
}
