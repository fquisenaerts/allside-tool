"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "../components/Header"
import { Footer } from "../components/Footer"

export default function DirectCheckoutTest() {
  const [loading, setLoading] = useState(false)

  const handleDirectCheckout = () => {
    // Use a test user ID and email
    window.location.href = `/api/direct-stripe-checkout?userId=test-user-id&email=test@example.com`
  }

  const handleStripeDirectLink = () => {
    // Go directly to Stripe payment link
    window.location.href = "https://buy.stripe.com/test_8wM5kpgmA7na9eU4gg"
  }

  return (
    <div className="min-h-screen bg-[#050314] text-white flex flex-col">
      <Header />
      <div className="flex-grow flex items-center justify-center">
        <Card className="w-[450px] mt-10 mb-10 bg-[#050314] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Direct Checkout Test</CardTitle>
            <CardDescription className="text-gray-400">Test direct Stripe checkout methods</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-4">
              <Button onClick={handleDirectCheckout} className="bg-white text-black hover:bg-gray-100">
                API Redirect to Stripe
              </Button>

              <Button onClick={handleStripeDirectLink} className="bg-white text-black hover:bg-gray-100">
                Direct Stripe Payment Link
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  )
}
