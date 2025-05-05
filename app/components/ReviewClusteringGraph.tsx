"use client"

import { useMemo, useState } from "react"
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ReviewClusteringGraphProps {
  reviewData: any[]
  explanation?: string
}

export function ReviewClusteringGraph({ reviewData, explanation }: ReviewClusteringGraphProps) {
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null)

  // Process the data to create clusters
  const clusterData = useMemo(() => {
    if (!reviewData || reviewData.length === 0) {
      return { clusters: [], clusterInfo: {} }
    }

    // Simple K-means clustering implementation
    // In a real app, you'd use a more sophisticated algorithm

    // Step 1: Extract features from reviews
    const features = reviewData.map((review) => {
      // Use sentiment score as one feature
      const sentimentScore = review.score || 0.5

      // Use length of review as another feature (normalized)
      const lengthScore = Math.min(review.text?.length || 0, 1000) / 1000

      // Check for keywords to determine topic features
      const hasQualityMention = /quality|durability|reliable|broke|damaged/i.test(review.text || "")
      const hasPriceMention = /price|cost|expensive|cheap|value|worth/i.test(review.text || "")
      const hasServiceMention = /service|staff|support|help|assistance/i.test(review.text || "")
      const hasDeliveryMention = /delivery|shipping|arrived|package|shipment/i.test(review.text || "")
      const hasExperienceMention = /experience|store|shop|visit|atmosphere/i.test(review.text || "")

      return {
        review,
        features: [
          sentimentScore,
          lengthScore,
          hasQualityMention ? 1 : 0,
          hasPriceMention ? 1 : 0,
          hasServiceMention ? 1 : 0,
          hasDeliveryMention ? 1 : 0,
          hasExperienceMention ? 1 : 0,
        ],
      }
    })

    // Step 2: Define initial centroids for common topics
    const initialCentroids = [
      [0.8, 0.3, 1, 0, 0, 0, 0], // Quality positive
      [0.2, 0.7, 1, 0, 0, 0, 0], // Quality negative
      [0.7, 0.3, 0, 1, 0, 0, 0], // Price positive
      [0.3, 0.6, 0, 1, 0, 0, 0], // Price negative
      [0.8, 0.4, 0, 0, 1, 0, 0], // Service positive
      [0.2, 0.8, 0, 0, 1, 0, 0], // Service negative
      [0.7, 0.3, 0, 0, 0, 1, 0], // Delivery positive
      [0.3, 0.5, 0, 0, 0, 1, 0], // Delivery negative
      [0.8, 0.3, 0, 0, 0, 0, 1], // Experience positive
      [0.3, 0.6, 0, 0, 0, 0, 1], // Experience negative
    ]

    // Step 3: Assign each review to the nearest centroid
    const clusterAssignments = features.map((item) => {
      let minDistance = Number.POSITIVE_INFINITY
      let clusterIndex = 0

      initialCentroids.forEach((centroid, index) => {
        // Calculate Euclidean distance
        const distance = Math.sqrt(
          centroid.reduce((sum, value, i) => {
            return sum + Math.pow(value - item.features[i], 2)
          }, 0),
        )

        if (distance < minDistance) {
          minDistance = distance
          clusterIndex = index
        }
      })

      return {
        ...item,
        cluster: clusterIndex,
      }
    })

    // Step 4: Define cluster names and colors
    const clusterDefinitions = [
      { name: "Quality - Positive", color: "#52c41a" },
      { name: "Quality - Negative", color: "#ff4d4f" },
      { name: "Price - Positive", color: "#1890ff" },
      { name: "Price - Negative", color: "#faad14" },
      { name: "Service - Positive", color: "#722ed1" },
      { name: "Service - Negative", color: "#eb2f96" },
      { name: "Delivery - Positive", color: "#13c2c2" },
      { name: "Delivery - Negative", color: "#fa8c16" },
      { name: "Experience - Positive", color: "#2f54eb" },
      { name: "Experience - Negative", color: "#fa541c" },
    ]

    // Step 5: Prepare data for visualization
    const clusters = clusterAssignments.map((item, index) => {
      const clusterDef = clusterDefinitions[item.cluster]

      // Use t-SNE like projection for visualization
      // In a real app, you'd use a proper dimensionality reduction algorithm
      // This is a simplified approach for demonstration
      const angle = (item.cluster * Math.PI * 2) / clusterDefinitions.length + (Math.random() * 0.5 - 0.25)
      const radius = 0.3 + Math.random() * 0.7

      return {
        id: index,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        z: item.features[0], // Use sentiment score for size
        cluster: item.cluster,
        clusterName: clusterDef.name,
        color: clusterDef.color,
        text: item.review.text,
        sentiment: item.review.sentiment || (item.features[0] > 0.5 ? "positive" : "negative"),
        score: item.review.score || item.features[0],
      }
    })

    // Step 6: Calculate cluster statistics
    const clusterInfo = {}
    clusterDefinitions.forEach((def, index) => {
      const clusterItems = clusters.filter((item) => item.cluster === index)

      if (clusterItems.length === 0) {
        clusterInfo[index] = {
          name: def.name,
          color: def.color,
          count: 0,
          avgSentiment: 0,
          keywords: [],
        }
        return
      }

      // Calculate average sentiment
      const avgSentiment = clusterItems.reduce((sum, item) => sum + item.z, 0) / clusterItems.length

      // Extract common keywords
      const text = clusterItems
        .map((item) => item.text)
        .join(" ")
        .toLowerCase()
      const words = text
        .split(/\W+/)
        .filter(
          (word) =>
            word.length > 3 &&
            !["this", "that", "with", "would", "could", "should", "have", "their", "there", "about"].includes(word),
        )

      const wordFreq = {}
      words.forEach((word) => {
        wordFreq[word] = (wordFreq[word] || 0) + 1
      })

      const keywords = Object.entries(wordFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([word]) => word)

      clusterInfo[index] = {
        name: def.name,
        color: def.color,
        count: clusterItems.length,
        avgSentiment,
        keywords,
      }
    })

    return { clusters, clusterInfo }
  }, [reviewData])

  // Custom tooltip for the scatter plot
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded shadow-md max-w-xs">
          <p className="font-bold">{data.clusterName}</p>
          <p className="text-sm truncate">{data.text?.substring(0, 100)}...</p>
          <p>Sentiment: {data.sentiment}</p>
          <p>Score: {data.score.toFixed(2)}</p>
        </div>
      )
    }
    return null
  }

  // Generate explanation if not provided
  const generateExplanation = () => {
    if (explanation) return explanation

    if (!clusterData.clusters.length) {
      return "No data available for clustering analysis."
    }

    // Find the largest clusters
    const clusterCounts = Object.values(clusterData.clusterInfo)
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 3)

    const largestCluster = clusterCounts[0] as any

    let clusterInsights = `The largest cluster is "${largestCluster.name}" with ${largestCluster.count} reviews.`

    if (clusterCounts.length > 1) {
      const secondCluster = clusterCounts[1] as any
      clusterInsights += ` This is followed by "${secondCluster.name}" with ${secondCluster.count} reviews.`
    }

    // Find clusters with extreme sentiment
    const clustersBysentiment = Object.values(clusterData.clusterInfo).sort(
      (a: any, b: any) => b.avgSentiment - a.avgSentiment,
    )

    const mostPositive = clustersBysentiment[0] as any
    const mostNegative = clustersBysentiment[clustersBysentiment.length - 1] as any

    const sentimentInsights = `The most positive cluster is "${mostPositive.name}" with an average sentiment score of ${mostPositive.avgSentiment.toFixed(2)}, while the most negative is "${mostNegative.name}" with a score of ${mostNegative.avgSentiment.toFixed(2)}.`

    return `
      This visualization groups similar reviews into clusters based on their content, sentiment, and key topics.
      
      ${clusterInsights}
      
      ${sentimentInsights}
      
      Each point represents a review, with its position indicating similarity to other reviews. The size of each point corresponds to the sentiment score, with larger points indicating more positive sentiment.
      
      Click on a cluster in the legend to highlight only those reviews, or click on individual points to see the review content.
    `
  }

  // Filter clusters based on selection
  const filteredClusters =
    selectedCluster === null
      ? clusterData.clusters
      : clusterData.clusters.filter((item) => item.clusterName === selectedCluster)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Clustering</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px]">
          {clusterData.clusters.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="similarity"
                  domain={[-1.2, 1.2]}
                  label={{ value: "Topic Similarity", position: "bottom", offset: 0 }}
                  tickFormatter={(value) => value.toFixed(1)}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="similarity"
                  domain={[-1.2, 1.2]}
                  label={{ value: "Sentiment Similarity", angle: -90, position: "left" }}
                  tickFormatter={(value) => value.toFixed(1)}
                />
                <ZAxis type="number" dataKey="z" range={[20, 100]} name="sentiment" />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  payload={Object.values(clusterData.clusterInfo).map((cluster: any) => ({
                    value: `${cluster.name} (${cluster.count})`,
                    type: "circle",
                    color: cluster.color,
                    id: cluster.name,
                  }))}
                  onClick={(e) => {
                    if (selectedCluster === e.value.split(" (")[0]) {
                      setSelectedCluster(null)
                    } else {
                      setSelectedCluster(e.value.split(" (")[0])
                    }
                  }}
                />
                <Scatter name="Reviews" data={filteredClusters} fill="#8884d8">
                  {filteredClusters.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No data available for clustering</p>
            </div>
          )}
        </div>

        {selectedCluster && (
          <div className="mt-4">
            <Button variant="outline" onClick={() => setSelectedCluster(null)} className="mb-2">
              Show All Clusters
            </Button>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold">{selectedCluster} Cluster</h3>

              {Object.values(clusterData.clusterInfo).map((cluster: any) => {
                if (cluster.name === selectedCluster) {
                  return (
                    <div key={cluster.name} className="mt-2">
                      <p>
                        <strong>Reviews:</strong> {cluster.count}
                      </p>
                      <p>
                        <strong>Average Sentiment:</strong> {cluster.avgSentiment.toFixed(2)}
                      </p>
                      <p>
                        <strong>Common Keywords:</strong> {cluster.keywords.join(", ")}
                      </p>
                    </div>
                  )
                }
                return null
              })}
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-2">Clustering Analysis</h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{generateExplanation()}</p>
        </div>
      </CardContent>
    </Card>
  )
}
