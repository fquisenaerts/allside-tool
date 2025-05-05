import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThumbsUp, Globe, TrendingUp, ThumbsDown, AlertTriangle } from "lucide-react"

interface AnalysisSummaryProps {
  results: any
}

export function AnalysisSummary({ results }: AnalysisSummaryProps) {
  const totalReviews = results.reviewCount
  const positiveReviews = Math.round((results.sentiment.positive * totalReviews) / 100)
  const positivePercentage = Math.round(results.sentiment.positive)
  const overallSentiment = positivePercentage >= 70 ? "positive" : positivePercentage >= 40 ? "neutral" : "negative"

  // Get comprehensive analysis data
  const comprehensiveAnalysis = results.comprehensiveAnalysis || {}

  // Filter out generic themes
  const keyThemes = results.themes
    .filter((theme) => theme.theme && theme.theme !== "general feedback" && theme.theme !== "Unknown")
    .map((theme) => theme.theme)

  const getSentimentDescription = (percentage: number) => {
    if (percentage >= 80) return "overwhelmingly positive"
    if (percentage >= 60) return "generally positive"
    if (percentage >= 40) return "mixed"
    if (percentage >= 20) return "generally negative"
    return "overwhelmingly negative"
  }

  const sentimentDescription = getSentimentDescription(positivePercentage)

  // Get top strengths and weaknesses
  const topStrengths = results.strengths
    .filter((s) => s.strength !== "not specified" && s.strength !== "Unknown")
    .slice(0, 3)
    .map((s) => s.strength)

  const topWeaknesses = results.weaknesses
    .filter((w) => w.weakness !== "not specified" && w.weakness !== "Unknown")
    .slice(0, 3)
    .map((w) => w.weakness)

  // Get top emotions
  const topEmotions = results.emotions
    .filter((e) => e.emotion !== "neutral" && e.emotion !== "Unknown")
    .slice(0, 3)
    .map((e) => e.emotion)

  // Use the comprehensive analysis for insights if available
  const insights = comprehensiveAnalysis.overallSentiment?.summary || generateInsights()
  const marketingRecommendations =
    comprehensiveAnalysis.marketingInsights?.join(" ") || generateMarketingRecommendations()
  const improvementSuggestions = comprehensiveAnalysis.recommendations || generateImprovementSuggestions()

  // Generate personalized insights (fallback)
  function generateInsights() {
    if (positivePercentage >= 70) {
      return `Your customers are highly satisfied, with ${positivePercentage}% expressing positive sentiments. The most appreciated aspects are ${
        topStrengths.length > 0 ? topStrengths.join(", ") : "your overall service"
      }. To further improve, consider addressing ${
        topWeaknesses.length > 0 ? topWeaknesses.join(" and ") : "any minor concerns raised"
      }.`
    } else if (positivePercentage >= 40) {
      return `Customer sentiment is mixed, with ${positivePercentage}% positive reviews. While customers appreciate ${
        topStrengths.length > 0 ? topStrengths.join(" and ") : "some aspects of your offering"
      }, there are significant concerns about ${
        topWeaknesses.length > 0 ? topWeaknesses.join(" and ") : "several areas"
      } that should be addressed to improve overall satisfaction.`
    } else {
      return `Customer sentiment is predominantly negative, with only ${positivePercentage}% positive reviews. Urgent attention is needed to address issues with ${
        topWeaknesses.length > 0 ? topWeaknesses.join(" and ") : "multiple aspects of your offering"
      }. Even in this challenging situation, some customers appreciate ${
        topStrengths.length > 0 ? topStrengths.join(" and ") : "certain aspects"
      }.`
    }
  }

  // Generate marketing recommendations (fallback)
  function generateMarketingRecommendations() {
    if (positivePercentage >= 70) {
      return `Highlight your exceptional ${
        topStrengths.length > 0 ? topStrengths.join(" and ") : "customer satisfaction"
      } in marketing materials. Consider featuring positive customer testimonials that mention these strengths specifically.`
    } else if (positivePercentage >= 40) {
      return `Focus marketing messages on your strengths: ${
        topStrengths.length > 0 ? topStrengths.join(" and ") : "the positive aspects of your offering"
      }. Address ${
        topWeaknesses.length > 0 ? topWeaknesses[0] : "key weaknesses"
      } internally before highlighting them in marketing.`
    } else {
      return `Pause major marketing initiatives until ${
        topWeaknesses.length > 0 ? topWeaknesses.join(" and ") : "critical issues"
      } are addressed. Once improvements are made, consider a relaunch campaign highlighting the changes.`
    }
  }

  // Generate improvement suggestions (fallback)
  function generateImprovementSuggestions() {
    const suggestions = []

    if (topWeaknesses.length > 0) {
      topWeaknesses.forEach((weakness) => {
        switch (weakness) {
          case "price":
            suggestions.push("Review your pricing strategy or better communicate the value proposition")
            break
          case "quality":
            suggestions.push("Implement stricter quality control measures")
            break
          case "service":
            suggestions.push("Invest in customer service training and improve response times")
            break
          case "delivery":
            suggestions.push("Optimize your delivery process and provide better tracking information")
            break
          case "usability":
            suggestions.push("Conduct usability testing and simplify your user interface")
        }
      })
    }

    return suggestions.join(". ")
  }

  return (
    <>
      <Card className="col-span-4">
        <CardContent className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Overall Sentiment</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {overallSentiment === "positive" && <ThumbsUp className="h-5 w-5 text-green-500" />}
              {overallSentiment === "neutral" && <Globe className="h-5 w-5 text-yellow-500" />}
              {overallSentiment === "negative" && <ThumbsDown className="h-5 w-5 text-red-500" />}
              <p className="text-sm">
                Overall customer sentiment is <strong>{sentimentDescription}</strong> with{" "}
                <strong>{positivePercentage}%</strong> positive reviews.
              </p>
            </div>
            <p className="text-sm">{insights}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-4">
        <CardContent className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Key Themes</h2>
          <div className="space-y-2">
            {keyThemes.length > 0 ? (
              keyThemes.map((theme, index) => (
                <Badge key={index} variant="secondary">
                  {theme}
                </Badge>
              ))
            ) : (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <p className="text-sm">No specific themes identified.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-4">
        <CardContent className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Top Strengths</h2>
          <div className="space-y-2">
            {topStrengths.length > 0 ? (
              topStrengths.map((strength, index) => (
                <Badge key={index} variant="outline">
                  {strength}
                </Badge>
              ))
            ) : (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <p className="text-sm">No significant strengths identified.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-4">
        <CardContent className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Top Weaknesses</h2>
          <div className="space-y-2">
            {topWeaknesses.length > 0 ? (
              topWeaknesses.map((weakness, index) => (
                <Badge key={index} variant="destructive">
                  {weakness}
                </Badge>
              ))
            ) : (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <p className="text-sm">No significant weaknesses identified.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-4">
        <CardContent className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Top Emotions</h2>
          <div className="space-y-2">
            {topEmotions.length > 0 ? (
              topEmotions.map((emotion, index) => (
                <Badge key={index} variant="secondary">
                  {emotion}
                </Badge>
              ))
            ) : (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <p className="text-sm">No specific emotions identified.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-4">
        <CardContent className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Marketing Recommendations</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <p className="text-sm">{marketingRecommendations}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-4">
        <CardContent className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Improvement Suggestions</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <p className="text-sm">{improvementSuggestions}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
