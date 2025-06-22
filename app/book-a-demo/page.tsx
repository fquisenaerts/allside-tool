import BookADemoPageClient from "./components/BookADemoPageClient"
import { getLocalizedUrl } from "@/lib/urlMapping"

export const metadata = {
  title: "Book a Demo - Allside AI Review Analysis",
  description:
    "Schedule a personalized demo of Allside's AI-powered review analysis platform. Learn how our solution can benefit your business.",
  alternates: {
    canonical: getLocalizedUrl("/book-a-demo", "en"),
    languages: {
      en: getLocalizedUrl("/book-a-demo", "en"),
      fr: getLocalizedUrl("/book-a-demo", "fr"),
    },
  },
}

export default function BookADemoPage() {
  return <BookADemoPageClient />
}
