import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"

const SENTIMENT_COLORS = {
  Positive: "#22c55e",
  Negative: "#ef4444",
  Neutral: "#3b82f6",
}

const TONE_COLORS = {
  Positive: "#22c55e",
  Neutral: "#3b82f6",
  Negative: "#ef4444",
}

export function AnalysisResultsCard({ results, index }: { results: any; index: number }) {
  if (!results) return null

  // Prepare sentiment data with proper colors
  const sentimentData = [
    { name: "Positive", value: results.sentiment?.positive || 0, color: SENTIMENT_COLORS.Positive },
    { name: "Negative", value: results.sentiment?.negative || 0, color: SENTIMENT_COLORS.Negative },
    { name: "Neutral", value: results.sentiment?.neutral || 0, color: SENTIMENT_COLORS.Neutral },
  ]

  // Prepare tone data with proper formatting (2 decimal places)
  const toneData = [
    {
      name: "Positive",
      value: Number((results.sentiment?.positive || 0).toFixed(2)),
      color: TONE_COLORS.Positive,
    },
    {
      name: "Neutral",
      value: Number((results.sentiment?.neutral || 0).toFixed(2)),
      color: TONE_COLORS.Neutral,
    },
    {
      name: "Negative",
      value: Number((results.sentiment?.negative || 0).toFixed(2)),
      color: TONE_COLORS.Negative,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Sentiment Distribution Card */}
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
              >
                {sentimentData.map((entry, index) => (
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

      {/* Tone Distribution Card */}
      <Card>
        <CardHeader>
          <CardTitle>Tone Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={toneData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} tickFormatter={(value) => `${value.toFixed(2)}%`} />
              <Tooltip
                formatter={(value: any) => [`${Number(value).toFixed(2)}%`, "Percentage"]}
                labelStyle={{ color: "#000" }}
              />
              <Legend />
              <Bar dataKey="value" name="Tone Percentage">
                {toneData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
