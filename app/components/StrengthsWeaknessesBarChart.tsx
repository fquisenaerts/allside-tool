"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface StrengthsWeaknessesBarChartProps {
  strengths?: { name: string; value: number }[] | null
  weaknesses?: { name: string; value: number }[] | null
}

export function StrengthsWeaknessesBarChart({ strengths = [], weaknesses = [] }: StrengthsWeaknessesBarChartProps) {
  // Ensure strengths and weaknesses are arrays
  const strengthsArray = Array.isArray(strengths) ? strengths : []
  const weaknessesArray = Array.isArray(weaknesses) ? weaknesses : []

  // Sort strengths and weaknesses by value in descending order
  const sortedStrengths =
    strengthsArray.length > 0
      ? [...strengthsArray].sort((a, b) => b.value - a.value).slice(0, 5)
      : [{ name: "No data available", value: 0 }]

  const sortedWeaknesses =
    weaknessesArray.length > 0
      ? [...weaknessesArray].sort((a, b) => b.value - a.value).slice(0, 5)
      : [{ name: "No data available", value: 0 }]

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Top Strengths</CardTitle>
        </CardHeader>
        <CardContent>
          {strengthsArray.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-gray-500">No strength data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sortedStrengths} layout="vertical">
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#4ade80" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Weaknesses cited</CardTitle>
        </CardHeader>
        <CardContent>
          {weaknessesArray.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-gray-500">No weakness data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sortedWeaknesses} layout="vertical">
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#f87171" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
