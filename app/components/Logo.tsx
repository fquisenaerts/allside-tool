import Image from "next/image"
import Link from "next/link"

export function Logo() {
  return (
    <Link href="/" className="cursor-pointer">
      <Image src="/images/allside-logo-dark.png" alt="Allside Logo" width={120} height={40} priority />
    </Link>
  )
}
