import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-[#050314] text-white flex items-center justify-center">
      <div className="max-w-md w-full p-8 bg-[#0f0a2e] rounded-lg shadow-lg text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-gray-300 mb-8">
          Thank you for your subscription. Your account has been upgraded and you now have access to all premium
          features.
        </p>
        <div className="space-y-4">
          <Button asChild className="w-full bg-white text-black hover:bg-gray-100">
            <Link href="/analyze">Start Analyzing Reviews</Link>
          </Button>
          <Button asChild variant="outline" className="w-full border-gray-600 hover:bg-gray-800">
            <Link href="/profile">View My Subscription</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
