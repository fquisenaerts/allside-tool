import AnalyzePageClient from "../analyze/components/AnalyzePageClient"
import { getLocalizedUrl } from "@/lib/urlMapping"

export const metadata = {
  title: "Analyser les Avis - Analyse d'Avis IA Allside",
  description:
    "Téléchargez du texte, des fichiers ou des URL pour obtenir une analyse de sentiment alimentée par l'IA, l'extraction de thèmes et des informations exploitables à partir de vos avis clients. Prend en charge Google My Business, TripAdvisor, Booking.com, Trustpilot et Airbnb.",
  alternates: {
    canonical: getLocalizedUrl("/analyze", "fr"),
    languages: {
      en: getLocalizedUrl("/analyze", "en"),
      fr: getLocalizedUrl("/analyze", "fr"),
    },
  },
}

export default function AnalyserPage() {
  return <AnalyzePageClient />
}
