import ProfileClientPage from "../profile/components/ProfileClientPage"
import { getLocalizedUrl } from "@/lib/urlMapping"

export const metadata = {
  title: "Mon Profil - Paramètres de Compte Allside",
  description:
    "Gérez le profil de votre compte Allside, vos informations personnelles et les paramètres d'abonnement. Mettez à jour vos coordonnées et consultez le statut de votre plan.",
  alternates: {
    canonical: getLocalizedUrl("/profile", "fr"),
    languages: {
      en: getLocalizedUrl("/profile", "en"),
      fr: getLocalizedUrl("/profile", "fr"),
    },
  },
}

export default function ProfilPage() {
  return <ProfileClientPage />
}
