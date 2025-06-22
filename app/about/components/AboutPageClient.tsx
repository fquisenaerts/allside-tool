"use client"

import { useTranslation } from "@/app/hooks/useTranslation"
import { Header } from "@/app/components/Header" // Import Header
import { Footer } from "@/app/components/Footer" // Import Footer
import Image from "next/image"

export default function AboutPageClient() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Removed: <h1 className="text-4xl md:text-6xl font-bold mb-6">{t("about.hero.title")}</h1> */}
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">{t("about.hero.subtitle")}</p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 bg-[#050314]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">{t("about.mission.title")}</h2>
                <div className="space-y-4 text-lg text-gray-300">
                  <p>{t("about.mission.description1")}</p>
                  <p>{t("about.mission.description2")}</p>
                  <p>{t("about.mission.description3")}</p>
                </div>
              </div>
              <div className="relative">
                <Image
                  src="/images/data-analysis-dashboard-people.png"
                  alt={t("about.mission.imageAlt")}
                  width={600}
                  height={400}
                  className="rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Objectives Section */}
        <section className="py-16 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">{t("about.objectives.title")}</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">{t("about.objectives.subtitle")}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-gray-800 rounded-lg shadow-md border border-gray-700">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{t("about.objectives.efficiency.title")}</h3>
                <p className="text-gray-300">{t("about.objectives.efficiency.description")}</p>
              </div>

              <div className="text-center p-6 bg-gray-800 rounded-lg shadow-md border border-gray-700">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{t("about.objectives.insights.title")}</h3>
                <p className="text-gray-300">{t("about.objectives.insights.description")}</p>
              </div>

              <div className="text-center p-6 bg-gray-800 rounded-lg shadow-md border border-gray-700">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{t("about.objectives.satisfaction.title")}</h3>
                <p className="text-gray-300">{t("about.objectives.satisfaction.description")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="py-16 bg-[#050314]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <Image
                  src="/images/ai-technology-people.png"
                  alt={t("about.technology.imageAlt")}
                  width={600}
                  height={400}
                  className="rounded-lg shadow-lg"
                />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">{t("about.technology.title")}</h2>
                <div className="space-y-4 text-lg text-gray-300 mb-6">
                  <p>{t("about.technology.description1")}</p>
                  <p>{t("about.technology.description2")}</p>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-300">{t("about.technology.feature1")}</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-300">{t("about.technology.feature2")}</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-300">{t("about.technology.feature3")}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Removed: CTA Section */}
        {/*
        <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">{t("about.cta.title")}</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">{t("about.cta.description")}</p>
            <a
              href="/analyze"
              className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {t("about.cta.button")}
            </a>
          </div>
        </section>
        */}
      </main>
      <Footer />
    </div>
  )
}
