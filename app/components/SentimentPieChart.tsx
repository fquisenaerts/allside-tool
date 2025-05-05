import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

const COLORS = {
  Positive: "#22c55e",
  Negative: "#ef4444",
  Neutral: "#3b82f6",
}

export function SentimentPieChart({
  data,
  explanation,
  reviewCount,
  topStrengths = [],
  topWeaknesses = [],
}: {
  data: { name: string; value: number }[]
  explanation?: string
  reviewCount?: number
  topStrengths?: { strength: string; count: number }[]
  topWeaknesses?: { weakness: string; count: number }[]
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const dataWithPercentages = data.map((item) => ({
    ...item,
    value: (item.value / total) * 100,
    percentage: ((item.value / total) * 100).toFixed(1),
  }))

  // Sort data by percentage (descending)
  dataWithPercentages.sort((a, b) => Number.parseFloat(b.percentage) - Number.parseFloat(a.percentage))

  // Generate personalized explanation
  const generatePersonalizedExplanation = () => {
    if (explanation) return explanation

    const positiveData = dataWithPercentages.find((d) => d.name === "Positive")
    const negativeData = dataWithPercentages.find((d) => d.name === "Negative")
    const neutralData = dataWithPercentages.find((d) => d.name === "Neutral")

    const positivePercentage = positiveData ? Number.parseFloat(positiveData.percentage) : 0
    const negativePercentage = negativeData ? Number.parseFloat(negativeData.percentage) : 0
    const neutralPercentage = neutralData ? Number.parseFloat(neutralData.percentage) : 0

    let sentiment = ""
    let actionAdvice = ""
    let strengthsHighlight = ""
    let weaknessesHighlight = ""

    // Determine overall sentiment
    if (positivePercentage >= 70) {
      sentiment = "overwhelmingly positive"
    } else if (positivePercentage >= 50) {
      sentiment = "generally positive"
    } else if (positivePercentage >= 40 && negativePercentage >= 40) {
      sentiment = "mixed"
    } else if (negativePercentage >= 50) {
      sentiment = "concerning, with significant negative feedback"
    } else {
      sentiment = "nuanced, with varied customer opinions"
    }

    // Add strengths if available
    if (topStrengths && topStrengths.length > 0) {
      const specificStrengths = topStrengths
        .filter((s) => s.strength && s.strength !== "not specified" && s.strength !== "good experience")
        .slice(0, 2)

      if (specificStrengths.length > 0) {
        strengthsHighlight = ` Customers particularly appreciate ${specificStrengths.map((s) => `"${s.strength}"`).join(" and ")}.`
      }
    }

    // Add weaknesses if available
    if (topWeaknesses && topWeaknesses.length > 0) {
      const specificWeaknesses = topWeaknesses
        .filter((w) => w.weakness && w.weakness !== "not specified" && w.weakness !== "issues mentioned")
        .slice(0, 2)

      if (specificWeaknesses.length > 0) {
        weaknessesHighlight = ` Areas for improvement include ${specificWeaknesses.map((w) => `"${w.weakness}"`).join(" and ")}.`
      }
    }

    // Provide action advice based on sentiment distribution
    if (positivePercentage >= 70) {
      actionAdvice =
        " You should highlight these positive aspects in your marketing materials and continue maintaining your high standards."
    } else if (positivePercentage >= 50) {
      actionAdvice =
        " Consider addressing the negative feedback points while emphasizing your strengths in marketing communications."
    } else if (negativePercentage >= 40) {
      actionAdvice =
        " Prioritize addressing these concerns to improve customer satisfaction and prevent negative word-of-mouth."
    } else {
      actionAdvice = " A balanced approach to highlighting strengths while addressing weaknesses would be advisable."
    }

    // Combine everything into a personalized explanation
    return `Based on the analysis of ${reviewCount || "your"} reviews, customer sentiment is ${sentiment}.${strengthsHighlight}${weaknessesHighlight}${actionAdvice} The pie chart above provides a visual representation of the overall sentiment distribution, with ${positivePercentage}% positive, ${negativePercentage}% negative, and ${neutralPercentage}% neutral reviews. This insight can help you tailor your marketing strategy and product development priorities.`
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-black">Overall Satisfaction</h2>
      <div className="space-y-8">
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={dataWithPercentages}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percentage }) => `${name}: ${percentage}%`}
            >
              {dataWithPercentages.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-white p-2 border rounded shadow">
                      <p>{`${data.name}: ${data.percentage}%`}</p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              content={({ payload }) => (
                <div className="flex justify-center gap-8 mt-4">
                  {payload?.map((entry, index) => (
                    <div key={`item-${index}`} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className={`text-${entry.value.toLowerCase()}`}>{entry.value}</span>
                    </div>
                  ))}
                </div>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
        <p className="text-gray-600 text-lg leading-relaxed">{generatePersonalizedExplanation()}</p>
      </div>
    </div>
  )
}
