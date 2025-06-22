import AboutPageClient from "./components/AboutPageClient"
import { getLocalizedUrl } from "@/lib/urlMapping"

export const metadata = {
  title: "About Allside - Our Mission & AI Technology for Review Analysis",
  description:
    "Learn about Allside's mission to empower businesses with AI-driven customer review insights. Discover our objectives, values, and the advanced technology behind our platform.",
  alternates: {
    canonical: getLocalizedUrl("/about", "en"),
    languages: {
      en: getLocalizedUrl("/about", "en"),
      fr: getLocalizedUrl("/about", "fr"),
    },
  },
}

export default function AboutPage() {
  return <AboutPageClient />
}
