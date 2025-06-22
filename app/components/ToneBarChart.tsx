"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export function ToneBarChart({
  data,
  explanation,
  topStrengths = [],
  topWeaknesses = [],
}: {
  data: { name: string; value: number }[] | { [key: string]: number }
  explanation?: string
  topStrengths?: { strength: string; count: number }[]
  topWeaknesses?: { weakness: string; count: number }[]
}) {
  // Convert object to array if necessary
  const chartData = Array.isArray(data) ? data : Object.entries(data).map(([name, value]) => ({ name, value }))

  if (!chartData || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tone Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            <p>No tone data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Filter to just positive and negative for the chart
  const filteredData = chartData.filter((item) => item.name === "Positive" || item.name === "Negative")

  // Generate a more comprehensive explanation
  const generateDetailedExplanation = () => {
    if (explanation) return explanation

    // Find the values for each tone
    const positiveData = chartData.find((d) => d.name === "Positive")
    const negativeData = chartData.find((d) => d.name === "Negative")

    const positiveValue = positiveData ? positiveData.value : 0
    const negativeValue = negativeData ? negativeData.value : 0

    // Create tone-specific advice based on dominant sentiment
    if (positiveValue > negativeValue) {
      return `The predominantly positive tone in your reviews indicates strong customer satisfaction. This positive sentiment creates an excellent foundation for brand advocacy and word-of-mouth marketing, suggesting your current strategies are resonating well with customers.`
    } else {
      return `The predominantly negative tone in your reviews signals customer dissatisfaction that requires attention. This negative sentiment could be impacting your brand reputation and deterring potential customers.`
    }
  }

  // Custom colors for the bars
  const getBarColor = (name: string) => {
    if (name === "Positive") return "#4ade80" // Green
    if (name === "Negative") return "#ef4444" // Red
    return "#3b82f6" // Default blue
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-8">Tone Analysis</h2>
        <h3 className="text-4xl font-bold mb-6">Tone Breakdown</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 16, fill: "#666" }} />
              <YAxis domain={[0, 0.8]} tickCount={5} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value: number) => [`${(value * 100).toFixed(0)}%`, "Percentage"]}
                labelStyle={{ fontWeight: "bold" }}
              />
              <Bar
                dataKey="value"
                name="Tone"
                fill="#8884d8"
                barSize={80}
                radius={[0, 0, 0, 0]}
                fillOpacity={1}
                isAnimationActive={true}
                animationDuration={1000}
                animationEasing="ease-out"
              >
                {filteredData.map((entry, index) => (
                  <rect key={`rect-${index}`} fill={getBarColor(entry.name)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center mt-2">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-black mr-2"></div>
            <span className="text-lg">Tone</span>
          </div>
        </div>
        <p className="text-gray-600 text-lg leading-relaxed mt-8">{generateDetailedExplanation()}</p>
      </div>
    </div>
  )
}
