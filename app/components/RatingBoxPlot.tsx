"use client"

interface RatingBoxPlotProps {
  ratings: number[]
}

export function RatingBoxPlot({ ratings }: RatingBoxPlotProps) {
  if (!ratings || ratings.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center text-gray-500">
        <p>No rating data available</p>
      </div>
    )
  }

  // Sort ratings for calculations
  const sortedRatings = [...ratings].sort((a, b) => a - b)

  // Calculate statistics
  const min = sortedRatings[0]
  const max = sortedRatings[sortedRatings.length - 1]
  const q1Index = Math.floor(sortedRatings.length * 0.25)
  const q2Index = Math.floor(sortedRatings.length * 0.5)
  const q3Index = Math.floor(sortedRatings.length * 0.75)

  const q1 = sortedRatings[q1Index]
  const median = sortedRatings[q2Index]
  const q3 = sortedRatings[q3Index]

  const average = sortedRatings.reduce((sum, val) => sum + val, 0) / sortedRatings.length

  // Calculate positions for visualization (0-100 scale)
  const range = 5 // Assuming 5-star scale
  const minPos = ((min - 1) / range) * 100
  const q1Pos = ((q1 - 1) / range) * 100
  const medianPos = ((median - 1) / range) * 100
  const q3Pos = ((q3 - 1) / range) * 100
  const maxPos = ((max - 1) / range) * 100
  const avgPos = ((average - 1) / range) * 100

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">Rating Statistical Analysis</h3>
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="relative h-20 mb-8">
          {/* Box plot visualization */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-300"></div>

          {/* Min-Max line */}
          <div
            className="absolute top-1/2 h-1 bg-blue-200"
            style={{ left: `${minPos}%`, right: `${100 - maxPos}%` }}
          ></div>

          {/* Q1-Q3 box */}
          <div
            className="absolute top-1/4 bottom-1/4 bg-blue-500"
            style={{ left: `${q1Pos}%`, right: `${100 - q3Pos}%` }}
          ></div>

          {/* Median line */}
          <div className="absolute top-1/6 bottom-1/6 w-1 bg-white" style={{ left: `${medianPos}%` }}></div>

          {/* Average marker */}
          <div
            className="absolute top-0 w-2 h-2 bg-red-500 rounded-full transform -translate-x-1/2"
            style={{ left: `${avgPos}%` }}
            title={`Average: ${average.toFixed(2)}`}
          ></div>

          {/* Labels */}
          <div className="absolute top-full left-0 text-xs text-gray-500 mt-1">1★</div>
          <div className="absolute top-full right-0 text-xs text-gray-500 mt-1">5★</div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white p-2 rounded">
            <div className="text-sm text-gray-500">Minimum</div>
            <div className="font-bold">{min.toFixed(1)}★</div>
          </div>
          <div className="bg-white p-2 rounded">
            <div className="text-sm text-gray-500">Maximum</div>
            <div className="font-bold">{max.toFixed(1)}★</div>
          </div>
          <div className="bg-white p-2 rounded">
            <div className="text-sm text-gray-500">Median</div>
            <div className="font-bold">{median.toFixed(1)}★</div>
          </div>
          <div className="bg-white p-2 rounded">
            <div className="text-sm text-gray-500">Average</div>
            <div className="font-bold">{average.toFixed(2)}★</div>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-4">
          This box plot shows the distribution of ratings. The box represents the middle 50% of ratings, with the median
          shown as a vertical line. The whiskers extend to the minimum and maximum values.
        </p>
      </div>
    </div>
  )
}
