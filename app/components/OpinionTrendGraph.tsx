import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

interface OpinionTrendGraphProps {
  data: string // "improving", "deteriorating", or "stable"
}

export function OpinionTrendGraph({ data }: OpinionTrendGraphProps) {
  // This is a simplified representation. In a real-world scenario, you'd want to use actual data points.
  const trendData = [
    { month: "Jan", score: data === "improving" ? 45 : data === "deteriorating" ? 65 : 50 },
    { month: "Feb", score: data === "improving" ? 52 : data === "deteriorating" ? 58 : 48 },
    { month: "Mar", score: data === "improving" ? 61 : data === "deteriorating" ? 45 : 52 },
    { month: "Apr", score: data === "improving" ? 68 : data === "deteriorating" ? 38 : 49 },
    { month: "May", score: data === "improving" ? 74 : data === "deteriorating" ? 32 : 51 },
    { month: "Jun", score: data === "improving" ? 79 : data === "deteriorating" ? 28 : 53 },
    { month: "Jul", score: data === "improving" ? 83 : data === "deteriorating" ? 25 : 0 },
    { month: "Aug", score: data === "improving" ? 87 : data === "deteriorating" ? 22 : 0 },
    { month: "Sep", score: data === "improving" ? 90 : data === "deteriorating" ? 20 : 0 },
    { month: "Oct", score: data === "improving" ? 92 : data === "deteriorating" ? 18 : 0 },
    { month: "Nov", score: data === "improving" ? 94 : data === "deteriorating" ? 16 : 0 },
    { month: "Dec", score: data === "improving" ? 96 : data === "deteriorating" ? 15 : 0 },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={trendData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="score" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  )
}
