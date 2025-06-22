import MyEstablishmentsClientPage from "../my-establishments/components/MyEstablishmentsClientPage"
import { getLocalizedUrl } from "@/lib/urlMapping"

export const metadata = {
  title: "Mes Établissements - Analyse d'Avis Allside",
  description:
    "Consultez et gérez tous vos établissements analysés. Accédez à des rapports détaillés, effectuez des analyses en masse et organisez vos emplacements commerciaux.",
  alternates: {
    canonical: getLocalizedUrl("/my-establishments", "fr"),
    languages: {
      en: getLocalizedUrl("/my-establishments", "en"),
      fr: getLocalizedUrl("/my-establishments", "fr"),
    },
  },
}

export default function MesEtablissementsPage() {
  return <MyEstablishmentsClientPage />
}
