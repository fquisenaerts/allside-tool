"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "../components/Header"
import { Footer } from "../components/Footer"

export default function TestStripe() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDirectCheckout = async () => {
    window.location.href = "/api/test-stripe"
  }

  const handleApiCheckout = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: "test-user-id",
          email: "test@example.com",
          plan: "standard",
        }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
        return
      }

      // Redirect to Stripe checkout
      window.location.href = data.url
    } catch (err) {
      console.error("Error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050314] text-white flex flex-col">
      <Header />
      <div className="flex-grow flex items-center justify-center">
        <Card className="w-[450px] mt-10 mb-10 bg-[#050314] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Test Stripe Integration</CardTitle>
            <CardDescription className="text-gray-400">Choose a method to test the Stripe checkout</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-4">
              <Button onClick={handleDirectCheckout} className="bg-white text-black hover:bg-gray-100">
                Direct Checkout (Server-side Redirect)
              </Button>

              <Button onClick={handleApiCheckout} className="bg-white text-black hover:bg-gray-100" disabled={loading}>
                {loading ? "Loading..." : "API Checkout (Client-side Redirect)"}
              </Button>

              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  )
}
