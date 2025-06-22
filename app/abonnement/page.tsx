import SubscriptionClientPage from "../subscription/components/SubscriptionClientPage"
import { getLocalizedUrl } from "@/lib/urlMapping"

export const metadata = {
  title: "Mon Abonnement - Compte & Facturation Allside",
  description:
    "Gérez votre plan d'abonnement Allside, consultez votre statut actuel et mettez à niveau vos fonctionnalités pour une analyse d'avis avancée. Accédez aux détails de facturation et aux informations sur le plan.",
  alternates: {
    canonical: getLocalizedUrl("/subscription", "fr"),
    languages: {
      en: getLocalizedUrl("/subscription", "en"),
      fr: getLocalizedUrl("/subscription", "fr"),
    },
  },
}

export default function AbonnementPage() {
  return <SubscriptionClientPage />
}
