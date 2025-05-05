"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line } from "recharts"

interface RatingBoxPlotProps {
  categoryRatings: {
    category: string
    min: number
    q1: number
    median: number
    q3: number
    max: number
    mean: number
  }[]
}

export function RatingBoxPlot({ categoryRatings = [] }: RatingBoxPlotProps) {
  // If no data is provided, create some default categories
  const data =
    categoryRatings.length > 0
      ? categoryRatings
      : [
          { category: "Product", min: 3, q1: 3.5, median: 4, q3: 4.5, max: 5, mean: 4.1 },
          { category: "Service", min: 2, q1: 3, median: 3.5, q3: 4, max: 5, mean: 3.7 },
          { category: "Delivery", min: 1, q1: 2, median: 3, q3: 4, max: 5, mean: 3.2 },
          { category: "Price", min: 2, q1: 2.5, median: 3, q3: 4, max: 5, mean: 3.4 },
          { category: "Experience", min: 3, q1: 3.5, median: 4, q3: 4.5, max: 5, mean: 4.0 },
        ]

  // Log the data for debugging
  console.log("RatingBoxPlot data:", data)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rating Distribution by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis domain={[0, 5]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="min" stackId="a" fill="#8884d8" name="Min" />
            <Bar dataKey="q1" stackId="a" fill="#82ca9d" name="Q1" />
            <Bar dataKey="median" stackId="a" fill="#ffc658" name="Median" />
            <Bar dataKey="q3" stackId="a" fill="#ff8042" name="Q3" />
            <Bar dataKey="max" stackId="a" fill="#0088fe" name="Max" />
            <Line type="monotone" dataKey="mean" stroke="#ff7300" name="Mean" />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
