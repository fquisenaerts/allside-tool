"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { saveEstablishment } from "../actions/establishments"
import { BookmarkPlus } from "lucide-react"
import { ReportSubscription } from "./ReportSubscription"

interface SaveEstablishmentProps {
  url: string
  userId: string
  analysisType: string | null
  analysisResults: any
}

export function SaveEstablishment({ url, userId, analysisType, analysisResults }: SaveEstablishmentProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)

    try {
      // Validate userId is present
      if (!userId) {
        setError("User ID is missing. Please try logging in again.")
        setIsSaving(false)
        return
      }

      // Extract name from URL or use a default
      let name = "Unnamed Establishment"

      if (url.includes("google.com/maps")) {
        // Try to extract business name from Google Maps URL
        const match = url.match(/\/place\/([^/]+)/)
        if (match && match[1]) {
          name = decodeURIComponent(match[1].split("+").join(" ").split("@")[0])
        }
      } else if (url.includes("tripadvisor.com")) {
        // Try to extract hotel/restaurant name from TripAdvisor URL
        const match = url.match(/Reviews-[^-]+-([^-]+)/)
        if (match && match[1]) {
          name = match[1].split("_").join(" ")
        }
      } else if (url.includes("booking.com")) {
        // Try to extract hotel name from Booking.com URL
        const match = url.match(/\/hotel\/[^/]+\/([^/.]+)/)
        if (match && match[1]) {
          name = match[1].split("-").join(" ")
        }
      }

      // Clean up the name
      name = name.charAt(0).toUpperCase() + name.slice(1)

      // Prepare data for saving
      const establishmentData = {
        name,
        url,
        userId: userId,
        user_id: userId,
        type: analysisType || "Unknown",
        analysisResults: analysisResults,
      }

      console.log("Saving establishment with data:", {
        name,
        url,
        userId,
        type: analysisType || "Unknown",
        hasResults: !!analysisResults,
      })

      // Save to database
      const result = await saveEstablishment(establishmentData)

      if (result.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000) // Reset after 3 seconds
      } else {
        setError(result.error || "Failed to save establishment")
      }
    } catch (err) {
      console.error("Error saving establishment:", err)
      setError("An unexpected error occurred")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Button onClick={handleSave} disabled={isSaving || saved} className="gap-2 bg-white text-black hover:bg-white/90">
        <BookmarkPlus className="h-4 w-4" />
        {isSaving ? "Saving..." : saved ? "Saved!" : "Add to My Establishments"}
      </Button>

      <ReportSubscription />

      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
    </div>
  )
}
