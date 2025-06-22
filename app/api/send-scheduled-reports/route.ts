import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { analyzeSentiment } from "@/app/actions"
import { sendEmail } from "@/app/utils/email"

// Set maximum execution time to 60 seconds (maximum allowed on Hobby plan)
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    let frequency: string | null = null
    let batchNumber = 0
    let batchSize = 3
    let isTest = false
    let jsonBody: any = {}

    // Try to parse JSON body
    try {
      jsonBody = await request.json()
      console.log("Request body:", JSON.stringify(jsonBody))

      // Extract values from JSON body if present
      if (jsonBody.frequency) frequency = jsonBody.frequency
      if (jsonBody.batch !== undefined) batchNumber = jsonBody.batch
      if (jsonBody.limit) batchSize = jsonBody.limit
      if (jsonBody.test) isTest = true
    } catch (e) {
      // If JSON parsing fails, that's okay - we'll use query parameters
      console.log("No JSON body or parsing failed")
    }

    // Get values from query parameters if not already set from JSON body
    const queryFrequency = request.nextUrl.searchParams.get("frequency")
    const queryBatch = request.nextUrl.searchParams.get("batch")
    const queryLimit = request.nextUrl.searchParams.get("limit")
    const queryTest = request.nextUrl.searchParams.get("test")

    if (!frequency && queryFrequency) frequency = queryFrequency
    if (queryBatch) batchNumber = Number.parseInt(queryBatch, 10)
    if (queryLimit) batchSize = Number.parseInt(queryLimit, 10)
    if (queryTest === "true") isTest = true

    // Get API key from multiple sources
    const queryApiKey = request.nextUrl.searchParams.get("apiKey")
    const jsonApiKey = jsonBody.apiKey

    // Get authorization header and extract the token
    const authHeader = request.headers.get("authorization") || ""
    let headerToken = authHeader

    // Handle "Bearer TOKEN" format if present
    if (authHeader.startsWith("Bearer ")) {
      headerToken = authHeader.substring(7)
    }

    // Use the first available API key (query param > JSON body > header)
    const token = (queryApiKey || jsonApiKey || headerToken || "").trim()

    // Get expected API key from environment variable and trim whitespace
    const expectedApiKey = (process.env.REPORTS_API_KEY || "").trim()

    // For debugging (don't log full keys in production)
    console.log("API Key Sources:", {
      queryApiKey: queryApiKey ? "Present" : "Not present",
      jsonApiKey: jsonApiKey ? "Present" : "Not present",
      authHeader: authHeader ? "Present" : "Not present",
      bearerFormat: authHeader.startsWith("Bearer ") ? "Yes" : "No",
      tokenLength: token.length,
      expectedLength: expectedApiKey.length,
      // Log last 4 chars for debugging without exposing full key
      tokenLast4: token.length > 4 ? token.slice(-4) : "N/A",
      expectedLast4: expectedApiKey.length > 4 ? expectedApiKey.slice(-4) : "N/A",
      match: token === expectedApiKey,
    })

    // Enable test mode for debugging
    const isTestMode = isTest || token === "test-reports-api-key"

    // Validate API key
    if (!token || (token !== expectedApiKey && !isTestMode)) {
      return NextResponse.json(
        {
          error: "Invalid API key",
          debug: {
            tokenSource: queryApiKey ? "query" : jsonApiKey ? "json" : "header",
            tokenLength: token.length,
            expectedLength: expectedApiKey.length,
            match: token === expectedApiKey,
            isTestMode,
          },
        },
        { status: 401 },
      )
    }

    // Validate frequency
    if (!frequency || !["weekly", "monthly"].includes(frequency)) {
      return NextResponse.json({ error: "Invalid frequency" }, { status: 400 })
    }

    // If in test mode, return success without processing
    if (isTestMode) {
      return NextResponse.json({
        success: true,
        message: "Test mode - API key validation successful",
        params: {
          frequency,
          batchNumber,
          batchSize,
          isTest: true,
        },
      })
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
    return NextResponse.json(
      {
        error: "Internal server error",
        details: String(error),
      },
      { status: 500 },
    )
  }
}

// Also support GET requests for testing
export async function GET(request: NextRequest) {
  return POST(request)
}
