import { Mona_Sans } from "next/font/google"
import { cn } from "@/lib/utils"
import "./globals.css"
import type React from "react"

const monaSans = Mona_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata = {
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-[#050314] font-sans antialiased", monaSans.variable)}>{children}</body>
    </html>
  )
}
