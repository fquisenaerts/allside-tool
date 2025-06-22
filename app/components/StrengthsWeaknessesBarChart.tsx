"use client"

import { SimpleBarChart } from "./SimpleBarChart"

interface StrengthsWeaknessesBarChartProps {
  strengths?: { name: string; value: number }[]
  weaknesses?: { name: string; value: number }[]
}

export function StrengthsWeaknessesBarChart({ strengths, weaknesses }: StrengthsWeaknessesBarChartProps) {
  if (strengths && strengths.length > 0) {
    return <SimpleBarChart data={strengths} title="Strengths Cited" color="#22c55e" />
  }

  if (weaknesses && weaknesses.length > 0) {
    return <SimpleBarChart data={weaknesses} title="Areas for Improvement" color="#ef4444" />
  }

  return (
    <div className="w-full h-[300px] flex items-center justify-center text-gray-500">
      <p>No data available</p>
    </div>
  )
}
