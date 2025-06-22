"use client"

import Link from "next/link"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Header } from "@/app/components/Header"
import { Footer } from "@/app/components/Footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SentimentPieChart } from "@/app/components/SentimentPieChart"
import { EmotionsBarChart } from "@/app/components/EmotionsBarChart"
import { KeywordCloud } from "@/app/components/KeywordCloud"
import { StrengthsWeaknessesBarChart } from "@/app/components/StrengthsWeaknessesBarChart"
import { ReviewSummaryTable } from "@/app/components/ReviewSummaryTable"
import { ToneBarChart } from "@/app/components/ToneBarChart"
import { AnalysisSummaryCards } from "@/app/components/AnalysisSummaryCards"
import { useTranslation } from "@/app/hooks/useTranslation"
import { getLocalizedUrl } from "@/lib/urlMapping"
import { useLanguage } from "@/app/contexts/LanguageContext"

export default function EstablishmentDetailPageClient({ id }: { id: string }) {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const router = useRouter()
  const [establishment, setEstablishment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetchEstablishment(id as string)
    }
  }, [id])

  const fetchEstablishment = async (establishmentId: string) => {
    try {
      setLoading(true)

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error(t("establishment.errors.notLoggedIn"))
      }

      // Fetch establishment
      const { data, error } = await supabase
        .from("establishments")
        .select("*")
        .eq("id", establishmentId)
        .eq("user_id", user.id)
        .single()

      if (error) throw error

      if (!data) {
        throw new Error(t("establishment.errors.notFound"))
      }

      setEstablishment(data)
    } catch (error: any) {
      console.error("Error fetching establishment:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Calculate average rating from review data
  const calculateAverageRating = () => {
    if (!establishment?.analysis_results?.reviewSummary || establishment.analysis_results.reviewSummary.length === 0) {
      return 0
    }

    const ratings = establishment.analysis_results.reviewSummary.map((r: any) => r.score * 5)
    const sum = ratings.reduce((total: number, rating: number) => total + rating, 0)
    return sum / ratings.length
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#050314]">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="w-full mx-auto mb-8 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => router.push(getLocalizedUrl("/my-establishments", language))}
            className="gap-2 text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("establishment.backToMyEstablishments")}
          </Button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : establishment ? (
          <div className="space-y-6">
            <h1 className="text-4xl font-bold mb-4 text-white">{establishment.name || t("establishment.unnamed")}</h1>
            <p className="text-xl text-gray-400 mb-8">
              {establishment.type} • {t("establishment.savedOn")}{" "}
              {new Date(establishment.created_at).toLocaleDateString(language === "fr" ? "fr-FR" : "en-US")}
            </p>

            <div className="mt-8 bg-white p-6 rounded-lg w-full">
              <h2 className="text-2xl font-bold mb-4">{t("establishment.analysisResults")}</h2>

              {establishment.analysis_results && (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  {(() => {
                    const avgRating = calculateAverageRating()
                    const sentimentScore = (avgRating / 5) * 100
                    return (
                      <AnalysisSummaryCards
                        totalReviews={establishment.analysis_results.reviewCount}
                        averageRating={avgRating}
                        sentimentScore={sentimentScore}
                      />
                    )
                  })()}

                  {/* Sentiment Pie Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("analyze.results.cards.sentiment.title")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <SentimentPieChart
                        data={[
                          {
                            name: t("analyze.results.sentiment.positive"),
                            value: establishment.analysis_results.sentiment.positive,
                          },
                          {
                            name: t("analyze.results.sentiment.negative"),
                            value: establishment.analysis_results.sentiment.negative,
                          },
                          {
                            name: t("analyze.results.sentiment.neutral"),
                            value: establishment.analysis_results.sentiment.neutral,
                          },
                        ]}
                        reviewCount={establishment.analysis_results.reviewCount}
                        topStrengths={establishment.analysis_results.strengths}
                        topWeaknesses={establishment.analysis_results.weaknesses}
                      />
                    </CardContent>
                  </Card>

                  {/* Tone Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("analyze.results.cards.tone.title")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ToneBarChart
                        data={[
                          {
                            name: t("analyze.results.sentiment.positive"),
                            value: establishment.analysis_results.sentiment.positive,
                          },
                          {
                            name: t("analyze.results.sentiment.neutral"),
                            value: establishment.analysis_results.sentiment.neutral,
                          },
                          {
                            name: t("analyze.results.sentiment.negative"),
                            value: establishment.analysis_results.sentiment.negative,
                          },
                        ]}
                        topStrengths={establishment.analysis_results.strengths}
                        topWeaknesses={establishment.analysis_results.weaknesses}
                      />
                    </CardContent>
                  </Card>

                  {/* Emotions Bar Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("analyze.results.cards.emotions.title")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <EmotionsBarChart
                        data={establishment.analysis_results.emotions}
                        reviewCount={establishment.analysis_results.reviewCount}
                      />
                    </CardContent>
                  </Card>

                  {/* Keyword Cloud */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("analyze.results.cards.themes.title")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <KeywordCloud
                        keywords={establishment.analysis_results.themes.map((theme: any) => ({
                          text: theme.theme,
                          value: theme.count,
                        }))}
                      />
                    </CardContent>
                  </Card>

                  {/* Strengths */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("analyze.results.cards.strengths.title")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <StrengthsWeaknessesBarChart data={establishment.analysis_results.strengths} type="strengths" />
                    </CardContent>
                  </Card>

                  {/* Weaknesses */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("analyze.results.cards.weaknesses.title")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <StrengthsWeaknessesBarChart data={establishment.analysis_results.weaknesses} type="weaknesses" />
                    </CardContent>
                  </Card>

                  {/* Review Summary Table */}
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>{t("analyze.results.cards.summary.title")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ReviewSummaryTable reviews={establishment.analysis_results.reviewSummary} />
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 text-white p-8 rounded-lg text-center">
            <h2 className="text-2xl font-semibold mb-4">{t("establishment.notFoundTitle")}</h2>
            <p className="mb-6">{t("establishment.notFoundDescription")}</p>
            <Button asChild>
              <Link href={getLocalizedUrl("/my-establishments", language)}>
                {t("establishment.backToMyEstablishments")}
              </Link>
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
