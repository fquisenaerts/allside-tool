import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { LanguageProvider } from "./contexts/LanguageContext"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "./AuthProvider"
import { getAlternateUrls } from "@/lib/urlMapping"
import { headers } from "next/headers"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Allside - AI-Powered Review Analysis for Businesses",
  description:
    "Unlock actionable insights from customer reviews with Allside's advanced AI. Analyze sentiment, identify key themes, and improve customer satisfaction for your business.",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = headers()
  const pathname = headersList.get("x-pathname") || "/"

  const alternateLinks = getAlternateUrls(pathname)

  return (
    <html lang="en">
      <head>
        {alternateLinks.map((link) => (
          <link key={link.hreflang} rel="alternate" hrefLang={link.hreflang} href={link.href} />
        ))}
      </head>
      <body>
        <LanguageProvider>
          <AuthProvider>{children}</AuthProvider>
        </LanguageProvider>
        <Toaster />
      </body>
    </html>
  )
}
