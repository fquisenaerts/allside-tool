import MyEstablishmentsClientPage from "./components/MyEstablishmentsClientPage"
import { getLocalizedUrl } from "@/lib/urlMapping"

export const metadata = {
  title: "My Establishments - Allside Review Analysis",
  description:
    "View and manage all your analyzed establishments. Access detailed reports, perform bulk analysis, and organize your business locations.",
  alternates: {
    canonical: getLocalizedUrl("/my-establishments", "en"),
    languages: {
      en: getLocalizedUrl("/my-establishments", "en"),
      fr: getLocalizedUrl("/my-establishments", "fr"),
    },
  },
}

export default function MyEstablishmentsPage() {
  return <MyEstablishmentsClientPage />
}
