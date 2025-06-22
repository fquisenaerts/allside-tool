"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"

// Import all visualization components
import { SentimentPieChart } from "./SentimentPieChart"
import { AnalysisSummaryCards } from "./AnalysisSummaryCards"
import { EmotionsBarChart } from "./EmotionsBarChart"
import { KeywordCloud } from "./KeywordCloud"
import { StrengthsWeaknessesBarChart } from "./StrengthsWeaknessesBarChart"
import { ToneBarChart } from "./ToneBarChart"
import { InfluentialReviews } from "./InfluentialReviews"
import { NetPromoterScore } from "./NetPromoterScore"
import { RatingDistributionChart } from "./RatingDistributionChart"
import { ReviewCountGraph } from "./ReviewCountGraph"
import { NoticesPerMonthChart } from "./NoticesPerMonthChart"
import { TemporalHeatmap } from "./TemporalHeatmap"
import { TimeBetweenPurchaseReview } from "./TimeBetweenPurchaseReview"
import { OpinionTrendGraph } from "./OpinionTrendGraph"
import { SatisfactionFlowChart } from "./SatisfactionFlowChart"
import { ReviewSummaryTable } from "./ReviewSummaryTable"
import { ReviewClusteringGraph } from "./ReviewClusteringGraph"
import { NegativeReviewPrediction } from "./NegativeReviewPrediction"
import { RatingBoxPlot } from "./RatingBoxPlot"
import { AnalysisSummary } from "./AnalysisSummary"
import { ReviewTimelineGraph } from "./ReviewTimelineGraph"
import { SimpleBarChart } from "./SimpleBarChart"
import { SimplePieChart } from "./SimplePieChart"

interface ComprehensiveAnalysisDisplayProps {
  analysisResults: any
  onDownloadPDF?: () => void
  showAllSections?: boolean
  activeTab?: string // Add activeTab prop to control which tab content to show
}

export function ComprehensiveAnalysisDisplay({
  analysisResults,
  onDownloadPDF,
  showAllSections = false,
  activeTab = "overview",
}: ComprehensiveAnalysisDisplayProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    sentiment: true,
    themes: true,
    customer: true,
    marketing: true,
    strengths: true,
    ratings: true,
    timeline: true,
    advanced: true,
    details: true,
  })

  // Helper function to toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Calculate average rating from review data
  const calculateAverageRating = () => {
    if (!analysisResults || !analysisResults.reviewSummary || analysisResults.reviewSummary.length === 0) {
      return { avgRating: 0, avgLength: 0 }
    }

    const ratings = analysisResults.reviewSummary.map((r: any) => r.score * 5)
    const lengths = analysisResults.reviewSummary.map((r: any) => r.text?.length || 0)

    const sumRatings = ratings.reduce((total: number, rating: number) => total + rating, 0)
    const sumLengths = lengths.reduce((total: number, length: number) => total + length, 0)

    return {
      avgRating: sumRatings / ratings.length,
      avgLength: sumLengths / lengths.length,
    }
  }

  if (!analysisResults) {
    return (
      <div className="p-8 text-center text-gray-500">No analysis results available. Please run an analysis first.</div>
    )
  }

  const { avgRating, avgLength } = calculateAverageRating()
  const sentimentScore = analysisResults.sentiment?.positive || 0

  // Section component with toggle functionality
  const Section = ({
    title,
    sectionKey,
    children,
  }: {
    title: string
    sectionKey: string
    children: React.ReactNode
  }) => (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => toggleSection(sectionKey)}>
        <h2 className="text-2xl font-bold text-black">{title}</h2>
        <Button variant="ghost" size="sm">
          {expandedSections[sectionKey] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </Button>
      </div>
      {expandedSections[sectionKey] && children}
    </div>
  )

  const allSectionsContent = (
    <>
      {/* Overview Section */}
      <Section title="Summary" sectionKey="overview">
        <AnalysisSummaryCards
          totalReviews={analysisResults.reviewCount}
          averageRating={avgRating}
          sentimentScore={sentimentScore}
          averageReviewLength={avgLength}
        />
        <div className="mt-6 grid grid-cols-12 gap-6">
          <AnalysisSummary results={analysisResults} />
        </div>
      </Section>

      <Section title="Sentiment Analysis" sectionKey="sentiment">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Overall Satisfaction</CardTitle>
            </CardHeader>
            <CardContent>
              <SentimentPieChart
                data={[
                  { name: "Positive", value: analysisResults.sentiment?.positive || 0 },
                  { name: "Negative", value: analysisResults.sentiment?.negative || 0 },
                  { name: "Neutral", value: analysisResults.sentiment?.neutral || 0 },
                ]}
                reviewCount={analysisResults.reviewCount}
                topStrengths={analysisResults.strengths}
                topWeaknesses={analysisResults.weaknesses}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tone Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ToneBarChart
                data={[
                  { name: "Positive", value: analysisResults.sentiment?.positive || 0 },
                  { name: "Neutral", value: analysisResults.sentiment?.neutral || 0 },
                  { name: "Negative", value: analysisResults.sentiment?.negative || 0 },
                ]}
                topStrengths={analysisResults.strengths}
                topWeaknesses={analysisResults.weaknesses}
              />
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section title="Emotions & Themes" sectionKey="themes">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Emotional Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <EmotionsBarChart data={analysisResults.emotions || []} reviewCount={analysisResults.reviewCount} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Themes</CardTitle>
            </CardHeader>
            <CardContent>
              <KeywordCloud
                keywords={
                  analysisResults.themes?.map((theme: any) => ({
                    text: theme.theme,
                    value: theme.count,
                  })) || []
                }
              />
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section title="Strengths & Weaknesses" sectionKey="strengths">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Strengths Cited</CardTitle>
            </CardHeader>
            <CardContent>
              <StrengthsWeaknessesBarChart
                strengths={
                  analysisResults.strengths?.map((s: any) => ({
                    name: s.strength,
                    value: s.count,
                  })) || []
                }
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Areas for Improvement</CardTitle>
            </CardHeader>
            <CardContent>
              <StrengthsWeaknessesBarChart
                weaknesses={
                  analysisResults.weaknesses?.map((w: any) => ({
                    name: w.weakness,
                    value: w.count,
                  })) || []
                }
              />
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section title="Ratings & Reviews" sectionKey="ratings">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Rating Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <RatingDistributionChart
                ratings={analysisResults.reviewSummary?.map((r: any) => Math.round(r.score * 5)) || []}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Net Promoter Score</CardTitle>
            </CardHeader>
            <CardContent>
              <NetPromoterScore
                ratings={analysisResults.reviewSummary?.map((r: any) => Math.round(r.score * 5)) || []}
              />
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section title="Timeline Analysis" sectionKey="timeline">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Review Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ReviewTimelineGraph data={analysisResults.reviewDates || []} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Review Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <NoticesPerMonthChart data={analysisResults.reviewDates || []} />
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section title="Advanced Insights" sectionKey="advanced">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Opinion Trend Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <OpinionTrendGraph data={analysisResults.comprehensiveAnalysis?.trend || "stable"} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Review Activity Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <TemporalHeatmap data={analysisResults.reviewDates || []} />
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section title="Review Details" sectionKey="details">
        <Card>
          <CardHeader>
            <CardTitle>Individual Review Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <ReviewSummaryTable reviews={analysisResults.reviewSummary || []} pageSize={10} />
          </CardContent>
        </Card>
      </Section>
    </>
  )

  if (showAllSections) {
    // Show all sections without tabs when viewing establishment details
    return <div className="w-full bg-white p-6 rounded-lg space-y-8">{allSectionsContent}</div>
  }

  // Conditional rendering based on activeTab instead of using nested Tabs
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return allSectionsContent

      case "sentiment":
        return (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Overall Satisfaction</CardTitle>
              </CardHeader>
              <CardContent>
                <SentimentPieChart
                  data={[
                    { name: "Positive", value: analysisResults.sentiment?.positive || 0 },
                    { name: "Negative", value: analysisResults.sentiment?.negative || 0 },
                    { name: "Neutral", value: analysisResults.sentiment?.neutral || 0 },
                  ]}
                  reviewCount={analysisResults.reviewCount}
                  topStrengths={analysisResults.strengths}
                  topWeaknesses={analysisResults.weaknesses}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Net Promoter Score (eNPS)</CardTitle>
              </CardHeader>
              <CardContent>
                <NetPromoterScore
                  ratings={analysisResults.reviewSummary?.map((r: any) => Math.round(r.score * 5)) || []}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rating Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <RatingDistributionChart
                  ratings={analysisResults.reviewSummary?.map((r: any) => Math.round(r.score * 5)) || []}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rating Statistical Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <RatingBoxPlot
                  ratings={analysisResults.reviewSummary?.map((r: any) => Math.round(r.score * 5)) || []}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tone Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ToneBarChart
                  data={[
                    { name: "Positive", value: analysisResults.sentiment?.positive || 0 },
                    { name: "Neutral", value: analysisResults.sentiment?.neutral || 0 },
                    { name: "Negative", value: analysisResults.sentiment?.negative || 0 },
                  ]}
                  topStrengths={analysisResults.strengths}
                  topWeaknesses={analysisResults.weaknesses}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Influential Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <InfluentialReviews reviewData={analysisResults.reviewSummary || []} />
              </CardContent>
            </Card>
          </div>
        )

      case "themes":
        return (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Key Themes</CardTitle>
              </CardHeader>
              <CardContent>
                <KeywordCloud
                  keywords={
                    analysisResults.themes?.map((theme: any) => ({
                      text: theme.theme,
                      value: theme.count,
                    })) || []
                  }
                />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Strengths</CardTitle>
                </CardHeader>
                <CardContent>
                  <StrengthsWeaknessesBarChart
                    strengths={
                      analysisResults.strengths?.map((s: any) => ({
                        name: s.strength,
                        value: s.count,
                      })) || []
                    }
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Areas for Improvement</CardTitle>
                </CardHeader>
                <CardContent>
                  <StrengthsWeaknessesBarChart
                    weaknesses={
                      analysisResults.weaknesses?.map((w: any) => ({
                        name: w.weakness,
                        value: w.count,
                      })) || []
                    }
                  />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Review Clustering Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ReviewClusteringGraph
                  reviewData={analysisResults.reviewSummary || []}
                  clusters={[
                    { id: 0, x: 0.8, y: 0.3, z: 0.7, name: "Quality Positive" },
                    { id: 1, x: 0.2, y: 0.7, z: 0.3, name: "Quality Negative" },
                    { id: 2, x: 0.7, y: 0.3, z: 0.6, name: "Price Positive" },
                    { id: 3, x: 0.3, y: 0.6, z: 0.4, name: "Price Negative" },
                    { id: 4, x: 0.8, y: 0.4, z: 0.8, name: "Experience Positive" },
                    { id: 5, x: 0.3, y: 0.6, z: 0.2, name: "Experience Negative" },
                  ]}
                />
              </CardContent>
            </Card>
          </div>
        )

      case "customer":
        return (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Customer Emotions</CardTitle>
              </CardHeader>
              <CardContent>
                <EmotionsBarChart data={analysisResults.emotions || []} reviewCount={analysisResults.reviewCount} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Feedback Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ReviewCountGraph data={analysisResults.reviewDates || []} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Journey Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <SatisfactionFlowChart
                  data={{
                    nodes: [
                      { name: "Unhappy Customer" },
                      { name: "Neutral Experience" },
                      { name: "Positive Experience" },
                      { name: "Negative Review" },
                      { name: "Moderate Review" },
                      { name: "Positive Review" },
                      { name: "Lost Customer" },
                      { name: "Repeat Customer" },
                      { name: "Brand Advocate" },
                    ],
                    links: [
                      {
                        source: 0,
                        target: 3,
                        value: Math.round((analysisResults.sentiment?.negative || 0) * 0.3),
                      },
                      {
                        source: 0,
                        target: 4,
                        value: Math.round((analysisResults.sentiment?.negative || 0) * 0.1),
                      },
                      {
                        source: 1,
                        target: 3,
                        value: Math.round((analysisResults.sentiment?.neutral || 0) * 0.1),
                      },
                      {
                        source: 1,
                        target: 4,
                        value: Math.round((analysisResults.sentiment?.neutral || 0) * 0.6),
                      },
                      {
                        source: 1,
                        target: 5,
                        value: Math.round((analysisResults.sentiment?.neutral || 0) * 0.3),
                      },
                      {
                        source: 2,
                        target: 4,
                        value: Math.round((analysisResults.sentiment?.positive || 0) * 0.1),
                      },
                      {
                        source: 2,
                        target: 5,
                        value: Math.round((analysisResults.sentiment?.positive || 0) * 0.9),
                      },
                      {
                        source: 3,
                        target: 6,
                        value: Math.round((analysisResults.sentiment?.negative || 0) * 0.7),
                      },
                      {
                        source: 4,
                        target: 6,
                        value: Math.round((analysisResults.sentiment?.neutral || 0) * 0.2),
                      },
                      {
                        source: 4,
                        target: 7,
                        value: Math.round((analysisResults.sentiment?.neutral || 0) * 0.8),
                      },
                      {
                        source: 5,
                        target: 7,
                        value: Math.round((analysisResults.sentiment?.positive || 0) * 0.3),
                      },
                      {
                        source: 5,
                        target: 8,
                        value: Math.round((analysisResults.sentiment?.positive || 0) * 0.7),
                      },
                    ],
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Time Between Purchase and Review</CardTitle>
              </CardHeader>
              <CardContent>
                <TimeBetweenPurchaseReview />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Negative Review Prediction</CardTitle>
              </CardHeader>
              <CardContent>
                <NegativeReviewPrediction
                  currentTrend={analysisResults.comprehensiveAnalysis?.trend || "stable"}
                  negativePercentage={analysisResults.sentiment?.negative || 0}
                />
              </CardContent>
            </Card>
          </div>
        )

      case "marketing":
        return (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Product Promotion Arguments</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4 text-black">Top Strengths to Highlight</h3>
                  <SimpleBarChart
                    data={
                      analysisResults.strengths?.slice(0, 5).map((s: any) => ({
                        name: s.strength,
                        value: s.count,
                      })) || []
                    }
                  />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4 text-black">Customer Emotions to Target</h3>
                  <SimplePieChart
                    data={
                      analysisResults.emotions?.slice(0, 5).map((e: any) => ({
                        name: e.emotion,
                        value: e.count,
                      })) || []
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Competitive Positioning</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4 text-black">Unique Selling Points</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      {analysisResults.strengths?.slice(0, 5).map((s: any, i: number) => (
                        <li key={i} className="text-gray-700">
                          {s.strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-4 text-black">Areas to Improve vs Competition</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      {analysisResults.weaknesses?.slice(0, 5).map((w: any, i: number) => (
                        <li key={i} className="text-gray-700">
                          {w.weakness}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Testimonial Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <InfluentialReviews reviewData={analysisResults.reviewSummary || []} positiveOnly={true} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Seasonal Review Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <TemporalHeatmap data={analysisResults.reviewDates || []} />
              </CardContent>
            </Card>
          </div>
        )

      default:
        return allSectionsContent
    }
  }

  // Return content without nested Tabs - just conditional rendering
  return <div className="w-full bg-white p-6 rounded-lg">{renderTabContent()}</div>
}
