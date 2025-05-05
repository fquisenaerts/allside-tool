import Link from "next/link"

export function Footer() {
  return (
    <footer className="py-16 bg-[#050314] text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-sm font-normal mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm text-gray-400 hover:text-white">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-400 hover:text-white">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-normal mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm text-gray-400 hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-400 hover:text-white">
                  Careers
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-normal mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm text-gray-400 hover:text-white">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-400 hover:text-white">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-normal mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm text-gray-400 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-400 hover:text-white">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="text-center text-sm text-gray-400">© 2023 Your Company Name. All rights reserved.</div>
      </div>
    </footer>
  )
}

export default Footer
