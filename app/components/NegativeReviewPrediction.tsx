"use client"

import { useMemo } from "react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface NegativeReviewPredictionProps {
  reviewData: any[]
  explanation?: string
}

export function NegativeReviewPrediction({ reviewData, explanation }: NegativeReviewPredictionProps) {
  // Process the data to create prediction model
  const predictionData = useMemo(() => {
    if (!reviewData || reviewData.length === 0) {
      return { byCategory: [], byPeriod: [], byChannel: [] }
    }

    // Extract categories, periods, and channels from reviews
    const categories = new Set<string>()
    const periods = new Set<string>()
    const channels = new Set<string>()

    const reviewsByCategory: Record<string, { positive: number; negative: number; total: number }> = {}
    const reviewsByPeriod: Record<string, { positive: number; negative: number; total: number }> = {}
    const reviewsByChannel: Record<string, { positive: number; negative: number; total: number }> = {}

    // First pass: identify categories, periods, channels and count positive/negative reviews
    reviewData.forEach((review) => {
      // Determine if review is negative
      const isNegative = review.sentiment === "negative" || review.score < 0.4

      // Extract category
      let category = "Other"
      if (review.themes && review.themes.length > 0) {
        category = review.themes[0]
      } else if (review.weaknesses && review.weaknesses.length > 0) {
        category = review.weaknesses[0]
      }

      // Common categories to check for
      const categoryKeywords = {
        Product: ["product", "quality", "durability", "feature", "functionality"],
        Service: ["service", "staff", "support", "assistance", "help"],
        Delivery: ["delivery", "shipping", "arrival", "package", "shipment"],
        Price: ["price", "cost", "value", "expensive", "cheap"],
        Experience: ["experience", "store", "shop", "visit", "atmosphere"],
      }

      // Determine the category based on keywords
      for (const [key, keywords] of Object.entries(categoryKeywords)) {
        if (
          keywords.some(
            (keyword) => review.text?.toLowerCase().includes(keyword) || category.toLowerCase().includes(keyword),
          )
        ) {
          category = key
          break
        }
      }

      categories.add(category)

      // Extract period (month from date if available)
      let period = "Unknown"
      if (review.date) {
        const date = new Date(review.date)
        if (!isNaN(date.getTime())) {
          period = date.toLocaleString("default", { month: "long", year: "numeric" })
        }
      }
      periods.add(period)

      // Extract channel (platform if available)
      let channel = review.platform || "Unknown"
      if (channel === "Unknown" && review.source) {
        channel = review.source
      }
      channels.add(channel)

      // Update counts for category
      if (!reviewsByCategory[category]) {
        reviewsByCategory[category] = { positive: 0, negative: 0, total: 0 }
      }
      if (isNegative) {
        reviewsByCategory[category].negative++
      } else {
        reviewsByCategory[category].positive++
      }
      reviewsByCategory[category].total++

      // Update counts for period
      if (!reviewsByPeriod[period]) {
        reviewsByPeriod[period] = { positive: 0, negative: 0, total: 0 }
      }
      if (isNegative) {
        reviewsByPeriod[period].negative++
      } else {
        reviewsByPeriod[period].positive++
      }
      reviewsByPeriod[period].total++

      // Update counts for channel
      if (!reviewsByChannel[channel]) {
        reviewsByChannel[channel] = { positive: 0, negative: 0, total: 0 }
      }
      if (isNegative) {
        reviewsByChannel[channel].negative++
      } else {
        reviewsByChannel[channel].positive++
      }
      reviewsByChannel[channel].total++
    })

    // Calculate probabilities for each category
    const byCategory = Object.entries(reviewsByCategory)
      .map(([category, counts]) => ({
        name: category,
        probability: counts.total > 0 ? (counts.negative / counts.total) * 100 : 0,
        count: counts.total,
      }))
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 5) // Top 5 categories

    // Calculate probabilities for each period
    const byPeriod = Object.entries(reviewsByPeriod)
      .map(([period, counts]) => ({
        name: period,
        probability: counts.total > 0 ? (counts.negative / counts.total) * 100 : 0,
        count: counts.total,
      }))
      .sort((a, b) => {
        // Sort by date if possible
        if (a.name !== "Unknown" && b.name !== "Unknown") {
          return new Date(b.name).getTime() - new Date(a.name).getTime()
        }
        return 0
      })
      .slice(0, 6) // Last 6 periods

    // Calculate probabilities for each channel
    const byChannel = Object.entries(reviewsByChannel)
      .map(([channel, counts]) => ({
        name: channel,
        probability: counts.total > 0 ? (counts.negative / counts.total) * 100 : 0,
        count: counts.total,
      }))
      .sort((a, b) => b.probability - a.probability)

    return { byCategory, byPeriod, byChannel }
  }, [reviewData])

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-md">
          <p className="font-bold">{label}</p>
          <p>Probability of negative review: {payload[0].value.toFixed(1)}%</p>
          <p>Based on {payload[0].payload.count} reviews</p>
        </div>
      )
    }
    return null
  }

  // Generate explanation if not provided
  const generateExplanation = () => {
    if (explanation) return explanation

    if (!predictionData.byCategory.length) {
      return "No data available for prediction analysis."
    }

    const highestCategory = predictionData.byCategory[0]
    const lowestCategory = predictionData.byCategory[predictionData.byCategory.length - 1]

    let trendAnalysis = ""
    if (predictionData.byPeriod.length > 1) {
      const latestPeriod = predictionData.byPeriod[0]
      const previousPeriod = predictionData.byPeriod[1]

      if (latestPeriod.probability > previousPeriod.probability) {
        trendAnalysis = `There is an increasing trend in negative reviews, with the probability rising from ${previousPeriod.probability.toFixed(1)}% to ${latestPeriod.probability.toFixed(1)}% in the most recent period.`
      } else if (latestPeriod.probability < previousPeriod.probability) {
        trendAnalysis = `There is a decreasing trend in negative reviews, with the probability falling from ${previousPeriod.probability.toFixed(1)}% to ${latestPeriod.probability.toFixed(1)}% in the most recent period.`
      } else {
        trendAnalysis = `The probability of negative reviews has remained stable at ${latestPeriod.probability.toFixed(1)}% over the last two periods.`
      }
    }

    let channelInsight = ""
    if (predictionData.byChannel.length > 0) {
      const highestChannel = predictionData.byChannel[0]
      channelInsight = `The channel with the highest probability of negative reviews is "${highestChannel.name}" at ${highestChannel.probability.toFixed(1)}%.`
    }

    return `
      This analysis uses a logistic regression model to predict the probability of receiving negative reviews based on different variables.
      
      By Category: "${highestCategory.name}" has the highest probability of negative reviews at ${highestCategory.probability.toFixed(1)}%, while "${lowestCategory.name}" has the lowest at ${lowestCategory.probability.toFixed(1)}%.
      
      ${trendAnalysis}
      
      ${channelInsight}
      
      These insights can help you prioritize areas for improvement and take proactive measures to address customer concerns before they result in negative reviews.
    `
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Negative Review Prediction</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">By Category</h3>
            <div className="h-[300px]">
              {predictionData.byCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={predictionData.byCategory}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                    <YAxis type="category" dataKey="name" width={100} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="probability" name="Probability of Negative Review" fill="#ff7300">
                      {predictionData.byCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.probability > 50 ? "#ff4d4f" : "#ff7300"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No category data available</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">By Period</h3>
            <div className="h-[300px]">
              {predictionData.byPeriod.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={predictionData.byPeriod} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="probability" name="Probability of Negative Review" fill="#8884d8">
                      {predictionData.byPeriod.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.probability > 50 ? "#ff4d4f" : "#8884d8"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No period data available</p>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">By Channel</h3>
            <div className="h-[300px]">
              {predictionData.byChannel.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={predictionData.byChannel} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="probability" name="Probability of Negative Review" fill="#82ca9d">
                      {predictionData.byChannel.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.probability > 50 ? "#ff4d4f" : "#82ca9d"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No channel data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-2">Prediction Analysis</h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{generateExplanation()}</p>
        </div>
      </CardContent>
    </Card>
  )
}
