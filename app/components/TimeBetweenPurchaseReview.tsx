"use client"

export function TimeBetweenPurchaseReview() {
  // Sample data for visualization
  const timelineData = [
    { days: 1, percentage: 15 },
    { days: 2, percentage: 25 },
    { days: 3, percentage: 20 },
    { days: 7, percentage: 15 },
    { days: 14, percentage: 10 },
    { days: 30, percentage: 8 },
    { days: 60, percentage: 7 },
  ]

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">Time Between Purchase and Review</h3>
      <div className="space-y-4">
        {timelineData.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{item.days === 1 ? "1 day" : `${item.days} days`} after purchase</span>
              <span>{item.percentage}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${item.percentage}%` }}></div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-500 mt-4">
        This chart shows when customers typically leave reviews after making a purchase. Most reviews are submitted
        within the first few days.
      </p>
    </div>
  )
}
