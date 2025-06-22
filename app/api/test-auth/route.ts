import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // Get API key from query parameter
  const apiKey = request.nextUrl.searchParams.get("apiKey")

  // Get authorization header
  const authHeader = request.headers.get("authorization") || ""

  // Get expected API key from environment variable
  const expectedApiKey = process.env.REPORTS_API_KEY || ""

  // Simple debug info
  const debugInfo = {
    queryApiKeyProvided: !!apiKey,
    headerProvided: !!authHeader,
    expectedApiKeyExists: !!expectedApiKey,
    testKeyAccepted: apiKey === "test-auth-key",
  }

  // Check if test key is provided
  if (apiKey === "test-auth-key") {
    return NextResponse.json({
      success: true,
      message: "Test authentication successful",
      debug: debugInfo,
    })
  }

  // Check if real API key is provided
  if (apiKey === expectedApiKey || authHeader === expectedApiKey || authHeader === `Bearer ${expectedApiKey}`) {
    return NextResponse.json({
      success: true,
      message: "Authentication successful",
      debug: debugInfo,
    })
  }

  // Authentication failed
  return NextResponse.json(
    {
      error: "Invalid API key",
      debug: debugInfo,
    },
    { status: 401 },
  )
}

export async function POST(request: NextRequest) {
  return GET(request)
}
