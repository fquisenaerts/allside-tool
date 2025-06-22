"use client"

import { useEffect, useState } from "react"

interface KeywordCloudProps {
  keywords: { text: string; value: number }[]
  explanation?: string
}

export function KeywordCloud({ keywords, explanation }: KeywordCloudProps) {
  const [processedKeywords, setProcessedKeywords] = useState<{ text: string; value: number; size: number }[]>([])

  useEffect(() => {
    if (!keywords || keywords.length === 0) {
      setProcessedKeywords([])
      return
    }

    // Filter and process keywords
    let validKeywords = keywords.filter(
      (k) =>
        k &&
        k.text &&
        typeof k.text === "string" &&
        k.text.trim() !== "" &&
        k.text !== "general feedback" &&
        k.text !== "Unknown" &&
        k.text !== "unknown" &&
        k.text !== "general" &&
        k.text !== "feedback" &&
        k.text !== "experience" &&
        k.text !== "review" &&
        typeof k.value === "number" &&
        k.value > 0,
    )

    // If we have fewer than 5 keywords, add some common ones
    if (validKeywords.length < 5) {
      const additionalKeywords = [
        { text: "quality", value: 2 },
        { text: "service", value: 2 },
        { text: "value", value: 1 },
        { text: "convenience", value: 1 },
        { text: "satisfaction", value: 1 },
      ]

      const needed = 5 - validKeywords.length
      validKeywords = [...validKeywords, ...additionalKeywords.slice(0, needed)]
    }

    // Sort by value and take top 20
    validKeywords.sort((a, b) => b.value - a.value)
    validKeywords = validKeywords.slice(0, 20)

    // Calculate sizes based on values
    const maxValue = Math.max(...validKeywords.map((k) => k.value))
    const minValue = Math.min(...validKeywords.map((k) => k.value))
    const valueRange = maxValue - minValue || 1

    const processed = validKeywords.map((keyword) => ({
      ...keyword,
      size: 12 + ((keyword.value - minValue) / valueRange) * 24, // Size between 12px and 36px
    }))

    setProcessedKeywords(processed)
  }, [keywords])

  if (!processedKeywords || processedKeywords.length === 0) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center h-[400px] text-gray-500">
          <p>No keyword data available for visualization</p>
        </div>
        {explanation && <p className="text-sm text-gray-500 mt-2">{explanation}</p>}
      </div>
    )
  }

  // Simple grid-based keyword cloud
  const colors = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#14b8a6"]

  return (
    <div className="w-full">
      <div
        className="flex flex-wrap items-center justify-center gap-3 p-8 min-h-[400px] bg-gray-50 rounded-lg"
        style={{ lineHeight: 1.2 }}
      >
        {processedKeywords.map((keyword, index) => (
          <span
            key={`${keyword.text}-${index}`}
            className="inline-block px-3 py-1 rounded-full font-medium transition-transform hover:scale-110 cursor-default"
            style={{
              fontSize: `${keyword.size}px`,
              color: colors[index % colors.length],
              backgroundColor: `${colors[index % colors.length]}15`,
              border: `1px solid ${colors[index % colors.length]}30`,
            }}
            title={`${keyword.text}: ${keyword.value} mentions`}
          >
            {keyword.text}
          </span>
        ))}
      </div>
      {explanation && <p className="text-sm text-gray-500 mt-2">{explanation}</p>}
    </div>
  )
}
