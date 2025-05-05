"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { subscribeToReports } from "@/app/actions/reports"
import { useToast } from "@/hooks/use-toast"

interface ReportSubscriptionProps {
  establishmentId?: string
  establishmentUrl: string
  establishmentName?: string
}

export function ReportSubscription({ establishmentId, establishmentUrl, establishmentName }: ReportSubscriptionProps) {
  const [open, setOpen] = useState(false)
  const [frequency, setFrequency] = useState("weekly")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)

  const handleClick = () => {
    // For now, just log that the button was clicked
    console.log("Receive Summary button clicked")
    // In the future, this will open a modal for subscription
    setIsOpen(!isOpen)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await subscribeToReports({
        frequency,
        email,
        establishmentId,
        establishmentUrl,
        establishmentName,
      })

      if (result.success) {
        toast({
          title: "Subscription successful",
          description: `You will receive ${frequency} reports for this establishment.`,
        })
        setOpen(false)
      } else {
        toast({
          title: "Subscription failed",
          description: result.error || "An error occurred. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Subscription failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={handleClick} variant="outline" className="ml-2 gap-2 bg-white text-black hover:bg-white/90">
          <Mail className="h-4 w-4" />
          Receive Summary
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Subscribe to Reports</DialogTitle>
          <DialogDescription>Receive regular sentiment analysis reports for this establishment.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Report Frequency</Label>
              <RadioGroup value={frequency} onValueChange={setFrequency}>
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
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Subscribing..." : "Subscribe"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
