"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { checkBackofficeAuth, backofficeLogout } from "./actions"
import { Button } from "@/components/ui/button"
import { Logo } from "@/app/components/Logo"
import {
  Users,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Bell,
  Settings,
  Menu,
  X,
  AlertTriangle,
  RefreshCw,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function BackofficeLayout({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [error, setError] = useState<any>(null)
  const [errorDetails, setErrorDetails] = useState<any>(null)
  const [tableExists, setTableExists] = useState(true)
  const [showDebugInfo, setShowDebugInfo] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Use a ref to track if auth check has been performed
  const authCheckPerformed = useRef(false)
  // Use a ref to track if we're redirecting to prevent loops
  const isRedirecting = useRef(false)

  useEffect(() => {
    // Skip auth check on login and register pages
    if (pathname === "/iowabo/login" || pathname === "/iowabo/register") {
      setLoading(false)
      return
    }

    // Skip if auth check has already been performed or if we're redirecting
    if (authCheckPerformed.current || isRedirecting.current) {
      return
    }

    // Mark that we've performed the auth check
    authCheckPerformed.current = true

    const checkAuth = async () => {
      try {
        console.log("Checking auth...")
        const result = await checkBackofficeAuth()
        console.log("Auth check result:", result)

        // If we have an invalid token error, clear it and redirect to login
        if (result.error && result.error.message === "Invalid or expired token") {
          console.log("Invalid token detected, redirecting to login")

          // Prevent further redirects
          if (isRedirecting.current) return
          isRedirecting.current = true

          // The token is invalid, so let's clear it
          await backofficeLogout()

          // Redirect to login page
          window.location.href = "/iowabo/login?error=invalid_token"
          return
        }

        if (result.error) {
          console.error("Auth check error:", result.error)
          setError(result.error)
          setErrorDetails(
            result.errorDetails || {
              message: result.errorMessage || "Unknown error",
              stack: result.errorStack,
            },
          )
          setTableExists(result.tableExists !== false)
          setLoading(false)
          return
        }

        if (!result.authenticated) {
          // Prevent further redirects
          if (isRedirecting.current) return
          isRedirecting.current = true

          router.push("/iowabo/login")
          return
        }

        setAdmin(result.admin)
        setLoading(false)
      } catch (err) {
        console.error("Error in checkAuth:", err)
        setError(err)
        setLoading(false)
      }
    }

    checkAuth()
  }, [pathname, router])

  const handleSignOut = async () => {
    await backofficeLogout()
    window.location.href = "/iowabo/login"
  }

  const handleRetry = () => {
    // Reset the auth check flag so we can try again
    authCheckPerformed.current = false
    isRedirecting.current = false

    setLoading(true)
    setError(null)
    setErrorDetails(null)
    window.location.reload()
  }

  const handleClearCookiesAndRedirect = async () => {
    await backofficeLogout()
    window.location.href = "/iowabo/login?cleared=true"
  }

  // If on login or register page or loading, just render children
  if (pathname === "/iowabo/login" || pathname === "/iowabo/register") {
    return <>{children}</>
  }

  // If loading, show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // If there's an error, show error message with debug info
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Logo />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Authentication Error</h2>
          </div>

          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>
              {error.message === "Invalid or expired token" ? "Session Expired" : "Connection Error"}
            </AlertTitle>
            <AlertDescription>
              {error.message === "Invalid or expired token"
                ? "Your session has expired or is invalid. Please log in again."
                : "There was an error connecting to the database."}
            </AlertDescription>
          </Alert>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Troubleshooting Steps:</h3>

            {error.message === "Invalid or expired token" ? (
              <ol className="list-decimal pl-5 space-y-3">
                <li>Your authentication token is no longer valid</li>
                <li>This can happen if you've logged in on another device or your session has expired</li>
                <li>Click the button below to clear your session and log in again</li>
              </ol>
            ) : (
              <ol className="list-decimal pl-5 space-y-3">
                <li>Verify your Supabase URL and anon key in the environment variables</li>
                <li>Check that the backoffice_admins table exists in your Supabase database</li>
                <li>
                  Ensure the table has the correct columns (id, email, password, token, registration_code, created_at)
                </li>
                <li>Verify that Row Level Security (RLS) is properly configured</li>
                <li>Try refreshing the page or logging in again</li>
              </ol>
            )}

            <div className="mt-6">
              <Button onClick={() => setShowDebugInfo(!showDebugInfo)} variant="outline" className="w-full">
                {showDebugInfo ? "Hide" : "Show"} Debug Information
              </Button>

              {showDebugInfo && errorDetails && (
                <div className="mt-4 p-4 bg-gray-100 rounded overflow-auto max-h-60">
                  <pre className="text-xs">{JSON.stringify(errorDetails, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>

          <div className="text-center space-y-4">
            {error.message === "Invalid or expired token" ? (
              <Button onClick={handleClearCookiesAndRedirect} className="w-full">
                Clear Session & Log In Again
              </Button>
            ) : (
              <>
                <Button onClick={handleRetry} className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry Connection
                </Button>

                <Button onClick={handleClearCookiesAndRedirect} variant="outline" className="w-full">
                  Clear Cookies & Log In Again
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // If not authenticated and not loading, don't render anything (will redirect)
  if (!admin && !loading) {
    return null
  }

  const navigation = [
    { name: "Dashboard", href: "/iowabo", icon: LayoutDashboard, current: pathname === "/iowabo" },
    { name: "Users", href: "/iowabo/users", icon: Users, current: pathname === "/iowabo/users" },
    {
      name: "Subscriptions",
      href: "/iowabo/subscriptions",
      icon: CreditCard,
      current: pathname === "/iowabo/subscriptions",
    },
    { name: "Settings", href: "/iowabo/settings", icon: Settings, current: pathname === "/iowabo/settings" },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="bg-white">
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <Logo />
            <span className="ml-2 text-xl font-semibold">Admin</span>
          </div>
          <div className="mt-5 flex-1 flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    item.current ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon
                    className={`mr-3 flex-shrink-0 h-5 w-5 ${
                      item.current ? "text-gray-500" : "text-gray-400 group-hover:text-gray-500"
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="px-2 mt-6 mb-4">
            <Button variant="outline" className="w-full justify-start" onClick={handleSignOut}>
              <LogOut className="mr-3 h-5 w-5" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="flex items-center justify-between px-4 pt-5 pb-4">
              <div className="flex items-center">
                <Logo />
                <span className="ml-2 text-xl font-semibold">Admin</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="mt-5 flex-1 h-0 overflow-y-auto">
              <nav className="px-2 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      item.current ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon
                      className={`mr-3 flex-shrink-0 h-5 w-5 ${
                        item.current ? "text-gray-500" : "text-gray-400 group-hover:text-gray-500"
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="px-2 mt-6 mb-4">
              <Button variant="outline" className="w-full justify-start" onClick={handleSignOut}>
                <LogOut className="mr-3 h-5 w-5" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <div className="flex-1 px-4 flex justify-end">
            <div className="ml-4 flex items-center md:ml-6">
              {/* Notification bell */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-black" />
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <span>New user registered</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>New subscription activated</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Profile dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="ml-3">
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-500" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <span>{admin?.email}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  )
}
