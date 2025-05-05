import Link from "next/link"
import { Header } from "../components/Header"
import { Footer } from "../components/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function SimpleSubscribePage() {
  // Direct Stripe link
  const stripeLink = "https://buy.stripe.com/8wM5kpgmA7na9eU4gg"

  return (
    <div className="min-h-screen bg-[#050314] text-white flex flex-col">
      <Header />
      <div className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-12">Choose Your Subscription Plan</h1>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Standard Plan */}
          <Card className="bg-[#0f0a2e] border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Standard Plan</CardTitle>
              <CardDescription className="text-gray-300">Perfect for small businesses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-3xl font-bold">
                €16<span className="text-lg font-normal">/month</span>
              </p>
              <ul className="space-y-2">
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
                  Response generation
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <a href={stripeLink} target="_blank" rel="noopener noreferrer" className="w-full">
                <Button className="w-full bg-white text-black hover:bg-gray-100">Subscribe Now</Button>
              </a>
            </CardFooter>
          </Card>

          {/* Premium Plan */}
          <Card className="bg-[#0f0a2e] border-gray-700 border-2 border-purple-500">
            <CardHeader>
              <div className="bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded absolute top-2 right-2">
                POPULAR
              </div>
              <CardTitle className="text-white text-2xl">Premium Plan</CardTitle>
              <CardDescription className="text-gray-300">For growing businesses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-3xl font-bold">
                €32<span className="text-lg font-normal">/month</span>
              </p>
              <ul className="space-y-2">
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
                  Priority support
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <a href={stripeLink} target="_blank" rel="noopener noreferrer" className="w-full">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">Subscribe Now</Button>
              </a>
            </CardFooter>
          </Card>
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
      <Footer />
    </div>
  )
}
