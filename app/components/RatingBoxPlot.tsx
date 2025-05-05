"use client"

import { useMemo } from "react"
import { ResponsiveContainer, ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RatingBoxPlotProps {
  reviewData: any[]
  explanation?: string
}

// Custom BoxPlot component using Recharts
export function RatingBoxPlot({ reviewData, explanation }: RatingBoxPlotProps) {
  // Process the data to create box plot statistics
  const boxPlotData = useMemo(() => {
    if (!reviewData || reviewData.length === 0) {
      console.log("No review data available for box plot")
      return []
    }

    console.log("Processing review data for box plot:", reviewData.length, "reviews")

    // Extract categories from the reviews
    const categories = new Set<string>()
    const reviewsByCategory: Record<string, number[]> = {}

    // Define default categories to ensure we always have some data
    const defaultCategories = ["Product", "Service", "Delivery", "Price", "Experience"]
    defaultCategories.forEach((cat) => {
      categories.add(cat)
      reviewsByCategory[cat] = []
    })

    // First pass: identify categories and group ratings
    reviewData.forEach((review) => {
      if (!review) return

      // Extract text content safely
      const reviewText = review.text || ""

      // Common categories to check for
      const categoryKeywords = {
        Product: ["product", "quality", "durability", "feature", "functionality"],
        Service: ["service", "staff", "support", "assistance", "help"],
        Delivery: ["delivery", "shipping", "arrival", "package", "shipment"],
        Price: ["price", "cost", "value", "expensive", "cheap"],
        Experience: ["experience", "store", "shop", "visit", "atmosphere"],
      }

      // Check each category
      let foundCategory = false
      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some((keyword) => reviewText.toLowerCase().includes(keyword))) {
          // Use the score (normalized to 1-5 scale)
          const rating = review.score ? Math.round(review.score * 5) : 3
          reviewsByCategory[category].push(rating)
          foundCategory = true
        }
      }

      // If no specific category was found, add to "Other"
      if (!foundCategory) {
        if (!reviewsByCategory["Other"]) {
          reviewsByCategory["Other"] = []
          categories.add("Other")
        }
        const rating = review.score ? Math.round(review.score * 5) : 3
        reviewsByCategory["Other"].push(rating)
      }
    })

    console.log("Categories extracted:", Array.from(categories))
    console.log(
      "Reviews by category:",
      Object.fromEntries(Object.entries(reviewsByCategory).map(([k, v]) => [k, v.length])),
    )

    // Calculate box plot statistics for each category
    return Array.from(categories)
      .map((category) => {
        const ratings = reviewsByCategory[category] || []

        if (ratings.length === 0) {
          // For empty categories, use default values that will render as a flat line
          return {
            category,
            min: 2.5,
            q1: 2.5,
            median: 2.5,
            q3: 2.5,
            max: 2.5,
            count: 0,
          }
        }

        // Sort ratings for percentile calculations
        ratings.sort((a, b) => a - b)

        const min = ratings[0]
        const max = ratings[ratings.length - 1]
        const q1 = ratings[Math.floor(ratings.length * 0.25)] || min
        const median = ratings[Math.floor(ratings.length * 0.5)] || min
        const q3 = ratings[Math.floor(ratings.length * 0.75)] || max

        return {
          category,
          min,
          q1,
          median,
          q3,
          max,
          count: ratings.length,
        }
      })
      .filter((item) => item.count > 0) // Only include categories with data
      .sort((a, b) => b.count - a.count) // Sort by count to show most discussed categories first
  }, [reviewData])

  // Custom tooltip for the box plot
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded shadow-md">
          <p className="font-bold">{data.category}</p>
          <p>Reviews: {data.count}</p>
          <p>Minimum: {data.min}</p>
          <p>25th Percentile: {data.q1}</p>
          <p>Median: {data.median}</p>
          <p>75th Percentile: {data.q3}</p>
          <p>Maximum: {data.max}</p>
        </div>
      )
    }
    return null
  }

  // Custom shape for the box plot with proper null checks
  const BoxPlotShape = (props: any) => {
    const { x, y, width, height, datum } = props

    // Safety check - if datum is undefined or doesn't have required properties, render nothing
    if (!datum || typeof datum.min === "undefined") {
      return null
    }

    // Calculate positions for box plot elements
    const boxWidth = width * 0.6
    const boxX = x + (width - boxWidth) / 2

    // Calculate y positions for each statistic
    const yMin = y + (height * (5 - datum.min)) / 5
    const yQ1 = y + (height * (5 - datum.q1)) / 5
    const yMedian = y + (height * (5 - datum.median)) / 5
    const yQ3 = y + (height * (5 - datum.q3)) / 5
    const yMax = y + (height * (5 - datum.max)) / 5

    return (
      <g>
        {/* Vertical line from min to max */}
        <line x1={x + width / 2} y1={yMin} x2={x + width / 2} y2={yMax} stroke="#8884d8" strokeWidth={2} />

        {/* Box from Q1 to Q3 */}
        <rect x={boxX} y={yQ3} width={boxWidth} height={yQ1 - yQ3} fill="#8884d8" fillOpacity={0.3} stroke="#8884d8" />

        {/* Median line */}
        <line x1={boxX} y1={yMedian} x2={boxX + boxWidth} y2={yMedian} stroke="#8884d8" strokeWidth={2} />

        {/* Min line (whisker) */}
        <line
          x1={boxX + boxWidth / 4}
          y1={yMin}
          x2={boxX + (boxWidth * 3) / 4}
          y2={yMin}
          stroke="#8884d8"
          strokeWidth={2}
        />

        {/* Max line (whisker) */}
        <line
          x1={boxX + boxWidth / 4}
          y1={yMax}
          x2={boxX + (boxWidth * 3) / 4}
          y2={yMax}
          stroke="#8884d8"
          strokeWidth={2}
        />
      </g>
    )
  }

  // Generate explanation if not provided
  const generateExplanation = () => {
    if (explanation) return explanation

    if (boxPlotData.length === 0) {
      return "No category data available for analysis."
    }

    const topCategory = boxPlotData[0]

    // Find most consistent and variable categories safely
    let mostConsistent = topCategory
    let mostVariable = topCategory

    if (boxPlotData.length > 1) {
      mostConsistent = boxPlotData.reduce((prev, curr) => (curr.q3 - curr.q1 < prev.q3 - prev.q1 ? curr : prev))

      mostVariable = boxPlotData.reduce((prev, curr) => (curr.q3 - curr.q1 > prev.q3 - prev.q1 ? curr : prev))
    }

    return `
      This box plot shows the distribution of ratings across different categories mentioned in reviews. 
      
      The most discussed category is "${topCategory.category}" with ${topCategory.count} mentions. 
      
      "${mostConsistent.category}" shows the most consistent ratings (smallest interquartile range), 
      while "${mostVariable.category}" has the most variable ratings (largest interquartile range).
      
      Each box represents the middle 50% of ratings, with the horizontal line showing the median. 
      The whiskers extend to the minimum and maximum ratings in each category.
    `
  }

  // Render a fallback if there's no data
  if (!reviewData || reviewData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rating Distribution by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <p className="text-gray-500">No review data available for category analysis</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rating Distribution by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          {boxPlotData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={boxPlotData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis
                  domain={[0, 5]}
                  ticks={[0, 1, 2, 3, 4, 5]}
                  label={{ value: "Rating", angle: -90, position: "insideLeft" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {/* Use a dummy bar to enable the custom shape */}
                <Bar dataKey="count" fill="#8884d8" shape={<BoxPlotShape />} name="Rating Distribution" />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No category data available</p>
            </div>
          )}
        </div>
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-2">Category Analysis</h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{generateExplanation()}</p>
        </div>
      </CardContent>
    </Card>
  )
}
