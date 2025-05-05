import Link from "next/link"
import { Button } from "@/components/ui/button"
import { XCircle } from "lucide-react"

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-[#050314] text-white flex items-center justify-center">
      <div className="max-w-md w-full p-8 bg-[#0f0a2e] rounded-lg shadow-lg text-center">
        <div className="flex justify-center mb-6">
          <XCircle className="h-16 w-16 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold mb-4">Payment Cancelled</h1>
        <p className="text-gray-300 mb-8">
          Your payment was cancelled. If you experienced any issues or have questions, please contact our support team.
        </p>
        <div className="space-y-4">
          <Button asChild className="w-full bg-white text-black hover:bg-gray-100">
            <Link href="/subscribe">Try Again</Link>
          </Button>
          <Button asChild variant="outline" className="w-full border-gray-600 hover:bg-gray-800">
            <Link href="/signup?redirect=trial">Start Free Trial Instead</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
