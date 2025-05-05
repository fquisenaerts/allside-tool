"use client"

import type React from "react"

import { Button } from "@/components/ui/button"

interface DirectPaymentButtonProps {
  className?: string
  children?: React.ReactNode
}

export function DirectPaymentButton({ className, children }: DirectPaymentButtonProps) {
  const handleClick = () => {
    // Direct link to Stripe payment page
    window.location.href = "https://buy.stripe.com/test_aEU9AFeey3b29eU7ss"
  }

  return (
    <Button onClick={handleClick} className={className}>
      {children || "Subscribe Now"}
    </Button>
  )
}
