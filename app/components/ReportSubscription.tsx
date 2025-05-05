"use client"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"

interface ReportSubscriptionProps {
  establishmentId?: string
  establishmentUrl: string
  establishmentName?: string
}

export function ReportSubscription() {
  return (
    <Button
      variant="outline"
      className="ml-2 gap-2 bg-white text-black hover:bg-white/90"
      onClick={() => console.log("Report subscription clicked")}
    >
      <Mail className="h-4 w-4" />
      Receive Summary
    </Button>
  )
}
