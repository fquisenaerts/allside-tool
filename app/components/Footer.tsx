import Link from "next/link"
import { useTranslation } from "@/app/hooks/useTranslation"

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="py-16 bg-[#050314] text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-sm font-normal mb-4">{t("footer.product")}</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm text-gray-400 hover:text-white">
                  {t("footer.features")}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-400 hover:text-white">
                  {t("footer.pricing")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-normal mb-4">{t("footer.company")}</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm text-gray-400 hover:text-white">
                  {t("footer.aboutUs")}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-400 hover:text-white">
                  {t("footer.careers")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-normal mb-4">{t("footer.resources")}</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm text-gray-400 hover:text-white">
                  {t("footer.blog")}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-400 hover:text-white">
                  {t("footer.documentation")}
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
        <div className="text-center text-sm text-gray-400">{t("footer.copyright")}</div>
      </div>
    </footer>
  )
}

export default Footer
