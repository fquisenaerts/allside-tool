"use client"

import { useMemo } from "react"
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RatingBoxPlotProps {
  ratings: number[]
  explanation?: string
}

export function RatingBoxPlot({ ratings, explanation }: RatingBoxPlotProps) {
  // Process the ratings data to create box plot statistics
  const boxPlotData = useMemo(() => {
    if (!ratings || ratings.length === 0) {
      return []
    }

    // Sort ratings for percentile calculations
    const sortedRatings = [...ratings].sort((a, b) => a - b)
    const n = sortedRatings.length

    // Calculate quartiles and other statistics
    const q1Index = Math.floor(n * 0.25)
    const medianIndex = Math.floor(n * 0.5)
    const q3Index = Math.floor(n * 0.75)

    const min = sortedRatings[0]
    const q1 = sortedRatings[q1Index]
    const median = sortedRatings[medianIndex]
    const q3 = sortedRatings[q3Index]
    const max = sortedRatings[n - 1]

    // Calculate IQR and outliers
    const iqr = q3 - q1
    const lowerFence = q1 - 1.5 * iqr
    const upperFence = q3 + 1.5 * iqr

    // Find outliers
    const outliers = sortedRatings.filter((rating) => rating < lowerFence || rating > upperFence)

    // Create distribution data for histogram overlay
    const distribution = [1, 2, 3, 4, 5].map((rating) => ({
      rating,
      count: ratings.filter((r) => Math.round(r) === rating).length,
      percentage: (ratings.filter((r) => Math.round(r) === rating).length / ratings.length) * 100,
      q1: rating === 2 ? q1 : null,
      median: rating === 3 ? median : null,
      q3: rating === 4 ? q3 : null,
      min: rating === 1 ? min : null,
      max: rating === 5 ? max : null,
    }))

    return {
      distribution,
      statistics: {
        min,
        q1,
        median,
        q3,
        max,
        mean: ratings.reduce((sum, r) => sum + r, 0) / ratings.length,
        outliers: outliers.length,
        iqr,
      },
    }
  }, [ratings])

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded shadow-md">
          <p className="font-bold">{label} Stars</p>
          <p>Count: {data.count} reviews</p>
          <p>Percentage: {data.percentage.toFixed(1)}%</p>
          {data.q1 && <p>Q1: {data.q1.toFixed(2)}</p>}
          {data.median && <p>Median: {data.median.toFixed(2)}</p>}
          {data.q3 && <p>Q3: {data.q3.toFixed(2)}</p>}
          {data.min && <p>Minimum: {data.min.toFixed(2)}</p>}
          {data.max && <p>Maximum: {data.max.toFixed(2)}</p>}
        </div>
      )
    }
    return null
  }

  // Generate explanation if not provided
  const generateExplanation = () => {
    if (explanation) return explanation

    if (!boxPlotData.statistics) {
      return "No rating data available for analysis."
    }

    const { min, q1, median, q3, max, mean, outliers, iqr } = boxPlotData.statistics

    let analysis = `This box plot analysis shows the distribution of ratings across your reviews. `

    analysis += `The median rating is ${median.toFixed(2)} stars, with 50% of ratings falling between ${q1.toFixed(2)} and ${q3.toFixed(2)} stars (the interquartile range). `

    analysis += `The average rating is ${mean.toFixed(2)} stars. `

    if (outliers > 0) {
      analysis += `There are ${outliers} outlier ratings that fall significantly outside the typical range. `
    } else {
      analysis += `There are no significant outlier ratings, indicating consistent customer experiences. `
    }

    // Analyze distribution shape
    const skewness = mean - median
    if (Math.abs(skewness) < 0.1) {
      analysis += `The distribution is fairly symmetric, suggesting balanced customer experiences. `
    } else if (skewness > 0.1) {
      analysis += `The distribution is slightly skewed toward higher ratings, which is positive for your business. `
    } else {
      analysis += `The distribution is skewed toward lower ratings, indicating areas for improvement. `
    }

    // Analyze spread
    if (iqr < 1) {
      analysis += `The narrow interquartile range (${iqr.toFixed(2)}) indicates consistent customer experiences.`
    } else if (iqr > 2) {
      analysis += `The wide interquartile range (${iqr.toFixed(2)}) suggests varied customer experiences that may need attention.`
    } else {
      analysis += `The interquartile range (${iqr.toFixed(2)}) shows moderate variation in customer experiences.`
    }

    return analysis
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rating Distribution Box Plot</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          {boxPlotData.distribution && boxPlotData.distribution.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={boxPlotData.distribution} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" label={{ value: "Rating (Stars)", position: "insideBottom", offset: -5 }} />
                <YAxis yAxisId="left" label={{ value: "Count", angle: -90, position: "insideLeft" }} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  label={{ value: "Quartiles", angle: 90, position: "insideRight" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />

                {/* Histogram bars */}
                <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="Review Count" />

                {/* Box plot elements as lines */}
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="min"
                  stroke="#ff0000"
                  strokeWidth={3}
                  name="Minimum"
                  connectNulls={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="q1"
                  stroke="#ff7300"
                  strokeWidth={3}
                  name="Q1 (25th percentile)"
                  connectNulls={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="median"
                  stroke="#00ff00"
                  strokeWidth={4}
                  name="Median"
                  connectNulls={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="q3"
                  stroke="#0088fe"
                  strokeWidth={3}
                  name="Q3 (75th percentile)"
                  connectNulls={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="max"
                  stroke="#8884d8"
                  strokeWidth={3}
                  name="Maximum"
                  connectNulls={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No rating data available</p>
            </div>
          )}
        </div>

        {/* Statistics Summary */}
        {boxPlotData.statistics && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-lg font-bold text-red-600">{boxPlotData.statistics.min.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Minimum</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-lg font-bold text-orange-600">{boxPlotData.statistics.q1.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Q1 (25%)</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-lg font-bold text-green-600">{boxPlotData.statistics.median.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Median</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-lg font-bold text-blue-600">{boxPlotData.statistics.q3.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Q3 (75%)</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-lg font-bold text-purple-600">{boxPlotData.statistics.max.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Maximum</div>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-2">Statistical Analysis</h3>
          <p className="text-gray-700 leading-relaxed">{generateExplanation()}</p>
        </div>
      </CardContent>
    </Card>
  )
}
