"use client"

interface NetPromoterScoreProps {
  score?: number
  promoters?: number
  passives?: number
  detractors?: number
  ratings?: number[]
}

export function NetPromoterScore({ score, promoters, passives, detractors, ratings }: NetPromoterScoreProps) {
  // If ratings are provided, calculate eNPS based on 5-star rating system
  let calculatedScore = score
  let calculatedPromoters = promoters
  let calculatedPassives = passives
  let calculatedDetractors = detractors

  if (ratings && ratings.length > 0) {
    // For 5-star ratings:
    // Promoters: 5 stars
    // Passives: 4 stars
    // Detractors: 1-3 stars
    const totalRatings = ratings.length
    const promoterCount = ratings.filter((r) => r === 5).length
    const passiveCount = ratings.filter((r) => r === 4).length
    const detractorCount = ratings.filter((r) => r <= 3 && r >= 1).length

    calculatedPromoters = (promoterCount / totalRatings) * 100
    calculatedPassives = (passiveCount / totalRatings) * 100
    calculatedDetractors = (detractorCount / totalRatings) * 100
    calculatedScore = Math.round(calculatedPromoters - calculatedDetractors)
  }

  // Default values if no data is provided
  const finalScore = calculatedScore !== undefined ? calculatedScore : 0
  const finalPromoters = calculatedPromoters !== undefined ? calculatedPromoters : 33
  const finalPassives = calculatedPassives !== undefined ? calculatedPassives : 33
  const finalDetractors = calculatedDetractors !== undefined ? calculatedDetractors : 33

  // Determine score color
  let scoreColor = "text-yellow-500"
  if (finalScore >= 50) scoreColor = "text-green-600"
  else if (finalScore >= 0) scoreColor = "text-green-500"
  else if (finalScore >= -50) scoreColor = "text-orange-500"
  else scoreColor = "text-red-500"

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center">
        <div className="text-2xl font-semibold mb-1">eNPS Score</div>
        <div className={`text-6xl font-bold ${scoreColor}`}>{finalScore}</div>
        <div className="text-sm text-gray-500 mt-2">Range: -100 to +100</div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-8">
        <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
          <div className="text-lg font-semibold text-green-700">Promoters</div>
          <div className="text-3xl font-bold text-green-600">{Math.round(finalPromoters)}%</div>
          <div className="text-sm text-gray-500 mt-1">5 stars</div>
        </div>

        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
          <div className="text-lg font-semibold text-gray-700">Passives</div>
          <div className="text-3xl font-bold text-gray-600">{Math.round(finalPassives)}%</div>
          <div className="text-sm text-gray-500 mt-1">4 stars</div>
        </div>

        <div className="flex flex-col items-center p-4 bg-red-50 rounded-lg">
          <div className="text-lg font-semibold text-red-700">Detractors</div>
          <div className="text-3xl font-bold text-red-600">{Math.round(finalDetractors)}%</div>
          <div className="text-sm text-gray-500 mt-1">1-3 stars</div>
        </div>
      </div>

      <div className="text-sm text-gray-600 mt-4">
        <p className="font-medium">How eNPS is calculated:</p>
        <p>eNPS = % Promoters (5★) - % Detractors (1-3★)</p>
        <p>Passives (4★) are not counted in the final score calculation.</p>
      </div>
    </div>
  )
}
