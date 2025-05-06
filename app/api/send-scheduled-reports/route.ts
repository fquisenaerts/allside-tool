import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { analyzeSentiment } from "@/app/actions"
import { sendEmail } from "@/app/utils/email"

// Set maximum execution time to 60 seconds (maximum allowed on Hobby plan)
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    // Get API key from query parameters
    const apiKey = request.nextUrl.searchParams.get("apiKey")
    const frequency = request.nextUrl.searchParams.get("frequency")

    // Get batch number from query parameters (for pagination)
    const batchNumber = Number.parseInt(request.nextUrl.searchParams.get("batch") || "0", 10)
    const batchSize = 3 // Process only 3 subscriptions per execution to stay within time limit

    // Validate API key
    if (!apiKey || apiKey !== process.env.REPORTS_API_KEY) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
    }

    // Validate frequency
    if (!frequency || !["weekly", "monthly"].includes(frequency)) {
      return NextResponse.json({ error: "Invalid frequency" }, { status: 400 })
    }

    // Get subscriptions for the specified frequency with pagination
    const supabase = createAdminClient()
    const { data: subscriptions, error } = await supabase
      .from("report_subscriptions")
      .select("*")
      .eq("frequency", frequency)
      .range(batchNumber * batchSize, (batchNumber + 1) * batchSize - 1)

    if (error) {
      console.error("Error fetching subscriptions:", error)
      return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 })
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: `No more ${frequency} subscriptions to process in batch ${batchNumber}`,
        subscriptionsCount: 0,
      })
    }

    // Process each subscription in this batch
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

          return { success: true, subscription_id: subscription.id }
        } catch (err) {
          console.error(`Error processing subscription ${subscription.id}:`, err)
          return { success: false, subscription_id: subscription.id, error: err }
        }
      }),
    )

    // Get total count for pagination info
    const { count } = await supabase
      .from("report_subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("frequency", frequency)

    // Calculate total batches and whether there are more batches to process
    const totalSubscriptions = count || 0
    const totalBatches = Math.ceil(totalSubscriptions / batchSize)
    const hasMoreBatches = batchNumber + 1 < totalBatches

    return NextResponse.json({
      success: true,
      batch: {
        current: batchNumber,
        total: totalBatches,
        hasMore: hasMoreBatches,
      },
      processed: results.length,
      successful: results.filter((r) => r.status === "fulfilled" && r.value.success).length,
      failed: results.filter((r) => r.status === "rejected" || (r.status === "fulfilled" && !r.value.success)).length,
      totalSubscriptions,
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
