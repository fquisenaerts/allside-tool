"use client"

import Image from "next/image"
import Link from "next/link"

export function Logo({ className = "" }: { className?: string }) {
  // Always use the dark background version of the logo
  const logoSrc = "/images/allside-logo-dark.png"

  return (
    <Link href="/" className={`flex items-center ${className}`}>
      <Image src={logoSrc || "/placeholder.svg"} alt="ALLSIDE" width={150} height={50} className="h-auto" priority />
    </Link>
  )
}
