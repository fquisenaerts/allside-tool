import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "./components/Header"
import { Footer } from "./components/Footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050314] text-white">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent"></div>
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Welcome to Our Review Management Tool</h1>
            <p className="text-lg text-gray-400 mb-8">
              Analyze and respond to customer reviews with AI-powered precision
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Button asChild className="bg-white text-black hover:bg-gray-100">
                <Link href="/login?redirect=payment">Start Analyzing</Link>
              </Button>
              <Button asChild className="bg-white text-black hover:bg-gray-100">
                <Link href="#">Schedule Demo</Link>
              </Button>
            </div>

            {/* Full-width auto-playing looping video */}
            <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw] mt-12">
              <div className="aspect-video w-full">
                <iframe
                  src="https://www.youtube.com/embed/gKwU06-ZrdY?autoplay=1&mute=1&controls=0&loop=1&playlist=gKwU06-ZrdY&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&fs=0&disablekb=1&origin=https://allside.vercel.app"
                  title="Product Demo"
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
                {/* Transparent overlay to prevent interaction */}
                <div className="absolute inset-0 bg-transparent"></div>
              </div>
            </div>
          </div>

          {/* Hero Image - Removed as requested to replace with video */}
        </div>
      </section>

      {/* Product Journey Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent"></div>
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="text-indigo-500 text-sm font-medium mb-2">Product Workflow</div>
            <h2 className="text-4xl font-bold mb-4">Map your product journey</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Simple and elegant interface to start collaborating with your team in seconds. It seamlessly integrates
              with your code and your favorite programming languages.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature Card 1 */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 relative overflow-hidden group hover:border-indigo-500/50 transition-all duration-300">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-600/10 rounded-full group-hover:bg-indigo-600/20 transition-all duration-300"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-indigo-900/50 rounded-lg flex items-center justify-center mb-4">
                  <div className="w-6 h-6 text-indigo-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">AI-Powered Analysis</h3>
                <p className="text-gray-400 text-sm">
                  Instantly analyze sentiment and key themes in customer reviews across all platforms.
                </p>
              </div>
            </div>

            {/* Feature Card 2 */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 relative overflow-hidden group hover:border-indigo-500/50 transition-all duration-300">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-600/10 rounded-full group-hover:bg-indigo-600/20 transition-all duration-300"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-indigo-900/50 rounded-lg flex items-center justify-center mb-4">
                  <div className="w-6 h-6 text-indigo-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">Smart Classification</h3>
                <p className="text-gray-400 text-sm">
                  Automatically categorize reviews by platform, product, or custom criteria.
                </p>
              </div>
            </div>

            {/* Feature Card 3 */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 relative overflow-hidden group hover:border-indigo-500/50 transition-all duration-300">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-600/10 rounded-full group-hover:bg-indigo-600/20 transition-all duration-300"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-indigo-900/50 rounded-lg flex items-center justify-center mb-4">
                  <div className="w-6 h-6 text-indigo-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="12 2 2 7 12 12 22 7 12 2" />
                      <polyline points="2 17 12 22 22 17" />
                      <polyline points="2 12 12 17 22 12" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">Scalable Processing</h3>
                <p className="text-gray-400 text-sm">
                  Handle millions of reviews with our robust, scalable infrastructure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Product Teams Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent"></div>
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Features built for efficiency</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              We provide all the tools you need to analyze, respond to, and manage customer reviews at scale.
            </p>
          </div>

          {/* Floating Logos Cloud */}
          <div className="flex flex-wrap justify-center items-center gap-12 mb-20 max-w-4xl mx-auto py-8">
            <div
              className="w-20 h-20 flex items-center justify-center floating-logo bg-white rounded-full shadow-md p-2"
              style={{ animationDelay: "0s", transform: "translateX(-20px)" }}
            >
              <img
                src="/images/google-my-business-logo.png"
                alt="Google My Business"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div
              className="w-16 h-16 flex items-center justify-center floating-logo bg-white rounded-full shadow-md p-2"
              style={{ animationDelay: "0.5s", transform: "translateY(15px)" }}
            >
              <img
                src="/images/tripadvisor-logo.png"
                alt="TripAdvisor"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div
              className="w-14 h-14 flex items-center justify-center floating-logo bg-white rounded-full shadow-md p-2"
              style={{ animationDelay: "1s", transform: "translateX(25px) translateY(-10px)" }}
            >
              <img src="/images/booking-logo.svg" alt="Booking.com" className="max-h-full max-w-full object-contain" />
            </div>
            <div
              className="w-20 h-20 flex items-center justify-center floating-logo bg-white rounded-full shadow-md p-2"
              style={{ animationDelay: "1.5s", transform: "translateY(20px) translateX(-15px)" }}
            >
              <img
                src="/images/trustpilot-logo.png"
                alt="Trustpilot"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div
              className="w-20 h-20 flex items-center justify-center floating-logo bg-white rounded-full shadow-md p-2"
              style={{ animationDelay: "2s", transform: "translateX(10px) translateY(-25px)" }}
            >
              <img src="/images/airbnb-logo.png" alt="Airbnb" className="max-h-full max-w-full object-contain" />
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-x-8 gap-y-16">
            {/* Feature 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <div className="w-5 h-5 text-indigo-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">AI-Powered Analysis</h3>
                <p className="text-gray-400 text-sm">
                  Instantly analyze sentiment and key themes in customer reviews across all platforms.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <div className="w-5 h-5 text-indigo-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Smart Classification</h3>
                <p className="text-gray-400 text-sm">
                  Automatically categorize reviews by platform, product, or custom criteria.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <div className="w-5 h-5 text-indigo-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Scalable Processing</h3>
                <p className="text-gray-400 text-sm">
                  Handle millions of reviews with our robust, scalable infrastructure.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <div className="w-5 h-5 text-indigo-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Automated Response</h3>
                <p className="text-gray-400 text-sm">
                  Generate tailored, empathetic responses to critical feedback using advanced AI.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <div className="w-5 h-5 text-indigo-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Data Security</h3>
                <p className="text-gray-400 text-sm">
                  Enterprise-grade security to protect sensitive customer data and insights.
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <div className="w-5 h-5 text-indigo-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Custom Reporting</h3>
                <p className="text-gray-400 text-sm">
                  Export comprehensive reports in various formats (PDF, Excel, API) for deeper insights.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to transform your review management?</h2>
          <p className="text-gray-400 text-lg mb-12">
            Start analyzing and responding to customer reviews with AI-powered precision. No credit card required.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild className="bg-white text-black hover:bg-gray-100">
              <Link href="/login?redirect=payment">Start Analyzing</Link>
            </Button>
            <Button asChild className="bg-white text-black hover:bg-gray-100">
              <Link href="#">Schedule Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-[#080520]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Choose the plan that works best for your business needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Trial */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 relative overflow-hidden group hover:border-indigo-500/50 transition-all duration-300">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-600/10 rounded-full group-hover:bg-indigo-600/20 transition-all duration-300"></div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">Free Trial</h3>
                <p className="text-gray-400 mb-6">14 days</p>
                <div className="text-3xl font-bold mb-6">€0</div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Analysis of 1 establishment
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Up to 200 reviews analysed
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Full functionality
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    No bank card required
                  </li>
                </ul>
                <Button asChild className="bg-white text-black hover:bg-gray-100">
                  <Link href="/login?redirect=trial">Start Free Trial</Link>
                </Button>
              </div>
            </div>

            {/* Standard Plan */}
            <div className="bg-gray-900/50 border border-indigo-500 rounded-xl p-8 relative overflow-hidden group hover:border-indigo-400 transition-all duration-300 transform scale-105 shadow-lg">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-600/20 rounded-full group-hover:bg-indigo-600/30 transition-all duration-300"></div>
              <div className="absolute top-0 right-0 bg-indigo-500 text-white px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm font-medium">
                Popular
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">Standard</h3>
                <p className="text-gray-400 mb-6">Per establishment</p>
                <div className="text-3xl font-bold mb-6">
                  €16<span className="text-lg font-normal text-gray-400">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    1 establishment record analysed
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Unlimited reviews
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Sentiment analysis
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Most frequent keywords
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    ENPS, advantages/disadvantages
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Response generated for each review
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    CSV export
                  </li>
                </ul>
                <Button asChild className="bg-white text-black hover:bg-gray-100">
                  <Link href="/login?redirect=payment">Get Started</Link>
                </Button>
              </div>
            </div>

            {/* Tailor-made Plan */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 relative overflow-hidden group hover:border-indigo-500/50 transition-all duration-300">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-600/10 rounded-full group-hover:bg-indigo-600/20 transition-all duration-300"></div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">Tailor-made Plan</h3>
                <p className="text-gray-400 mb-6">For larger businesses</p>
                <div className="text-3xl font-bold mb-6">Custom</div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    10 establishments or more
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Consolidated multi-file reports
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    API / CRM integration
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Multi-user access
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Comparative analysis between two establishments
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Tool training (optional)
                  </li>
                </ul>
                <Button asChild className="bg-white text-black hover:bg-gray-100">
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
