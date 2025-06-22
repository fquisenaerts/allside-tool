"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

const COLORS = {
  Positive: "#4ade80", // Bright green
  Negative: "#ef4444", // Red
  Neutral: "#3b82f6", // Blue
}

export function SentimentPieChart({
  data,
  explanation,
  reviewCount,
  topStrengths = [],
  topWeaknesses = [],
}: {
  data: { name: string; value: number }[]
  explanation?: string
  reviewCount?: number
  topStrengths?: { strength: string; count: number }[]
  topWeaknesses?: { weakness: string; count: number }[]
}) {
  // Ensure we have valid data
  const validData =
    data && data.length > 0
      ? data
      : [
          { name: "Positive", value: 0 },
          { name: "Negative", value: 0 },
          { name: "Neutral", value: 0 },
        ]

  const total = validData.reduce((sum, item) => sum + item.value, 0)
  const dataWithPercentages = validData.map((item) => ({
    ...item,
    value: total > 0 ? (item.value / total) * 100 : 0,
    percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : "0.0",
  }))

  // Generate personalized explanation based on actual review content
  const generateContextualizedExplanation = () => {
    // If an explanation was provided as a prop, use that
    if (explanation) return explanation

    const positiveData = dataWithPercentages.find((d) => d.name === "Positive")
    const negativeData = dataWithPercentages.find((d) => d.name === "Negative")
    const neutralData = dataWithPercentages.find((d) => d.name === "Neutral")

    const positivePercentage = positiveData ? Number.parseFloat(positiveData.percentage) : 0
    const negativePercentage = negativeData ? Number.parseFloat(negativeData.percentage) : 0
    const neutralPercentage = neutralData ? Number.parseFloat(neutralData.percentage) : 0

    // Extract specific themes from strengths and weaknesses
    const specificStrengths =
      topStrengths
        ?.filter((s) => s.strength && s.strength !== "not specified" && s.strength !== "good experience")
        .slice(0, 3)
        .map((s) => s.strength) || []

    const specificWeaknesses =
      topWeaknesses
        ?.filter((w) => w.weakness && w.weakness !== "not specified" && w.weakness !== "issues mentioned")
        .slice(0, 3)
        .map((w) => w.weakness) || []

    // Create a contextualized explanation based on actual data
    return `This sentiment distribution provides crucial insights for your marketing strategy. With ${positivePercentage}% positive reviews, you have a solid foundation to build upon. ${
      negativePercentage > 0
        ? `However, the ${negativePercentage}% negative reviews present an opportunity for improvement and addressing customer concerns.`
        : ""
    } ${
      neutralPercentage > 0
        ? `The ${neutralPercentage}% neutral reviews suggest room for converting these customers into advocates through targeted messaging and product enhancements.`
        : ""
    }`
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium">{`${payload[0].name}: ${Number(payload[0].value).toFixed(1)}%`}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-black">Overall Satisfaction</h2>
      <div className="space-y-8">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataWithPercentages}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                animationDuration={1000}
              >
                {dataWithPercentages.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || "#cccccc"} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex justify-center items-center gap-8">
          {Object.entries(COLORS).map(([name, color]) => (
            <div key={name} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }}></div>
              <span>{name}</span>
            </div>
          ))}
        </div>

        <p className="text-gray-600 text-lg leading-relaxed">{generateContextualizedExplanation()}</p>
      </div>
    </div>
  )
}
