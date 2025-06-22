import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // Get API key from query parameter
  const queryApiKey = new URL(request.url).searchParams.get("apiKey")

  // Get authorization header
  const authHeader = request.headers.get("authorization") || ""

  // Get expected API key from environment variable
  const expectedApiKey = process.env.REPORTS_API_KEY || ""

  // Debug info
  const debugInfo = {
    queryApiKey: queryApiKey ? "Present" : "Not present",
    authHeader: authHeader ? "Present" : "Not present",
    expectedApiKey: expectedApiKey ? "Present" : "Not present",
    queryMatch: queryApiKey === expectedApiKey,
    headerMatch: authHeader === expectedApiKey,
    bearerMatch: authHeader.startsWith("Bearer ") && authHeader.substring(7) === expectedApiKey,
    queryLast4: queryApiKey ? queryApiKey.slice(-4) : "N/A",
    headerLast4: authHeader ? authHeader.slice(-4) : "N/A",
    expectedLast4: expectedApiKey ? expectedApiKey.slice(-4) : "N/A",
  }

  return NextResponse.json({
    message: "API Key Test Endpoint",
    debug: debugInfo,
  })
}

export async function POST(request: NextRequest) {
  return GET(request)
}
