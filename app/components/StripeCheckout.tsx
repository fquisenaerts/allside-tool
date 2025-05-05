"use client"

import { useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Button } from "@/components/ui/button"

// We'll initialize Stripe in the component instead of globally
interface StripeCheckoutProps {
  priceId: string
  publishableKey: string
  buttonText?: string
  className?: string
  variant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link"
}

export default function StripeCheckout({
  priceId,
  publishableKey,
  buttonText = "Subscribe Now",
  className = "",
  variant = "default",
}: StripeCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckout = async () => {
    setIsLoading(true)

    try {
      // Initialize Stripe with the provided publishable key
      const stripePromise = loadStripe(publishableKey)
      const stripe = await stripePromise

      if (!stripe) {
        console.error("Stripe failed to initialize")
        setIsLoading(false)
        return
      }

      // Call your backend to create the Checkout Session
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/payment/success`,
          cancelUrl: `${window.location.origin}/payment/cancel`,
        }),
      })

      const session = await response.json()

      if (session.error) {
        console.error("Error creating checkout session:", session.error)
        setIsLoading(false)
        return
      }

      // When the customer clicks on the button, redirect them to Checkout.
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      })

      if (result.error) {
        console.error("Error redirecting to checkout:", result.error)
      }
    } catch (error) {
      console.error("Error during checkout:", error)

      // Fallback to direct link if client-side checkout fails
      window.location.href = "https://buy.stripe.com/8wM5kpgmA7na9eU4gg"
    }

    setIsLoading(false)
  }

  return (
    <Button onClick={handleCheckout} disabled={isLoading} className={className} variant={variant}>
      {isLoading ? "Loading..." : buttonText}
    </Button>
  )
}
