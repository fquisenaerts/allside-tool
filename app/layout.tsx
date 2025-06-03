import type React from "react"
import "./globals.css"
import { LanguageProvider } from "./contexts/LanguageContext"
import { CustomCursor } from "./components/CustomCursor"

export const metadata = {
  title: "Allside - AI-Powered Review Analysis",
  description: "Analyze customer reviews with AI to gain valuable insights for your business",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <LanguageProvider>
          {children}
          <CustomCursor />
        </LanguageProvider>
      </body>
    </html>
  )
}
