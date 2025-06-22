"use client"

interface OpinionTrendGraphProps {
  data?: string
}

export function OpinionTrendGraph({ data = "stable" }: OpinionTrendGraphProps) {
  // Map trend type to visual representation
  const trendVisuals: Record<string, { color: string; icon: string; description: string }> = {
    improving: {
      color: "#22c55e",
      icon: "↗️",
      description: "Customer sentiment is improving over time, showing positive trajectory.",
    },
    stable: {
      color: "#3b82f6",
      icon: "→",
      description: "Customer sentiment has remained consistent over the analyzed period.",
    },
    declining: {
      color: "#ef4444",
      icon: "↘️",
      description: "Customer sentiment shows a declining trend that requires attention.",
    },
    fluctuating: {
      color: "#f59e0b",
      icon: "↕️",
      description: "Customer sentiment shows significant fluctuations over time.",
    },
  }

  const trend = trendVisuals[data] || trendVisuals.stable

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">Opinion Trend Analysis</h3>
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
        <div
          className="text-6xl mb-4 w-24 h-24 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${trend.color}20`, color: trend.color }}
        >
          {trend.icon}
        </div>
        <div className="text-2xl font-bold mb-2" style={{ color: trend.color }}>
          {data.charAt(0).toUpperCase() + data.slice(1)}
        </div>
        <p className="text-center text-gray-600">{trend.description}</p>
      </div>
    </div>
  )
}
