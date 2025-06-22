import ProfileClientPage from "./components/ProfileClientPage"
import { getLocalizedUrl } from "@/lib/urlMapping"

export const metadata = {
  title: "My Profile - Allside Account Settings",
  description:
    "Manage your Allside account profile, personal information, and subscription settings. Update your details and view your plan status.",
  alternates: {
    canonical: getLocalizedUrl("/profile", "en"),
    languages: {
      en: getLocalizedUrl("/profile", "en"),
      fr: getLocalizedUrl("/profile", "fr"),
    },
  },
}

export default function ProfilePage() {
  return <ProfileClientPage />
}
