import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { analyzeSentiment } from "@/app/actions"
import { sendEmail } from "@/app/utils/email"

export const maxDuration = 60 // Set maximum execution time to 60 seconds (maximum allowed)

export async function POST(request: NextRequest) {
  try {
    // Get API key from query parameters
    const apiKey = request.nextUrl.searchParams.get("apiKey")
    const frequency = request.nextUrl.searchParams.get("frequency")

    // Validate API key
    if (!apiKey || apiKey !== process.env.REPORTS_API_KEY) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
    }

    // Validate frequency
    if (!frequency || !["weekly", "monthly"].includes(frequency)) {
      return NextResponse.json({ error: "Invalid frequency" }, { status: 400 })
    }

    // Get subscriptions for the specified frequency
    const supabase = createAdminClient()
    const { data: subscriptions, error } = await supabase
      .from("report_subscriptions")
      .select("*")
      .eq("frequency", frequency)
      .limit(5) // Process only 5 subscriptions per execution to stay within time limit

    if (error) {
      console.error("Error fetching subscriptions:", error)
      return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 })
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: `No ${frequency} subscriptions to process`,
        subscriptionsCount: 0,
      })
    }

    // Process each subscription
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          // Analyze the establishment
          const analysisResults = await analyzeSentiment({
            type: "url",
            content: subscription.establishment_url,
          })

          if (!analysisResults) {
            throw new Error("Failed to analyze establishment")
          }

          // Send email with the report summary
          const emailResult = await sendEmail({
            to: subscription.email,
            subject: `Your ${frequency} report for ${subscription.establishment_name || "your establishment"}`,
            text: `
              Hello,
              
              Here is your ${frequency} sentiment analysis report for ${subscription.establishment_name || "your establishment"}.
              
              This report provides insights into customer reviews and sentiment over the past ${frequency === "weekly" ? "week" : "month"}.
              
              Thank you for using Allside!
            `,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Your ${frequency} Report</h2>
                <p>Hello,</p>
                <p>Here is your ${frequency} sentiment analysis report for <strong>${subscription.establishment_name || "your establishment"}</strong>.</p>
                <p>This report provides insights into customer reviews and sentiment over the past ${frequency === "weekly" ? "week" : "month"}.</p>
                <p>Key findings:</p>
                <ul>
                  <li>Overall sentiment: ${analysisResults.sentiment?.overall || "N/A"}</li>
                  <li>Positive reviews: ${analysisResults.sentiment?.positive || "0"}%</li>
                  <li>Negative reviews: ${analysisResults.sentiment?.negative || "0"}%</li>
                </ul>
                <p>To view the full report, please log in to your Allside account.</p>
                <p>Thank you for using Allside!</p>
              </div>
            `,
          })

          if (!emailResult.success) {
            throw new Error(`Failed to send email: ${emailResult.error}`)
          }

          // Update last_sent_at
          await supabase
            .from("report_subscriptions")
            .update({ last_sent_at: new Date().toISOString() })
            .eq("id", subscription.id)

          // Mark this subscription as processed
          await supabase
            .from("report_subscriptions")
            .update({ processing_status: "processed" })
            .eq("id", subscription.id)

          return { success: true, subscription_id: subscription.id }
        } catch (err) {
          console.error(`Error processing subscription ${subscription.id}:`, err)

          // Mark this subscription as failed
          await supabase.from("report_subscriptions").update({ processing_status: "failed" }).eq("id", subscription.id)

          return { success: false, subscription_id: subscription.id, error: err }
        }
      }),
    )

    // Update the remaining subscriptions to be processed in the next run
    const { count } = await supabase
      .from("report_subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("frequency", frequency)
      .is("processing_status", null)

    return NextResponse.json({
      success: true,
      processed: results.length,
      successful: results.filter((r) => r.status === "fulfilled" && r.value.success).length,
      failed: results.filter((r) => r.status === "rejected" || (r.status === "fulfilled" && !r.value.success)).length,
      remaining: count || 0,
    })
  } catch (error) {
    console.error("Error in send-scheduled-reports:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Also support GET requests for testing
export async function GET(request: NextRequest) {
  return POST(request)
}
