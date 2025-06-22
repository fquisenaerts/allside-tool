"use client"

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

interface SimpleBarChartProps {
  data: { name: string; value: number }[]
  title?: string
  color?: string
  valueFormatter?: (value: number) => string
}

export function SimpleBarChart({
  data,
  title,
  color = "#3b82f6",
  valueFormatter = (value) => `${Math.round(value)}%`,
}: SimpleBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        <p>No data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {title && <h3 className="text-lg font-medium">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(value) => `${Math.round(value)}%`} />
          <Tooltip formatter={(value) => [valueFormatter(Number(value)), "Value"]} />
          <Legend />
          <Bar dataKey="value" fill={color} name="Percentage" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
