"use client"

interface TemporalHeatmapProps {
  data?: { date: string; count: number }[]
}

export function TemporalHeatmap({ data }: TemporalHeatmapProps) {
  // If no data, show placeholder
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center text-gray-500">
        <p>No temporal data available</p>
      </div>
    )
  }

  // Days of the week
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  // Create a simple heatmap grid
  const heatmapData = Array(7)
    .fill(0)
    .map(() => Array(24).fill(0))

  // Fill in the data
  data.forEach((item) => {
    const date = new Date(item.date)
    const day = date.getDay()
    const hour = date.getHours()
    heatmapData[day][hour] += item.count
  })

  // Find max value for color scaling
  const maxValue = Math.max(...heatmapData.flat())

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">Review Activity Heatmap</h3>
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Hour labels */}
          <div className="flex mb-2">
            <div className="w-24"></div>
            {Array(24)
              .fill(0)
              .map((_, hour) => (
                <div key={hour} className="flex-1 text-center text-xs text-gray-500">
                  {hour}:00
                </div>
              ))}
          </div>

          {/* Heatmap grid */}
          {daysOfWeek.map((day, dayIndex) => (
            <div key={day} className="flex mb-1">
              <div className="w-24 text-sm font-medium">{day}</div>
              <div className="flex-1 flex">
                {heatmapData[dayIndex].map((value, hour) => {
                  // Calculate color intensity
                  const intensity = maxValue > 0 ? (value / maxValue) * 100 : 0
                  const backgroundColor = `rgba(59, 130, 246, ${Math.max(0.1, intensity / 100)})`

                  return (
                    <div
                      key={hour}
                      className="flex-1 h-8 border border-gray-100 flex items-center justify-center text-xs"
                      style={{ backgroundColor }}
                      title={`${day} ${hour}:00 - ${value} reviews`}
                    >
                      {value > 0 && value}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-2">
        This heatmap shows when customers are most likely to leave reviews, helping you identify patterns.
      </p>
    </div>
  )
}
