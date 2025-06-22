"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/app/hooks/useTranslation"
import { getLocalizedUrl } from "@/lib/urlMapping"
import { useLanguage } from "@/app/contexts/LanguageContext"

export default function BookADemoPageClient() {
  const { t } = useTranslation()
  const { language } = useLanguage()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <Card className="w-[450px] mx-auto bg-gray-800 text-white">
        <CardHeader>
          <CardTitle className="text-white">{t("bookADemo.title")}</CardTitle>
          <CardDescription className="text-gray-300">{t("bookADemo.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-200">
            {t("bookADemo.contactInfo")}{" "}
            <a href="mailto:info@allside.com" className="text-blue-400 hover:underline">
              info@allside.com
            </a>{" "}
            {t("bookADemo.orCall")} <span className="font-medium">+1 (123) 456-7890</span>.
          </p>
          <Link href={getLocalizedUrl("/signup", language)} passHref>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">{t("bookADemo.backToSignup")}</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
