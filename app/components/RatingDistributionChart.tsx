"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface RatingDistributionChartProps {
  ratings: number[]
}

export function RatingDistributionChart({ ratings }: RatingDistributionChartProps) {
  if (!ratings || ratings.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center text-gray-500">
        <p>No rating data available</p>
      </div>
    )
  }

  // Count ratings by star level
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    name: `${star}★`,
    value: ratings.filter((rating) => Math.round(rating) === star).length,
  }))

  // Calculate percentages
  const totalReviews = ratings.length
  const percentages = ratingCounts.map((item) => ({
    ...item,
    percentage: Math.round((item.value / totalReviews) * 100),
  }))

  // Calculate average rating
  const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / totalReviews

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Rating Distribution</h2>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={ratingCounts} margin={{ top: 20, right: 30, left: 20, bottom: 40 }} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis type="number" />
            <YAxis
              dataKey="name"
              type="category"
              axisLine={false}
              tickLine={false}
              tick={({ x, y, payload }) => (
                <g transform={`translate(${x},${y})`}>
                  <text x={-20} y={4} textAnchor="end" fill="#666">
                    {payload.value.replace("★", "")}
                    <tspan fontSize="16" fill="#666">
                      ★
                    </tspan>
                  </text>
                </g>
              )}
            />
            <Tooltip
              formatter={(value: number) => [`${value} reviews`, "Count"]}
              labelFormatter={(label) => `${label.replace("★", "")} Star Rating`}
            />
            <Bar dataKey="value" fill="#8884d8" radius={[0, 0, 0, 0]} barSize={30} name="Number of Reviews" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="text-sm text-gray-600 mt-6 bg-gray-100 p-4 rounded-lg">
        <p className="text-lg font-medium mb-2">
          This chart shows the distribution of ratings across all {totalReviews} reviews.
        </p>
        <p className="mb-1">
          {percentages[0].percentage}% of reviewers gave 5 stars,
          {percentages[1].percentage}% gave 4 stars,
          {percentages[2].percentage}% gave 3 stars,
          {percentages[3].percentage}% gave 2 stars, and
          {percentages[4].percentage}% gave 1 star.
        </p>
        <p className="mt-2">Average Rating: {averageRating.toFixed(2)} stars</p>
      </div>
    </div>
  )
}
