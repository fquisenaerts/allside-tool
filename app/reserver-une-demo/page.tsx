import BookADemoPageClient from "../book-a-demo/components/BookADemoPageClient"
import { getLocalizedUrl } from "@/lib/urlMapping"

export const metadata = {
  title: "Réserver une Démo - Analyse d'Avis IA Allside",
  description:
    "Planifiez une démo personnalisée de la plateforme d'analyse d'avis alimentée par l'IA d'Allside. Découvrez comment notre solution peut bénéficier à votre entreprise.",
  alternates: {
    canonical: getLocalizedUrl("/book-a-demo", "fr"),
    languages: {
      en: getLocalizedUrl("/book-a-demo", "en"),
      fr: getLocalizedUrl("/book-a-demo", "fr"),
    },
  },
}

export default function ReserverUneDemoPage() {
  return <BookADemoPageClient />
}
