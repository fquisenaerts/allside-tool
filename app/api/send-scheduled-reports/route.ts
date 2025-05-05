import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { analyzeSentiment } from "@/app/actions"
import { generatePDFReport } from "@/app/utils/pdfGenerator"
import { sendEmail } from "@/app/utils/email"

// This would be triggered by a cron job
export async function POST(request: Request) {
  try {
    // Verify API key for security (you would set this in your environment variables)
    const { searchParams } = new URL(request.url)
    const apiKey = searchParams.get("apiKey")

    if (apiKey !== process.env.REPORTS_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get frequency from query params (weekly or monthly)
    const frequency = searchParams.get("frequency")
    if (!frequency || !["weekly", "monthly"].includes(frequency)) {
      return NextResponse.json({ error: "Invalid frequency" }, { status: 400 })
    }

    // Get subscriptions that need to be processed
    const { data: subscriptions, error } = await supabase
      .from("report_subscriptions")
      .select("*")
      .eq("frequency", frequency)
      .or(`last_sent_at.is.null, last_sent_at.lt.${getLastSendThreshold(frequency)}`) // First-time subscribers or subscribers who haven't received a report recently

    if (error) {
      console.error("Error fetching subscriptions:", error)
      return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 })
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ message: "No subscriptions to process" })
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

          // Generate PDF report
          const pdfBuffer = await generatePDFReport(analysisResults, true) // true to return buffer instead of downloading

          // Send email with the report
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
                <p>The full report is attached as a PDF.</p>
                <p>Thank you for using Allside!</p>
              </div>
            `,
            attachments: [
              {
                filename: `${(subscription.establishment_name || "establishment").replace(/[^a-z0-9]/gi, "-").toLowerCase()}-${frequency}-report.pdf`,
                content: pdfBuffer,
                contentType: "application/pdf",
              },
            ],
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

    return NextResponse.json({
      success: true,
      processed: results.length,
      successful: results.filter((r) => r.status === "fulfilled" && r.value.success).length,
      failed: results.filter((r) => r.status === "rejected" || (r.status === "fulfilled" && !r.value.success)).length,
    })
  } catch (error) {
    console.error("Error in send-scheduled-reports:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper function to determine when reports should be sent
function getLastSendThreshold(frequency: string): string {
  const now = new Date()

  if (frequency === "weekly") {
    // Reports should be sent if last sent more than 6 days ago
    const sixDaysAgo = new Date(now)
    sixDaysAgo.setDate(now.getDate() - 6)
    return sixDaysAgo.toISOString()
  } else if (frequency === "monthly") {
    // Reports should be sent if last sent more than 28 days ago
    const twentyEightDaysAgo = new Date(now)
    twentyEightDaysAgo.setDate(now.getDate() - 28)
    return twentyEightDaysAgo.toISOString()
  }

  throw new Error("Invalid frequency")
}
