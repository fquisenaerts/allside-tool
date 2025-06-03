"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, Check, Mail } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface ReportSubscriptionProps {
  establishmentId?: string
  establishmentUrl: string
  establishmentName?: string
}

export function ReportSubscription({ establishmentId, establishmentUrl, establishmentName }: ReportSubscriptionProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [frequency, setFrequency] = useState<string>("weekly")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userEmail, setUserEmail] = useState<string>("")
  const [userId, setUserId] = useState<string>("")
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  // Fetch user email when component mounts or dialog opens
  useEffect(() => {
    if (dialogOpen) {
      fetchUserEmail()
    }
  }, [dialogOpen])

  const fetchUserEmail = async () => {
    try {
      const { data } = await supabase.auth.getSession()
      if (data.session?.user?.email) {
        setUserEmail(data.session.user.email)
        setUserId(data.session.user.id)
      }
    } catch (error) {
      console.error("Error fetching user session:", error)
    }
  }

  const handleOpenDialog = () => {
    setDialogOpen(true)
  }

  const handleScheduleReport = async () => {
    if (!establishmentUrl) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Missing establishment information",
      })
      return
    }

    if (!userId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to schedule reports",
      })
      return
    }

    setIsSubmitting(true)
    try {
      console.log("Scheduling report with:", {
        userId,
        email: userEmail,
        frequency,
        establishmentUrl,
        establishmentName,
      })

      // Check if subscription already exists
      const { data: existingSubscription, error: checkError } = await supabase
        .from("report_subscriptions")
        .select("*")
        .eq("user_id", userId)
        .eq("establishment_url", establishmentUrl)
        .maybeSingle()

      if (checkError) {
        console.error("Error checking existing subscription:", checkError)
        throw new Error(checkError.message)
      }

      console.log("Existing subscription check:", existingSubscription)

      let result
      if (existingSubscription) {
        // Update existing subscription
        console.log("Updating existing subscription:", existingSubscription.id)
        result = await supabase
          .from("report_subscriptions")
          .update({
            email: userEmail,
            frequency,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingSubscription.id)
      } else {
        // Create new subscription
        console.log("Creating new subscription")
        result = await supabase.from("report_subscriptions").insert({
          user_id: userId,
          email: userEmail,
          frequency,
          establishment_id: establishmentId,
          establishment_url: establishmentUrl,
          establishment_name: establishmentName || "Unnamed Establishment",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }

      console.log("Database operation result:", result)

      if (result.error) {
        throw new Error(result.error.message)
      }

      toast({
        title: "Report Scheduled",
        description: `You will receive ${frequency} reports for this establishment.`,
        duration: 5000,
      })
      setDialogOpen(false)
    } catch (error: any) {
      console.error("Error scheduling report:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An unexpected error occurred",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Button variant="outline" className="ml-2 gap-2 bg-white text-black hover:bg-white/90" onClick={handleOpenDialog}>
        <Mail className="h-4 w-4" />
        Schedule a Report
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Schedule Automated Reports</DialogTitle>
            <DialogDescription className="text-gray-400">
              Receive regular analysis reports for this establishment directly to your email.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="frequency" className="text-gray-300">
                Report Frequency
              </Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="weekly" className="text-white hover:bg-gray-700">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      Weekly
                    </div>
                  </SelectItem>
                  <SelectItem value="monthly" className="text-white hover:bg-gray-700">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      Monthly
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-gray-800 p-4 rounded-md border border-gray-700">
              <h4 className="text-sm font-medium text-white mb-2">What you'll receive:</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Sentiment analysis summary</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Key trends and changes since last report</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Actionable insights based on customer feedback</span>
                </li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="border-gray-700 text-white hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleScheduleReport}
              disabled={isSubmitting}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSubmitting ? "Scheduling..." : "Schedule Reports"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
