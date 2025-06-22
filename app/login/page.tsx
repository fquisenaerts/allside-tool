import LoginClient from "./components/LoginClient"
import { getLocalizedUrl } from "@/lib/urlMapping"

export const metadata = {
  title: "Login to Allside - Access Your Review Analysis Dashboard",
  description:
    "Log in to your Allside account to access your AI-powered review analysis dashboard and manage your establishments.",
  alternates: {
    canonical: getLocalizedUrl("/login", "en"),
    languages: {
      en: getLocalizedUrl("/login", "en"),
      fr: getLocalizedUrl("/login", "fr"),
    },
  },
}

export default function Login() {
  return <LoginClient />
}
