import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

interface ReviewCountGraphProps {
  data: { date: string; count: number }[] | { [key: string]: number }
}

export function ReviewCountGraph({ data }: ReviewCountGraphProps) {
  // Convert object to array if necessary
  const chartData = Array.isArray(data) ? data : Object.entries(data).map(([date, count]) => ({ date, count }))

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
