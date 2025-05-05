"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Header from "../components/Header"
import Footer from "../components/Footer"
import { supabase } from "@/lib/supabase"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage("Password reset email sent. Check your inbox.")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      <div className="flex-grow flex items-center justify-center">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Forgot Password</CardTitle>
            <CardDescription>Enter your email to reset your password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Reset Password"}
              </Button>
            </form>
            {message && <p className="mt-4 text-sm text-center">{message}</p>}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  )
}
