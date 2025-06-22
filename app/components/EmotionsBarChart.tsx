"use client"

import { SimpleBarChart } from "./SimpleBarChart"

export function EmotionsBarChart({
  data,
  explanation,
  reviewCount,
}: {
  data: { emotion: string; count: number }[]
  explanation?: string
  reviewCount?: number
}) {
  // Ensure data is valid
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Main Emotions</h2>
        <div className="flex items-center justify-center h-[300px] text-gray-500">
          <p>No emotional data available for analysis</p>
        </div>
      </div>
    )
  }

  // Filter out generic emotions and ensure valid data
  const filteredData = data
    .filter((item) => {
      return (
        item &&
        typeof item === "object" &&
        item.emotion &&
        typeof item.emotion === "string" &&
        item.emotion !== "neutral" &&
        item.emotion !== "Unknown" &&
        item.emotion !== "unknown" &&
        typeof item.count === "number" &&
        item.count > 0
      )
    })
    .slice(0, 10) // Limit to top 10 emotions

  // If no valid data after filtering, show message
  if (filteredData.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Main Emotions</h2>
        <div className="flex items-center justify-center h-[300px] text-gray-500">
          <p>No specific emotional patterns detected in the reviews</p>
        </div>
      </div>
    )
  }

  // Sort by count (descending)
  filteredData.sort((a, b) => b.count - a.count)

  // Convert to format expected by SimpleBarChart
  const chartData = filteredData.map((item) => ({
    name: item.emotion,
    value: item.count,
  }))

  // Generate a comprehensive explanation of emotions and their marketing implications
  const generateDetailedExplanation = () => {
    // Check if an explanation was provided as a prop first
    if (typeof explanation !== "undefined") return explanation

    // Get the top emotions
    const topEmotions = filteredData.slice(0, Math.min(3, filteredData.length))
    const primaryEmotion = topEmotions[0]

    // Calculate what percentage each emotion represents
    const totalCount = filteredData.reduce((sum, item) => sum + item.count, 0)
    const emotionPercentages = topEmotions.map((emotion) => ({
      ...emotion,
      percentage: Math.round((emotion.count / totalCount) * 100),
    }))

    // Generate emotion-specific advice
    const emotionInsights = {
      satisfaction: {
        description: "indicates customers are content with their experience and find value in your offering",
        marketing: "emphasize reliability, consistency, and the specific aspects that create this satisfaction",
      },
      joy: {
        description: "shows customers are experiencing delight and pleasure from your offering",
        marketing: "highlight the enjoyable aspects of your product and the positive emotions it evokes",
      },
      trust: {
        description: "reveals customers feel secure and confident in your brand",
        marketing: "emphasize your reliability, expertise, and commitment to customer success",
      },
      anticipation: {
        description: "shows customers are excited about future experiences with your product",
        marketing: "create buzz around upcoming features or benefits",
      },
      disappointment: {
        description: "indicates customers expected more from their experience",
        marketing: "address the gap between expectations and reality in your messaging",
      },
      frustration: {
        description: "reveals customers are encountering obstacles or difficulties",
        marketing: "emphasize simplicity, ease of use, and your customer support",
      },
      anger: {
        description: "shows customers have had significantly negative experiences",
        marketing: "focus on your commitment to improvement and customer satisfaction",
      },
      confusion: {
        description: "indicates customers find aspects of your offering unclear or complex",
        marketing: "emphasize clarity, simplicity, and the support you provide",
      },
    }

    // Generate the comprehensive explanation
    let explanationText = `The emotional analysis of ${reviewCount || "your"} reviews reveals important insights about how customers feel when engaging with your product or service. `

    // Add primary emotion insights
    if (primaryEmotion && emotionInsights[primaryEmotion.emotion.toLowerCase()]) {
      const emotionInfo = emotionInsights[primaryEmotion.emotion.toLowerCase()]
      explanationText += `The dominant emotion is ${primaryEmotion.emotion.toLowerCase()} (${emotionPercentages[0].percentage}%), which ${emotionInfo.description}. `
    } else if (primaryEmotion) {
      explanationText += `The dominant emotion is ${primaryEmotion.emotion.toLowerCase()} (${emotionPercentages[0].percentage}%). `
    }

    // Add secondary emotions if available
    if (topEmotions.length > 1 && emotionInsights[topEmotions[1].emotion.toLowerCase()]) {
      explanationText += `This is followed by ${topEmotions[1].emotion.toLowerCase()} (${emotionPercentages[1].percentage}%), indicating a segment of your audience that `
      explanationText += `${emotionInsights[topEmotions[1].emotion.toLowerCase()].description.replace("indicates customers", "feels").replace("shows customers", "experiences").replace("reveals customers", "feels")}. `
    } else if (topEmotions.length > 1) {
      explanationText += `This is followed by ${topEmotions[1].emotion.toLowerCase()} (${emotionPercentages[1].percentage}%). `
    }

    // Marketing implications
    explanationText += `\n\nMarketing Implications:\n\n`

    // Add marketing advice for primary emotion
    if (primaryEmotion && emotionInsights[primaryEmotion.emotion.toLowerCase()]) {
      const emotionInfo = emotionInsights[primaryEmotion.emotion.toLowerCase()]
      explanationText += `Strategy: ${emotionInfo.marketing}\n\n`
    } else if (primaryEmotion) {
      explanationText += `Consider aligning your marketing strategy with the ${primaryEmotion.emotion.toLowerCase()} emotion expressed by your customers.\n\n`
    }

    // Add balanced approach advice if there are mixed emotions
    if (
      topEmotions.length > 1 &&
      (emotionPercentages[0].percentage < 60 ||
        primaryEmotion.emotion.toLowerCase() === "disappointment" ||
        primaryEmotion.emotion.toLowerCase() === "frustration" ||
        primaryEmotion.emotion.toLowerCase() === "anger")
    ) {
      explanationText += `Consider a balanced marketing approach that addresses both the positive aspects customers appreciate and the concerns they've expressed. Authentic acknowledgment of areas for improvement, paired with your commitment to excellence, can build trust and demonstrate your customer-centric values.`
    } else {
      explanationText += `Leverage these emotional insights to create marketing that resonates on a deeper level with your audience. When your messaging aligns with how customers actually feel about your offering, it creates authenticity that strengthens brand loyalty and encourages advocacy.`
    }

    return explanationText
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Main Emotions</h2>
      <div className="space-y-8">
        <SimpleBarChart data={chartData} title="Emotion Distribution" color="#3b82f6" />
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-2">Emotional Analysis</h3>
          <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-line">{generateDetailedExplanation()}</p>
        </div>
      </div>
    </div>
  )
}
