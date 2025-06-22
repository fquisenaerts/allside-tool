"use client"

interface NetPromoterScoreProps {
  ratings: number[]
}

export function NetPromoterScore({ ratings }: NetPromoterScoreProps) {
  if (!ratings || ratings.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center text-gray-500">
        <p>No rating data available for NPS calculation</p>
      </div>
    )
  }

  // Calculate eNPS based on 5-star rating system
  const totalRatings = ratings.length
  const promoterCount = ratings.filter((r) => r === 5).length
  const passiveCount = ratings.filter((r) => r === 4).length
  const detractorCount = ratings.filter((r) => r <= 3 && r >= 1).length

  const promoterPercentage = (promoterCount / totalRatings) * 100
  const passivePercentage = (passiveCount / totalRatings) * 100
  const detractorPercentage = (detractorCount / totalRatings) * 100
  const npsScore = Math.round(promoterPercentage - detractorPercentage)

  // Determine NPS category
  let npsCategory = ""
  let npsColor = ""
  if (npsScore >= 70) {
    npsCategory = "Excellent"
    npsColor = "#22c55e"
  } else if (npsScore >= 50) {
    npsCategory = "Good"
    npsColor = "#3b82f6"
  } else if (npsScore >= 30) {
    npsCategory = "Moderate"
    npsColor = "#f59e0b"
  } else if (npsScore >= 0) {
    npsCategory = "Needs Improvement"
    npsColor = "#f97316"
  } else {
    npsCategory = "Critical"
    npsColor = "#ef4444"
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div
          className="inline-flex items-center justify-center w-32 h-32 rounded-full border-8"
          style={{ borderColor: npsColor }}
        >
          <div className="text-center">
            <div className="text-3xl font-bold" style={{ color: npsColor }}>
              {npsScore}
            </div>
            <div className="text-sm text-gray-600">NPS Score</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="text-lg font-semibold" style={{ color: npsColor }}>
            {npsCategory}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="p-4 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{detractorCount}</div>
          <div className="text-sm text-red-600">Detractors</div>
          <div className="text-xs text-gray-500">{detractorPercentage.toFixed(1)}%</div>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{passiveCount}</div>
          <div className="text-sm text-yellow-600">Passives</div>
          <div className="text-xs text-gray-500">{passivePercentage.toFixed(1)}%</div>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{promoterCount}</div>
          <div className="text-sm text-green-600">Promoters</div>
          <div className="text-xs text-gray-500">{promoterPercentage.toFixed(1)}%</div>
        </div>
      </div>

      <div className="text-sm text-gray-600">
        <p>
          <strong>Net Promoter Score (NPS)</strong> measures customer loyalty and likelihood to recommend.
        </p>
        <p>Promoters (5 stars) - Detractors (1-3 stars) = NPS Score</p>
      </div>
    </div>
  )
}
