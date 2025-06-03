import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"

const COLORS = {
  Positive: "#22c55e",
  Neutral: "#3b82f6",
  Negative: "#ef4444",
}

export function ToneBarChart({
  data,
  explanation,
  topStrengths = [],
  topWeaknesses = [],
}: {
  data: { name: string; value: number }[] | { [key: string]: number }
  explanation?: string
  topStrengths?: { strength: string; count: number }[]
  topWeaknesses?: { weakness: string; count: number }[]
}) {
  // Convert object to array if necessary
  const chartData = Array.isArray(data) ? data : Object.entries(data).map(([name, value]) => ({ name, value }))

  if (!chartData || chartData.length === 0) {
    return <div>No tone data available</div>
  }

  // Convert values to percentage scale if they're in decimal format
  const processedData = chartData.map((item) => ({
    ...item,
    value: item.value <= 1 ? item.value * 100 : item.value,
  }))

  // Generate a more comprehensive explanation
  const generateDetailedExplanation = () => {
    if (explanation) return explanation

    // Find the values for each tone
    const positiveData = chartData.find((d) => d.name === "Positive")
    const negativeData = chartData.find((d) => d.name === "Negative")
    const neutralData = chartData.find((d) => d.name === "Neutral")

    const positiveValue = positiveData ? positiveData.value : 0
    const negativeValue = negativeData ? negativeData.value : 0
    const neutralValue = neutralData ? neutralData.value : 0

    // Determine dominant tone
    let dominantTone = "mixed"
    if (positiveValue > negativeValue && positiveValue > neutralValue) {
      dominantTone = "positive"
    } else if (negativeValue > positiveValue && negativeValue > neutralValue) {
      dominantTone = "negative"
    } else if (neutralValue > positiveValue && neutralValue > negativeValue) {
      dominantTone = "neutral"
    }

    // Create tone-specific advice
    let toneAdvice = ""
    let marketingAdvice = ""
    let productAdvice = ""
    let communicationAdvice = ""

    // Strengths and weaknesses to highlight
    const strengthsToHighlight =
      topStrengths && topStrengths.length > 0
        ? topStrengths
            .map((s) => s.strength)
            .slice(0, 2)
            .join(" and ")
        : "your product's strengths"

    const weaknessesToHighlight =
      topWeaknesses && topWeaknesses.length > 0
        ? topWeaknesses
            .map((w) => w.weakness)
            .slice(0, 2)
            .join(" and ")
        : "areas for improvement"

    if (dominantTone === "positive") {
      toneAdvice = `The predominantly positive tone in your reviews indicates strong customer satisfaction. This positive sentiment creates an excellent foundation for brand advocacy and word-of-mouth marketing.`

      marketingAdvice = `In your marketing, emphasize authentic customer testimonials that highlight ${strengthsToHighlight}. Consider creating case studies that showcase successful customer experiences and outcomes.`

      productAdvice = `While maintaining your strengths, don't overlook the ${negativeValue > 0.1 ? "significant" : "small"} percentage of negative feedback, which offers valuable insights for continuous improvement.`

      communicationAdvice = `Your communication style should reflect confidence and pride in your offerings, while maintaining authenticity. Positive reviews give you credibility to make stronger claims about your product benefits.`
    } else if (dominantTone === "negative") {
      toneAdvice = `The predominantly negative tone in your reviews signals significant customer dissatisfaction that requires immediate attention. This negative sentiment could be damaging your brand reputation and deterring potential customers.`

      marketingAdvice = `Pause aggressive marketing campaigns until core issues are addressed. Instead, focus on transparent communication about the improvements you're making based on customer feedback.`

      productAdvice = `Prioritize fixing the most frequently mentioned issues, particularly ${weaknessesToHighlight}. Consider reaching out directly to dissatisfied customers to understand their concerns in greater depth.`

      communicationAdvice = `Adopt a humble, solution-oriented tone in all customer communications. Acknowledge the issues, explain your plan to address them, and provide regular updates on your progress.`
    } else if (dominantTone === "neutral") {
      toneAdvice = `The predominantly neutral tone in your reviews suggests customers are satisfied but not enthusiastic. This presents an opportunity to transform adequate experiences into memorable ones that generate positive advocacy.`

      marketingAdvice = `Focus on emotional marketing that creates stronger connections with customers. Highlight the unique aspects of your offering that differentiate you from competitors.`

      productAdvice = `Look for opportunities to exceed expectations rather than merely meeting them. Consider adding unexpected features or service elements that delight customers.`

      communicationAdvice = `Your communication should aim to evoke more emotion and engagement. Use storytelling techniques and vivid language to create more memorable impressions.`
    } else {
      // mixed
      toneAdvice = `The mixed tone in your reviews indicates varied customer experiences. This diversity of sentiment suggests inconsistency in your product or service delivery that should be addressed.`

      marketingAdvice = `Segment your marketing to address different customer experiences. Be transparent about both strengths and areas where you're actively improving.`

      productAdvice = `Focus on standardizing quality across all aspects of your offering. Prioritize fixing ${weaknessesToHighlight} while maintaining excellence in ${strengthsToHighlight}.`

      communicationAdvice = `Balance confidence about your strengths with humility regarding areas for improvement. Show customers you value all feedback and are committed to consistent excellence.`
    }

    return `The predominant ${dominantTone} tone in reviews should inform your communication style. Align your marketing messages with this overall tone to resonate with your audience. If positive, amplify this in your campaigns. If negative or neutral, focus on addressing concerns and shifting perceptions through targeted content and customer success stories.`
  }

  return (
    <div className="space-y-6">
      <div className="space-y-8">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" name="Tone">
              {processedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name] || COLORS.Neutral} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-line">{generateDetailedExplanation()}</p>
      </div>
    </div>
  )
}
