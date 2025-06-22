"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "../../components/Header"
import { Footer } from "../../components/Footer"
import { CheckCircle } from "lucide-react"

export default function SignupConfirmation() {
  const [countdown, setCountdown] = useState(5)
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const redirect = searchParams.get("redirect")

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      if (redirect === "payment") {
        // Redirect to Stripe payment page
        window.location.href = "https://buy.stripe.com/8wM5kpgmA7na9eU4gg"
      } else if (redirect === "trial") {
        // Redirect to analyze page
        router.push("/analyze")
      } else {
        // Regular flow
        router.push("/login")
      }
    }
  }, [countdown, router, redirect])

  const handleContinue = () => {
    if (redirect === "payment") {
      // Redirect to Stripe payment page
      window.location.href = "https://buy.stripe.com/8wM5kpgmA7na9eU4gg"
    } else if (redirect === "trial") {
      // Redirect to analyze page
      router.push("/analyze")
    } else {
      // Regular flow
      router.push("/login")
    }
  }

  return (
    <div className="min-h-screen bg-[#050314] text-white flex flex-col">
      <Header />
      <div className="flex-grow flex items-center justify-center">
        <Card className="w-[450px] mt-10 mb-10 bg-[#050314] border-gray-800">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-white text-2xl">Account Created!</CardTitle>
            <CardDescription className="text-gray-400">
              {redirect === "payment"
                ? "Your account has been created. You will now be redirected to the payment page."
                : redirect === "trial"
                  ? "Your free trial account has been created. You will now be redirected to the dashboard."
                  : "Your account has been created. Please check your email to verify your account."}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-400 mb-4">
              {email && (
                <>
                  We've sent a confirmation email to <span className="font-medium text-white">{email}</span>
                </>
              )}
            </p>
            <p className="text-gray-400">
              {redirect === "payment"
                ? `Redirecting to payment in ${countdown} seconds...`
                : redirect === "trial"
                  ? `Redirecting to dashboard in ${countdown} seconds...`
                  : `Redirecting to login in ${countdown} seconds...`}
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={handleContinue} className="bg-white text-black hover:bg-gray-100">
              {redirect === "payment"
                ? "Continue to Payment"
                : redirect === "trial"
                  ? "Continue to Dashboard"
                  : "Continue to Login"}
            </Button>
          </CardFooter>
        </Card>
      </div>
      <Footer />
    </div>
  )
}
