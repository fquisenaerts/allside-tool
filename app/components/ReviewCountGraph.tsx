"use client"

interface ReviewCountGraphProps {
  data: { date: string; count: number }[] | { [key: string]: number }
}

export function ReviewCountGraph({ data }: ReviewCountGraphProps) {
  // Convert object to array if necessary
  const chartData = Array.isArray(data) ? data : Object.entries(data).map(([date, count]) => ({ date, count }))

  if (!chartData || chartData.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center text-gray-500">
        <p>No timeline data available</p>
      </div>
    )
  }

  // Sort data by date
  const sortedData = [...chartData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Find the maximum value for scaling
  const maxValue = Math.max(...sortedData.map((item) => item.count))

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">Review Timeline</h3>
      <div className="relative h-[300px] border-b border-l border-gray-300">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
          <span>{maxValue}</span>
          <span>{Math.round(maxValue / 2)}</span>
          <span>0</span>
        </div>

        {/* Bars */}
        <div className="absolute left-8 right-0 top-0 bottom-0 flex items-end">
          <div className="flex-1 flex items-end justify-around h-full">
            {sortedData.map((item, index) => {
              const height = (item.count / maxValue) * 100
              const formattedDate = new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })

              return (
                <div key={index} className="flex flex-col items-center group">
                  <div className="relative">
                    <div
                      className="w-6 bg-blue-500 rounded-t transition-all duration-500"
                      style={{ height: `${Math.max(1, height)}%` }}
                    ></div>
                    <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.count} reviews
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-top-left">
                    {formattedDate}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
