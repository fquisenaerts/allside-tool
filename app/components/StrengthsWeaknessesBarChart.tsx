"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface StrengthsWeaknessesBarChartProps {
  strengths: { name: string; value: number }[]
  weaknesses: { name: string; value: number }[]
}

export function StrengthsWeaknessesBarChart({ strengths, weaknesses }: StrengthsWeaknessesBarChartProps) {
  // Sort strengths and weaknesses by value in descending order
  const sortedStrengths = [...strengths].sort((a, b) => b.value - a.value).slice(0, 5)
  const sortedWeaknesses = [...weaknesses].sort((a, b) => b.value - a.value).slice(0, 5)

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Top Strengths</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sortedStrengths} layout="vertical">
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={100} />
              <Tooltip />
              <Bar dataKey="value" fill="#4ade80" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Weaknesses cited</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sortedWeaknesses} layout="vertical">
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={100} />
              <Tooltip />
              <Bar dataKey="value" fill="#f87171" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
