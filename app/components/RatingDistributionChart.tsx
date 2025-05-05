"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface RatingDistributionChartProps {
  ratings: number[]
  explanation?: string
}

export function RatingDistributionChart({ ratings, explanation }: RatingDistributionChartProps) {
  // Handle undefined or empty ratings
  const validRatings = ratings || []

  // Count occurrences of each rating
  const ratingCounts =
    validRatings.length > 0
      ? validRatings.reduce((acc, rating) => {
          const roundedRating = Math.round(rating)
          acc[roundedRating] = (acc[roundedRating] || 0) + 1
          return acc
        }, {})
      : { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } // Default empty counts

  // Convert to array format for chart
  const data = [5, 4, 3, 2, 1].map((rating) => ({
    rating: `${rating}★`,
    count: ratingCounts[rating] || 0,
  }))

  // Calculate percentages for explanation
  const total = validRatings.length || 1 // Avoid division by zero
  const percentages = data.reduce((acc, item) => {
    acc[item.rating.charAt(0)] = Math.round((item.count / total) * 100)
    return acc
  }, {})

  // Generate explanation if not provided
  const defaultExplanation =
    validRatings.length > 0
      ? `
      This chart shows the distribution of ratings across all ${total} reviews. 
      ${percentages["5"]}% of reviewers gave 5 stars, 
      ${percentages["4"]}% gave 4 stars, 
      ${percentages["3"]}% gave 3 stars, 
      ${percentages["2"]}% gave 2 stars, and 
      ${percentages["1"]}% gave 1 star. 
      ${
        percentages["5"] + percentages["4"] > 70
          ? "The high proportion of 4-5 star ratings indicates strong customer satisfaction."
          : percentages["1"] + percentages["2"] > 30
            ? "The significant number of 1-2 star ratings suggests areas for improvement."
            : "The distribution shows a mixed reception, with opportunities to convert neutral customers into promoters."
      }
    `
      : "No rating data is available for analysis. Once reviews with ratings are collected, this chart will show the distribution of star ratings."

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Rating Distribution</h2>
      <div className="space-y-8">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="rating" />
            <YAxis />
            <Tooltip formatter={(value) => [`${value} reviews`, "Count"]} />
            <Legend />
            <Bar dataKey="count" name="Number of Reviews" fill="#8884d8" isAnimationActive={true} />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-gray-600 text-lg leading-relaxed">{explanation || defaultExplanation}</p>
      </div>
    </div>
  )
}
