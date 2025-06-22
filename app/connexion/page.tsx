import LoginClient from "../login/components/LoginClient"
import { getLocalizedUrl } from "@/lib/urlMapping"

export const metadata = {
  title: "Connexion à Allside - Accédez à Votre Tableau de Bord d'Analyse d'Avis",
  description:
    "Connectez-vous à votre compte Allside pour accéder à votre tableau de bord d'analyse d'avis alimenté par l'IA et gérer vos établissements.",
  alternates: {
    canonical: getLocalizedUrl("/login", "fr"),
    languages: {
      en: getLocalizedUrl("/login", "en"),
      fr: getLocalizedUrl("/login", "fr"),
    },
  },
}

export default function ConnexionPage() {
  return <LoginClient />
}
