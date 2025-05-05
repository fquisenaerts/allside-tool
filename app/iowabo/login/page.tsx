"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/app/components/Logo"
import { AlertTriangle, CheckCircle, RefreshCw } from "lucide-react"

export default function BackofficeLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [directLoading, setDirectLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [showDebug, setShowDebug] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check for URL parameters
    const errorParam = searchParams.get("error")
    const clearedParam = searchParams.get("cleared")

    if (errorParam === "invalid_token") {
      setError("Your session has expired or is invalid. Please log in again.")
    }

    if (clearedParam === "true") {
      setSuccess("Your session has been cleared. You can now log in again.")
    }

    // Clear any existing cookies on page load
    clearAllBrowserData()
  }, [searchParams])

  const handleServerLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    setDebugInfo(null)

    try {
      const formData = new FormData()
      formData.append("email", email)
      formData.append("password", password)

      const response = await fetch("/api/backoffice-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        setError(result.error || "Login failed")
        setDebugInfo(result.details || null)
        setLoading(false)
        return
      }

      // Force a hard navigation to the dashboard
      window.location.href = "/iowabo"
    } catch (error: any) {
      setError(error.message || "An error occurred during login")
      setDebugInfo(error)
      setLoading(false)
    }
  }

  const handleDirectLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setDirectLoading(true)
    setError(null)
    setSuccess(null)
    setDebugInfo(null)

    try {
      const formData = new FormData()
      formData.append("email", email)
      formData.append("password", password)
      formData.append("directLogin", "true")

      // Use the server action for direct login
      const result = await fetch("/api/backoffice-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, directLogin: true }),
      }).then((res) => res.json())

      if (!result.success) {
        setError(result.error || "Login failed")
        setDebugInfo(result.details || null)
        setDirectLoading(false)
        return
      }

      // Force a hard navigation to the dashboard
      window.location.href = "/iowabo"
    } catch (error: any) {
      setError(error.message || "An error occurred during login")
      setDebugInfo(error)
      setDirectLoading(false)
    }
  }

  const clearAllBrowserData = () => {
    // Clear cookies for the current domain
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
    })

    // Clear localStorage
    try {
      localStorage.clear()
    } catch (e) {
      console.error("Failed to clear localStorage:", e)
    }

    // Clear sessionStorage
    try {
      sessionStorage.clear()
    } catch (e) {
      console.error("Failed to clear sessionStorage:", e)
    }
  }

  const handleClearBrowserData = () => {
    clearAllBrowserData()
    setSuccess("All browser data cleared. You can now try logging in again.")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <CardTitle className="text-2xl text-center">Admin Backoffice</CardTitle>
          <CardDescription className="text-center">Enter your credentials to access the admin panel</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-700">Success</AlertTitle>
              <AlertDescription className="text-green-600">{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleServerLogin}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button className="w-full" type="submit" disabled={loading || directLoading}>
                {loading ? "Authenticating..." : "Login to Backoffice"}
              </Button>

              <Button
                className="w-full"
                variant="outline"
                disabled={loading || directLoading}
                onClick={handleDirectLogin}
              >
                {directLoading ? "Authenticating..." : "Try Direct Login"}
              </Button>
              <p className="text-xs text-gray-500 text-center">
                Use this if normal login fails due to permission issues
              </p>
            </div>
          </form>

          {debugInfo && (
            <div className="mt-4">
              <Button variant="outline" size="sm" onClick={() => setShowDebug(!showDebug)} className="w-full">
                {showDebug ? "Hide" : "Show"} Debug Info
              </Button>
              {showDebug && (
                <div className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                  <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                </div>
              )}
            </div>
          )}

          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={handleClearBrowserData} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Clear All Browser Data
            </Button>
            <p className="text-xs text-gray-500 mt-1 text-center">
              This will clear all cookies, localStorage, and sessionStorage for this site
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-gray-500">
            Don't have an admin account?{" "}
            <Link href="/iowabo/register" className="text-blue-600 hover:underline">
              Register here
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
