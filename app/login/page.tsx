"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Header } from "../components/Header"
import { Footer } from "../components/Footer"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        // User is already logged in, redirect to analyze page
        router.push("/analyze")
      }
    }

    checkSession()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (loginError) {
        setError(`Error: ${loginError.message}`)
        setLoading(false)
        return
      }

      if (!data.user) {
        setError("Failed to sign in")
        setLoading(false)
        return
      }

      setSuccess("Login successful! Redirecting...")

      // Use hard navigation to avoid caching issues
      window.location.href = "/analyze"
    } catch (err: any) {
      setError(`Unexpected error: ${err.message}`)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050314] text-white flex flex-col">
      <Header />
      <div className="flex-grow flex items-center justify-center">
        <Card className="w-[400px] mt-20 bg-[#050314] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Log In</CardTitle>
            <CardDescription className="text-gray-400">Sign in to your account</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 bg-green-900 border-green-800">
                <AlertTitle className="text-green-100">Success</AlertTitle>
                <AlertDescription className="text-green-200">{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#0f0a2e] border-gray-700 text-white"
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[#0f0a2e] border-gray-700 text-white"
              />
              <Button type="submit" className="w-full bg-white text-black hover:bg-gray-100" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/signup" className="text-sm text-gray-400 hover:text-white">
              Don't have an account? Create one
            </Link>
          </CardFooter>
        </Card>
      </div>
      <Footer />
    </div>
  )
}
