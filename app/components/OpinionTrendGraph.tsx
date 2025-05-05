import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

interface OpinionTrendGraphProps {
  data: string // "improving", "deteriorating", or "stable"
}

export function OpinionTrendGraph({ data }: OpinionTrendGraphProps) {
  // This is a simplified representation. In a real-world scenario, you'd want to use actual data points.
  const trendData = [
    { month: "Jan", score: 50 },
    { month: "Feb", score: data === "improving" ? 60 : data === "deteriorating" ? 40 : 50 },
    { month: "Mar", score: data === "improving" ? 70 : data === "deteriorating" ? 30 : 50 },
    { month: "Apr", score: data === "improving" ? 80 : data === "deteriorating" ? 20 : 50 },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={trendData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="score" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  )
}
