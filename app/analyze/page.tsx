import AnalyzePageClient from "./components/AnalyzePageClient"
import { getLocalizedUrl } from "@/lib/urlMapping"

export const metadata = {
  title: "Analyze Reviews - Allside AI Review Analysis",
  description:
    "Upload text, files, or URLs to get AI-powered sentiment analysis, theme extraction, and actionable insights from your customer reviews. Supports Google My Business, TripAdvisor, Booking.com, Trustpilot, and Airbnb.",
  alternates: {
    canonical: getLocalizedUrl("/analyze", "en"),
    languages: {
      en: getLocalizedUrl("/analyze", "en"),
      fr: getLocalizedUrl("/analyze", "fr"),
    },
  },
}

export default function AnalyzePage() {
  return <AnalyzePageClient />
}
