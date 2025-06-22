import SignupClientPage from "../signup/components/SignupClientPage"
import { getLocalizedUrl } from "@/lib/urlMapping"

export const metadata = {
  title: "Inscription à Allside - Commencez Votre Parcours d'Analyse d'Avis IA",
  description:
    "Créez un compte Allside pour commencer à analyser les avis clients avec une IA avancée et obtenir des informations commerciales précieuses.",
  alternates: {
    canonical: getLocalizedUrl("/signup", "fr"),
    languages: {
      en: getLocalizedUrl("/signup", "en"),
      fr: getLocalizedUrl("/signup", "fr"),
    },
  },
}

export default function InscriptionPage() {
  return <SignupClientPage />
}
