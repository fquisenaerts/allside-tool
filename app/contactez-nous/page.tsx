import ContactPageClient from "../contact/components/ContactPageClient"
import { getLocalizedUrl } from "@/lib/urlMapping"
import { Header } from "@/app/components/Header" // Import Header
import { Footer } from "@/app/components/Footer" // Import Footer

export const metadata = {
  title: "Contactez Allside - Contactez-nous pour le Support d'Analyse d'Avis",
  description:
    "Vous avez des questions sur la plateforme d'analyse d'avis IA d'Allside ? Contactez notre équipe de support, nos ventes, ou planifiez une démo. Trouvez nos coordonnées et nos heures d'ouverture ici.",
  alternates: {
    canonical: getLocalizedUrl("/contact", "fr"),
    languages: {
      en: getLocalizedUrl("/contact", "en"),
      fr: getLocalizedUrl("/contact", "fr"),
    },
  },
}

export default function ContactezNousPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#050314]">
      <Header />
      <main className="flex-1">
        <ContactPageClient />
      </main>
      <Footer />
    </div>
  )
}
