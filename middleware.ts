import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is not authenticated and trying to access protected routes
  if (
    !session &&
    (req.nextUrl.pathname.startsWith("/analyze") || req.nextUrl.pathname.startsWith("/my-establishments"))
  ) {
    // Remove the special case for /analyze that was causing issues
    const redirectUrl = new URL("/login", req.url)
    redirectUrl.searchParams.set("redirect", req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is authenticated and trying to access login/signup pages, redirect to analyze
  if (session && (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/signup")) {
    const redirectUrl = new URL("/analyze", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is authenticated, check subscription status for certain features
  if (session && req.nextUrl.pathname.startsWith("/analyze")) {
    try {
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      // Store subscription info in request headers to be used by the page
      if (subscription) {
        const requestHeaders = new Headers(req.headers)
        requestHeaders.set("x-subscription-status", subscription.status)
        requestHeaders.set("x-subscription-plan", subscription.plan_id)
        requestHeaders.set("x-subscription-features", JSON.stringify(subscription.features))

        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        })
      }
    } catch (error) {
      console.error("Error fetching subscription in middleware:", error)
      // Continue even if there's an error fetching subscription
    }
  }

  return res
}

export const config = {
  matcher: ["/analyze/:path*", "/my-establishments/:path*", "/login", "/signup"],
}
