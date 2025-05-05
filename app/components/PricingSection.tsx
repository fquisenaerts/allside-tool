import Link from "next/link"
import { Button } from "@/components/ui/button"

export function PricingSection() {
  return (
    <section className="py-16 bg-[#0a0521]" id="pricing">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Simple, Transparent Pricing</h2>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Standard Plan */}
          <div className="bg-[#0f0a2e] p-8 rounded-lg border border-gray-700">
            <h3 className="text-2xl font-bold mb-2">Standard Plan</h3>
            <p className="text-gray-400 mb-4">Perfect for small businesses</p>
            <p className="text-3xl font-bold mb-6">
              €16<span className="text-lg font-normal">/month</span>
            </p>
            <ul className="space-y-2 mb-8">
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Up to 5 establishments
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                2,000 reviews per month
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Full sentiment analysis
              </li>
            </ul>
            <Link href="/subscribe">
              <Button className="w-full bg-white text-black hover:bg-gray-100">Get Started</Button>
            </Link>
          </div>

          {/* Premium Plan */}
          <div className="bg-[#0f0a2e] p-8 rounded-lg border-2 border-purple-500 relative">
            <div className="bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded absolute top-2 right-2">
              POPULAR
            </div>
            <h3 className="text-2xl font-bold mb-2">Premium Plan</h3>
            <p className="text-gray-400 mb-4">For growing businesses</p>
            <p className="text-3xl font-bold mb-6">
              €32<span className="text-lg font-normal">/month</span>
            </p>
            <ul className="space-y-2 mb-8">
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Unlimited establishments
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                10,000 reviews per month
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Advanced analytics
              </li>
            </ul>
            <Link href="/subscribe">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">Get Started</Button>
            </Link>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-4">Not ready to commit? Try our free trial first.</p>
          <Link href="/signup?redirect=trial">
            <Button variant="outline" className="border-gray-600 hover:bg-gray-800">
              Start 14-Day Free Trial
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
