import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"

export function EmotionsBarChart({
  data,
  explanation,
  reviewCount,
}: {
  data: { emotion: string; count: number }[]
  explanation?: string
  reviewCount?: number
}) {
  // Filter out generic emotions
  const filteredData = data.filter(
    (item) => item.emotion && item.emotion !== "neutral" && item.emotion !== "Unknown" && item.count > 0,
  )

  // Sort by count (descending)
  filteredData.sort((a, b) => b.count - a.count)

  // Generate a comprehensive explanation of emotions and their marketing implications
  const generateDetailedExplanation = () => {
    // Check if an explanation was provided as a prop first
    if (typeof explanation !== "undefined") return explanation

    if (!filteredData || filteredData.length === 0) {
      return "No specific emotional data could be extracted from the analyzed reviews. Consider asking more emotion-focused questions in future customer feedback surveys to gather this valuable insight."
    }

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
        messaging: "focus on how your product or service consistently delivers on its promises",
        visuals: "show satisfied customers using your product in everyday situations",
      },
      joy: {
        description: "shows customers are experiencing delight and pleasure from your offering",
        marketing: "highlight the enjoyable aspects of your product and the positive emotions it evokes",
        messaging: "use upbeat, enthusiastic language that mirrors the joy customers feel",
        visuals: "feature smiling people and bright, vibrant imagery",
      },
      trust: {
        description: "reveals customers feel secure and confident in your brand",
        marketing: "emphasize your reliability, expertise, and commitment to customer success",
        messaging: "use reassuring language and highlight your track record and guarantees",
        visuals: "incorporate symbols of security, stability, and professionalism",
      },
      anticipation: {
        description: "shows customers are excited about future experiences with your product",
        marketing: "create buzz around upcoming features or benefits",
        messaging: "use forward-looking language that builds excitement",
        visuals: "show the journey and progression that customers can expect",
      },
      disappointment: {
        description: "indicates customers expected more from their experience",
        marketing: "address the gap between expectations and reality in your messaging",
        messaging: "acknowledge common pain points and explain how you're addressing them",
        visuals: "show the before-and-after transformation your improved offering provides",
      },
      frustration: {
        description: "reveals customers are encountering obstacles or difficulties",
        marketing: "emphasize simplicity, ease of use, and your customer support",
        messaging: "highlight how you've simplified processes based on customer feedback",
        visuals: "demonstrate the smooth, hassle-free experience your current offering provides",
      },
      anger: {
        description: "shows customers have had significantly negative experiences",
        marketing: "focus on your commitment to improvement and customer satisfaction",
        messaging: "be transparent about changes you've made in response to feedback",
        visuals: "show your team actively engaged in customer service and problem-solving",
      },
      confusion: {
        description: "indicates customers find aspects of your offering unclear or complex",
        marketing: "emphasize clarity, simplicity, and the support you provide",
        messaging: "use straightforward language and clear explanations",
        visuals: "incorporate instructional elements and simple, clean designs",
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
      explanationText += `1. Strategy: ${emotionInfo.marketing}\n`
      explanationText += `2. Messaging: ${emotionInfo.messaging}\n`
      explanationText += `3. Visual Elements: ${emotionInfo.visuals}\n\n`
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
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="emotion" />
            <YAxis domain={[0, "dataMax + 1"]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" name="Emotions">
              {filteredData.map((entry, index) => {
                // Color mapping for common emotions
                const emotionColors = {
                  satisfaction: "#3b82f6", // blue
                  joy: "#22c55e", // green
                  trust: "#8b5cf6", // purple
                  anticipation: "#f59e0b", // amber
                  disappointment: "#ef4444", // red
                  frustration: "#f97316", // orange
                  anger: "#dc2626", // dark red
                  confusion: "#a855f7", // purple
                  // Default color for other emotions
                  default: "#6b7280", // gray
                }

                const color = emotionColors[entry.emotion.toLowerCase()] || emotionColors.default
                return <Cell key={`cell-${index}`} fill={color} />
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-line">{generateDetailedExplanation()}</p>
      </div>
    </div>
  )
}
