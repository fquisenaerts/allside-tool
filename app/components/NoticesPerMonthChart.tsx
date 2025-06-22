"use client"

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface NoticesPerMonthChartProps {
  data: { date: string; count: number }[]
}

export function NoticesPerMonthChart({ data = [] }: NoticesPerMonthChartProps) {
  // Format the data for the chart
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      // Return sample data if no data is provided
      return [
        { month: "Jan", count: 0 },
        { month: "Feb", count: 0 },
        { month: "Mar", count: 0 },
        { month: "Apr", count: 0 },
        { month: "May", count: 0 },
        { month: "Jun", count: 0 },
      ]
    }

    // Group by month and year
    const monthlyData = {}

    data.forEach((item) => {
      if (!item || !item.date || item.date === "Unknown") return

      try {
        // Try to parse the date
        const date = new Date(item.date)
        if (isNaN(date.getTime())) return // Skip invalid dates

        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        const monthName = date.toLocaleString("default", { month: "short" })
        const displayName = `${monthName} ${date.getFullYear()}`

        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = { month: displayName, count: 0, monthYear }
        }

        monthlyData[monthYear].count += item.count || 1
      } catch (error) {
        console.error("Error processing date:", item.date, error)
      }
    })

    // Convert to array and sort by date
    return Object.values(monthlyData).sort((a: any, b: any) => a.monthYear.localeCompare(b.monthYear))
  }, [data])

  if (chartData.length === 0) {
    return <div className="text-center p-4">No date data available</div>
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" name="Reviews" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
