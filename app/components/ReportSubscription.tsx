"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Mail } from "lucide-react"
import { subscribeToReports } from "../actions/reports"

interface ReportSubscriptionProps {
  establishmentId?: string
  establishmentUrl: string
  establishmentName?: string
  userId: string
}

export function ReportSubscription({
  establishmentId,
  establishmentUrl,
  establishmentName = "this establishment",
  userId,
}: ReportSubscriptionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [frequency, setFrequency] = useState("weekly")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubscribe = async () => {
    if (!email) {
      setError("Please enter your email address")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await subscribeToReports({
        userId,
        email,
        frequency,
        establishmentId,
        establishmentUrl,
        establishmentName,
      })

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          setIsDialogOpen(false)
          setSuccess(false)
        }, 2000)
      } else {
        setError(result.error || "Failed to subscribe to reports")
      }
    } catch (err) {
      console.error("Error subscribing to reports:", err)
      setError("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsDialogOpen(true)}
        className="gap-2 bg-white text-black hover:bg-white/90"
      >
        <Mail className="h-4 w-4" />
        Receive Summary
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Subscribe to Summary Reports</DialogTitle>
            <DialogDescription>
              Receive regular summary reports for {establishmentName} directly to your email.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="frequency" className="text-right">
                Frequency
              </Label>
              <RadioGroup id="frequency" value={frequency} onValueChange={setFrequency} className="col-span-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="weekly" id="weekly" />
                  <Label htmlFor="weekly">Weekly</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label htmlFor="monthly">Monthly</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {error && <div className="text-sm font-medium text-red-500 dark:text-red-400">{error}</div>}

          {success && (
            <div className="text-sm font-medium text-green-500 dark:text-green-400">
              Successfully subscribed to {frequency} reports!
            </div>
          )}

          <DialogFooter>
            <Button type="submit" onClick={handleSubscribe} disabled={isSubmitting || success}>
              {isSubmitting ? "Subscribing..." : "Subscribe"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
