import ContactPageClient from "./components/ContactPageClient"
import { getLocalizedUrl } from "@/lib/urlMapping"
import { Header } from "@/app/components/Header" // Import Header
import { Footer } from "@/app/components/Footer" // Import Footer

export const metadata = {
  title: "Contact Allside - Get in Touch for Review Analysis Support",
  description:
    "Have questions about Allside's AI review analysis platform? Contact our support team, sales, or schedule a demo. Find our contact information and business hours here.",
  alternates: {
    canonical: getLocalizedUrl("/contact", "en"),
    languages: {
      en: getLocalizedUrl("/contact", "en"),
      fr: getLocalizedUrl("/contact", "fr"),
    },
  },
}

export default function ContactPage() {
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
