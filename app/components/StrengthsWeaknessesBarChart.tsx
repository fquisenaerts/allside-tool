"use client"

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface StrengthsWeaknessesBarChartProps {
  data: any[]
  type: "strengths" | "weaknesses"
  explanation?: string
}

export function StrengthsWeaknessesBarChart({ data = [], type, explanation }: StrengthsWeaknessesBarChartProps) {
  // Format the data for the chart
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return [{ name: "No data available", value: 0 }]
    }

    // Map the data to the format expected by the chart
    return (
      data
        .map((item) => {
          if (type === "strengths") {
            return {
              name: item.strength || "Unknown",
              value: item.count || 0,
            }
          } else {
            return {
              name: item.weakness || "Unknown",
              value: item.count || 0,
            }
          }
        })
        // Sort by value in descending order
        .sort((a, b) => b.value - a.value)
        // Take only the top 5
        .slice(0, 5)
    )
  }, [data, type])

  // Define colors based on type
  const barColor = type === "strengths" ? "#4CAF50" : "#F44336"

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 100, // Increased left margin for longer text
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12 }}
            width={90} // Control the width of the Y-axis
          />
          <Tooltip formatter={(value) => [`${value} mentions`, type === "strengths" ? "Strength" : "Weakness"]} />
          <Bar dataKey="value" name={type === "strengths" ? "Strengths" : "Weaknesses"}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={barColor} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {explanation && <p className="mt-4 text-sm text-gray-600">{explanation}</p>}
    </div>
  )
}
