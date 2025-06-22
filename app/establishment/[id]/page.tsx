import EstablishmentDetailPageClient from "./components/EstablishmentDetailPageClient"
import { getLocalizedUrl } from "@/lib/urlMapping"

export const metadata = {
  title: "Establishment Analysis - Allside Review Insights",
  description:
    "View detailed AI-powered analysis for a specific establishment. Explore sentiment trends, key themes, and actionable insights from customer reviews.",
  alternates: {
    canonical: ({ params }: { params: { id: string } }) => getLocalizedUrl(`/establishment/${params.id}`, "en"),
    languages: {
      en: ({ params }: { params: { id: string } }) => getLocalizedUrl(`/establishment/${params.id}`, "en"),
      fr: ({ params }: { params: { id: string } }) => getLocalizedUrl(`/establishment/${params.id}`, "fr"),
    },
  },
}

export default function EstablishmentDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  return <EstablishmentDetailPageClient id={id} />
}
