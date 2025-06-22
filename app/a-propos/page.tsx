import AboutPageClient from "../about/components/AboutPageClient"
import { getLocalizedUrl } from "@/lib/urlMapping"

export const metadata = {
  title: "À Propos d'Allside - Notre Mission & Technologie IA pour l'Analyse d'Avis",
  description:
    "Découvrez la mission d'Allside pour aider les entreprises avec l'IA pour l'analyse d'avis clients. Découvrez nos objectifs, nos valeurs et la technologie avancée derrière notre plateforme.",
  alternates: {
    canonical: getLocalizedUrl("/about", "fr"),
    languages: {
      en: getLocalizedUrl("/about", "en"),
      fr: getLocalizedUrl("/about", "fr"),
    },
  },
}

export default function AProposPage() {
  return <AboutPageClient />
}
