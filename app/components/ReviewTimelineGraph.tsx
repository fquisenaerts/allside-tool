"use client"

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

interface ReviewTimelineGraphProps {
  data: { date: string; count: number }[]
  explanation?: string
}

export function ReviewTimelineGraph({ data, explanation }: ReviewTimelineGraphProps) {
  // Sort data by date
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Generate personalized explanation based on the actual data
  const generatePersonalizedExplanation = () => {
    if (!data || data.length === 0) {
      return "No timeline data is available. Once reviews with dates are collected, this chart will show the distribution of reviews over time."
    }

    // Calculate total reviews
    const totalReviews = data.reduce((sum, item) => sum + item.count, 0)

    // Find date range
    const startDate = new Date(sortedData[0].date)
    const endDate = new Date(sortedData[sortedData.length - 1].date)
    const dateRange = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    // Find peak date
    const peakData = [...data].sort((a, b) => b.count - a.count)[0]
    const peakDate = new Date(peakData.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })

    // Calculate trend
    let trend = "stable"
    if (data.length >= 3) {
      const firstThird = data.slice(0, Math.floor(data.length / 3))
      const lastThird = data.slice(Math.floor((2 * data.length) / 3))

      const firstAvg = firstThird.reduce((sum, item) => sum + item.count, 0) / firstThird.length
      const lastAvg = lastThird.reduce((sum, item) => sum + item.count, 0) / lastThird.length

      if (lastAvg > firstAvg * 1.2) {
        trend = "increasing"
      } else if (lastAvg < firstAvg * 0.8) {
        trend = "decreasing"
      }
    }

    // Construct personalized explanation
    let explanation = `This timeline shows ${totalReviews} reviews over a ${dateRange}-day period. `

    if (trend === "increasing") {
      explanation += `There's a positive trend with review volume increasing over time, which suggests growing customer engagement. `
    } else if (trend === "decreasing") {
      explanation += `There's a downward trend in review volume, which might indicate decreasing customer engagement. `
    } else {
      explanation += `The review volume has remained relatively stable over this period. `
    }

    explanation += `The highest number of reviews (${peakData.count}) was received on ${peakDate}. `

    if (peakData.count > 3 * (totalReviews / data.length)) {
      explanation += `This spike might correspond to a specific event, promotion, or product launch that generated increased customer feedback.`
    }

    return explanation
  }

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={sortedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip formatter={(value) => [`${value} reviews`, "Count"]} />
          <Legend />
          <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-sm text-gray-600">{explanation || generatePersonalizedExplanation()}</p>
    </div>
  )
}
