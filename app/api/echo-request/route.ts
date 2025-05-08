import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Get all headers
    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      headers[key] =
        key.toLowerCase() === "authorization"
          ? `${value.substring(0, 3)}...${value.substring(value.length - 3)}` // Mask most of auth header
          : value
    })

    // Try to parse body
    let body = {}
    try {
      body = await request.json()
    } catch (e) {
      body = { error: "Failed to parse JSON body" }
    }

    // Get query params
    const url = new URL(request.url)
    const params: Record<string, string> = {}
    url.searchParams.forEach((value, key) => {
      params[key] =
        key.toLowerCase() === "apikey"
          ? `${value.substring(0, 3)}...${value.substring(value.length - 3)}` // Mask most of API key
          : value
    })

    // Get environment variables (masked)
    const envVars = {
      REPORTS_API_KEY_EXISTS: !!process.env.REPORTS_API_KEY,
      REPORTS_API_KEY_LENGTH: process.env.REPORTS_API_KEY?.length || 0,
      REPORTS_API_KEY_SAMPLE: process.env.REPORTS_API_KEY
        ? `${process.env.REPORTS_API_KEY.substring(0, 3)}...${process.env.REPORTS_API_KEY.substring(process.env.REPORTS_API_KEY.length - 3)}`
        : "not set",
    }

    return NextResponse.json({
      message: "Request Echo",
      method: request.method,
      url: request.url,
      headers,
      params,
      body,
      envVars,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return POST(request)
}
