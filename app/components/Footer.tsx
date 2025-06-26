"use client"

import Link from "next/link"
import { useTranslation } from "../hooks/useTranslation"
import { Logo } from "./Logo" // Import the Logo component
import { getLocalizedUrl } from "@/lib/urlMapping"
import { useLanguage } from "@/app/contexts/LanguageContext"
import { Linkedin } from "lucide-react" // Import the LinkedIn icon

export function Footer() {
  const { t } = useTranslation()
  const { language } = useLanguage()

  return (
    <footer className="py-16 bg-[#050314] text-white border-t border-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="flex items-center">
            {" "}
            {/* Container for the logo */}
            <Logo />
          </div>
          <div>
            <h3 className="text-sm font-normal mb-4">{t("footer.product")}</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href={getLocalizedUrl("/", language) + "#features"}
                  className="text-sm text-gray-400 hover:text-white"
                >
                  {t("footer.features")}
                </Link>
              </li>
              <li>
                <Link
                  href={getLocalizedUrl("/", language) + "#pricing"}
                  className="text-sm text-gray-400 hover:text-white"
                >
                  {t("footer.pricing")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-normal mb-4">{t("footer.company")}</h3>
            <ul className="space-y-3">
              <li>
                <Link href={getLocalizedUrl("/about", language)} className="text-sm text-gray-400 hover:text-white">
                  {t("footer.aboutUs")}
                </Link>
              </li>
              {/* Added Contact link */}
              <li>
                <Link href={getLocalizedUrl("/contact", language)} className="text-sm text-gray-400 hover:text-white">
                  {t("footer.contact")}
                </Link>
              </li>
              {/* Added Menu link */}
              <li>
                <Link href={getLocalizedUrl("/analyze", language)} className="text-sm text-gray-400 hover:text-white">
                  {t("footer.menu")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-normal mb-4">{t("footer.legal")}</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm text-gray-400 hover:text-white">
                  {t("footer.privacyPolicy")}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-400 hover:text-white">
                  {t("footer.termsOfService")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        {/* LinkedIn Logo Section */}
        <div className="flex justify-center space-x-4 mb-8">
          <Link
            href="https://www.linkedin.com/company/allside-fr/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white"
          >
            <Linkedin className="h-6 w-6" />
            <span className="sr-only">LinkedIn</span>
          </Link>
        </div>
        <div className="text-center text-sm text-gray-400">{t("footer.copyright")}</div>
      </div>
    </footer>
  )
}

export default Footer
