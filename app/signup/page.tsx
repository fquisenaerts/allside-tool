import SignupClientPage from "./components/SignupClientPage"
import { getLocalizedUrl } from "@/lib/urlMapping"

export const metadata = {
  title: "Sign Up for Allside - Start Your AI Review Analysis Journey",
  description:
    "Create an Allside account to start analyzing customer reviews with advanced AI and gain valuable business insights.",
  alternates: {
    canonical: getLocalizedUrl("/signup", "en"),
    languages: {
      en: getLocalizedUrl("/signup", "en"),
      fr: getLocalizedUrl("/signup", "fr"),
    },
  },
}

export default function Signup() {
  return <SignupClientPage />
}
