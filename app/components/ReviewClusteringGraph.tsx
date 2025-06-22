"use client"

interface ReviewClusteringGraphProps {
  reviewData: any[]
  clusters: { id: number; x: number; y: number; z: number; name: string }[]
}

export function ReviewClusteringGraph({ reviewData, clusters }: ReviewClusteringGraphProps) {
  if (!reviewData || reviewData.length === 0 || !clusters || clusters.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center text-gray-500">
        <p>No clustering data available</p>
      </div>
    )
  }

  // Colors for different clusters
  const clusterColors = [
    "#3b82f6", // blue
    "#22c55e", // green
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // purple
    "#ec4899", // pink
  ]

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">Review Clustering Analysis</h3>
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {clusters.map((cluster, index) => (
            <div
              key={cluster.id}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
              style={{ borderLeftColor: clusterColors[index % clusterColors.length], borderLeftWidth: "4px" }}
            >
              <h4 className="font-medium mb-2">{cluster.name}</h4>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Sentiment: {(cluster.x * 100).toFixed(0)}%</span>
                <span>Size: {Math.round(cluster.z * 100)}%</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-4">
          This analysis groups similar reviews into clusters based on content, sentiment, and other factors. Each
          cluster represents a distinct pattern in customer feedback.
        </p>
      </div>
    </div>
  )
}
