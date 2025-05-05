import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  // Create a Supabase client configured to use cookies
  const { supabase, response } = createClient(request)

  // Refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-session-with-middleware
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes that require authentication
  const protectedRoutes = ["/profile", "/my-establishments", "/subscription", "/analyze"]

  // Check if the route is protected and user is not authenticated
  const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  if (isProtectedRoute && !session) {
    // Redirect to login page if trying to access protected route without auth
    const redirectUrl = new URL("/login", request.url)
    redirectUrl.searchParams.set("redirect", request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is authenticated and trying to access login/signup pages, redirect to analyze
  if (session && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup")) {
    const redirectUrl = new URL("/analyze", request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Backoffice routes that require special authentication
  const backofficeRoutes = ["/iowabo"]

  const isBackofficeRoute = backofficeRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  if (isBackofficeRoute && request.nextUrl.pathname !== "/iowabo/login") {
    // Check if user has backoffice access
    if (!session) {
      // Redirect to backoffice login if not authenticated
      return NextResponse.redirect(new URL("/iowabo/login", request.url))
    }

    // Check if user has backoffice access
    const { data: backofficeUser } = await supabase
      .from("backoffice_users")
      .select("*")
      .eq("user_id", session.user.id)
      .single()

    if (!backofficeUser) {
      // Redirect to backoffice login if not authorized
      return NextResponse.redirect(new URL("/iowabo/login", request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api (API routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
}
