import SubscriptionClientPage from "./components/SubscriptionClientPage"
import { getLocalizedUrl } from "@/lib/urlMapping"

export const metadata = {
  title: "My Subscription - Allside Account & Billing",
  description:
    "Manage your Allside subscription plan, view your current status, and upgrade your features for advanced review analysis. Access billing details and plan information.",
  alternates: {
    canonical: getLocalizedUrl("/subscription", "en"),
    languages: {
      en: getLocalizedUrl("/subscription", "en"),
      fr: getLocalizedUrl("/subscription", "fr"),
    },
  },
}

export default function SubscriptionPage() {
  return <SubscriptionClientPage />
}
