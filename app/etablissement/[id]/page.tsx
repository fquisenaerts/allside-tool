import EstablishmentDetailPageClient from "../../establishment/[id]/components/EstablishmentDetailPageClient"
import { getLocalizedUrl } from "@/lib/urlMapping"

export const metadata = {
  title: "Analyse d'Établissement - Insights d'Avis Allside",
  description:
    "Consultez l'analyse détaillée alimentée par l'IA pour un établissement spécifique. Explorez les tendances de sentiment, les thèmes clés et les informations exploitables à partir des avis clients.",
  alternates: {
    canonical: ({ params }: { params: { id: string } }) => getLocalizedUrl(`/establishment/${params.id}`, "fr"),
    languages: {
      en: ({ params }: { params: { id: string } }) => getLocalizedUrl(`/establishment/${params.id}`, "en"),
      fr: ({ params }: { params: { id: string } }) => getLocalizedUrl(`/establishment/${params.id}`, "fr"),
    },
  },
}

export default function EtablissementDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  return <EstablishmentDetailPageClient id={id} />
}
