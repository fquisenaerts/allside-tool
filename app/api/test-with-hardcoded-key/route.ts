import { type NextRequest, NextResponse } from "next/server"

// Hardcoded test key - this is the same key we'll use in the GitHub workflow
const TEST_KEY = "test-key-12345"

export async function GET(request: NextRequest) {
  // Get key from query parameter
  const key = request.nextUrl.searchParams.get("key")
  
  // Get key from Authorization header
  const authHeader = request.headers.get("authorization") || ""
  
  // Check if either key matches the hardcoded test key
  if (key === TEST_KEY || authHeader === TEST_KEY) {
    return NextResponse.json({
      success: true,
      message: "Authentication successful with hardcoded key",
      method: "Query parameter or Authorization header",
    })
  }
  
  // Return details about what was received
  return NextResponse.json({
    success: false,
    message: "Authentication failed with hardcoded key",
    received: {
      queryKey: key ? `${key.substring(0, 3)}...${key.substring(key.length - 3)}` : "not provided",
      authHeader: authHeader ? `${authHeader.substring(0, 3)}...${authHeader.substring(authHeader.length - 3)}` : "not provided",
    },
    expected: `${TEST_KEY.substring(0, 3)}...${TEST_KEY.substring(TEST_KEY.length - 3)}`,
  }, { status: 401 })
}

export async function POST(request: NextRequest) {
  return GET(request)
}
