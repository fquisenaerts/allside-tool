"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface TimeBetweenPurchaseReviewProps {
  data?: { daysBetween: number; count: number }[]
  explanation?: string
}

export function TimeBetweenPurchaseReview({ data, explanation }: TimeBetweenPurchaseReviewProps) {
  // Generate sample data if none provided
  const generateSampleData = () => {
    // Create a realistic distribution with most reviews coming within first 30 days
    const sampleData = [
      { daysBetween: "0-1", count: 45 },
      { daysBetween: "2-3", count: 65 },
      { daysBetween: "4-7", count: 85 },
      { daysBetween: "8-14", count: 55 },
      { daysBetween: "15-30", count: 35 },
      { daysBetween: "31-60", count: 20 },
      { daysBetween: "61-90", count: 10 },
      { daysBetween: "90+", count: 5 },
    ]
    return sampleData
  }

  const chartData = data || generateSampleData()

  // Calculate average time (for sample data)
  const calculateAverageTime = () => {
    if (data) return "based on your data"

    // For sample data, estimate based on midpoints
    const midpoints = {
      "0-1": 0.5,
      "2-3": 2.5,
      "4-7": 5.5,
      "8-14": 11,
      "15-30": 22.5,
      "31-60": 45.5,
      "61-90": 75.5,
      "90+": 120, // Estimate for 90+
    }

    let totalDays = 0
    let totalCount = 0

    chartData.forEach((item) => {
      totalDays += midpoints[item.daysBetween] * item.count
      totalCount += item.count
    })

    return Math.round(totalDays / totalCount)
  }

  const averageTime = calculateAverageTime()

  // Generate explanation if not provided
  const defaultExplanation = `
    This histogram shows the distribution of time between purchase and review. Understanding this timing can help:
    
    1. Identify when customers are most likely to leave feedback after their purchase
    2. Optimize the timing of review request emails or notifications
    3. Recognize patterns in how quickly customers form opinions about your product
    
    The data shows that most reviews are submitted within the first two weeks after purchase, with the highest 
    concentration in the 4-7 day range. The average time between purchase and review is approximately ${averageTime} days.
    
    This suggests that customers typically need about a week to form an opinion about your product or service. 
    Consider sending review requests 5-7 days after purchase to maximize response rates.
  `

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Time Between Purchase and Review</h2>
      <div className="flex justify-center items-center mb-4">
        <div className="text-center">
          <div className="text-5xl font-bold">{averageTime}</div>
          <div className="text-gray-500 mt-2">Average Days</div>
        </div>
      </div>
      <div className="space-y-8">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="daysBetween" />
            <YAxis />
            <Tooltip formatter={(value) => [`${value} reviews`, "Count"]} />
            <Legend />
            <Bar dataKey="count" name="Number of Reviews" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-gray-600 text-lg leading-relaxed">{explanation || defaultExplanation}</p>
      </div>
    </div>
  )
}
