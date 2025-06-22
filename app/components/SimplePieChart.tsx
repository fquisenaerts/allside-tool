"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface SimplePieChartProps {
  data: { name: string; value: number; percentage?: string }[]
  title?: string
  legend?: { name: string; color: string }[]
}

export function SimplePieChart({ data, title, legend }: SimplePieChartProps) {
  // Define colors for the pie chart segments
  const COLORS = {
    Positive: "#22c55e", // Green
    Negative: "#ef4444", // Red
    Neutral: "#3b82f6", // Blue
  }

  // Custom renderer for the pie chart labels
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const RADIAN = Math.PI / 180
    const radius = outerRadius * 1.1
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    // Only show label if the segment is significant enough (more than 5%)
    return percent > 0.05 ? (
      <text
        x={x}
        y={y}
        fill="#000000"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight={500}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null
  }

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-medium mb-4">{title}</h3>}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    COLORS[entry.name as keyof typeof COLORS] || `#${Math.floor(Math.random() * 16777215).toString(16)}`
                  }
                />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} labelFormatter={(name) => `${name}`} />
            {legend && (
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                payload={legend.map((item) => ({
                  value: item.name,
                  type: "circle",
                  color: item.color,
                }))}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
