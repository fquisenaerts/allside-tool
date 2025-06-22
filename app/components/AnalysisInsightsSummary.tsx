import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

const SATISFACTION_COLORS = {
  Positive: "#22c55e",
  Negative: "#ef4444",
  Neutral: "#3b82f6",
}

interface AnalysisInsightsSummaryProps {
  analysisResults: any
}

export function AnalysisInsightsSummary({ analysisResults }: AnalysisInsightsSummaryProps) {
  if (!analysisResults) return null

  // Prepare satisfaction data with proper colors
  const satisfactionData = [
    {
      name: "Positive",
      value: analysisResults.sentiment?.positive || 0,
      color: SATISFACTION_COLORS.Positive,
    },
    {
      name: "Negative",
      value: analysisResults.sentiment?.negative || 0,
      color: SATISFACTION_COLORS.Negative,
    },
    {
      name: "Neutral",
      value: analysisResults.sentiment?.neutral || 0,
      color: SATISFACTION_COLORS.Neutral,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Overall Satisfaction</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={satisfactionData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
            >
              {satisfactionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-white p-2 border rounded shadow">
                      <p style={{ color: data.color }}>{`${data.name}: ${data.value.toFixed(1)}%`}</p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Legend
              content={({ payload }) => (
                <div className="flex justify-center gap-4 mt-4">
                  {payload?.map((entry, index) => (
                    <div key={`item-${index}`} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-sm">{entry.value}</span>
                    </div>
                  ))}
                </div>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
