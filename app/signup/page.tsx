"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Header } from "../components/Header"
import { Footer } from "../components/Footer"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function Signup() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [company, setCompany] = useState("")
  const [plan, setPlan] = useState("free_trial")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect")

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      // Simple signup with minimal data
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signupError) {
        setError(`Error: ${signupError.message}`)
        setLoading(false)
        return
      }

      if (!data.user) {
        setError("Failed to create user")
        setLoading(false)
        return
      }

      setSuccess("Account created successfully! Redirecting...")

      // Redirect to confirmation page
      setTimeout(() => {
        router.push(`/signup/confirmation?email=${encodeURIComponent(email)}`)
      }, 2000)
    } catch (err: any) {
      setError(`Unexpected error: ${err.message}`)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050314] text-white flex flex-col">
      <Header />
      <div className="flex-grow flex items-center justify-center">
        <Card className="w-[450px] mt-10 mb-10 bg-[#050314] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Create an Account</CardTitle>
            <CardDescription className="text-gray-400">Sign up to get started with our platform</CardDescription>
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

            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="bg-[#0f0a2e] border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="bg-[#0f0a2e] border-gray-700 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-[#0f0a2e] border-gray-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="bg-[#0f0a2e] border-gray-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan">Select Plan</Label>
                <Select value={plan} onValueChange={setPlan}>
                  <SelectTrigger className="bg-[#0f0a2e] border-gray-700 text-white">
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free_trial">Free Trial (14 days)</SelectItem>
                    <SelectItem value="standard">Standard (€16/month)</SelectItem>
                    <SelectItem value="custom">Custom Plan (Contact us)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-[#0f0a2e] border-gray-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-[#0f0a2e] border-gray-700 text-white"
                />
              </div>

              <Button type="submit" className="w-full bg-white text-black hover:bg-gray-100" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/login" className="text-sm text-gray-400 hover:text-white">
              Already have an account? Sign in
            </Link>
          </CardFooter>
        </Card>
      </div>
      <Footer />
    </div>
  )
}
