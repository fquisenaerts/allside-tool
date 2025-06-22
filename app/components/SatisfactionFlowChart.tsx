"use client"

interface SatisfactionFlowChartProps {
  data?: {
    nodes: { name: string }[]
    links: { source: number; target: number; value: number }[]
  }
  explanation?: string
}

export function SatisfactionFlowChart({ data, explanation }: SatisfactionFlowChartProps) {
  // Default explanation if none provided
  const defaultExplanation = `
    This Satisfaction Flow diagram visualizes the customer journey from initial experience to final outcome. 
    It shows how customers transition between different states, from their initial experience (unhappy, neutral, or positive), 
    to the type of review they leave, and finally to their resulting relationship with your brand.
    
    The width of each flow represents the volume of customers following that path. This visualization helps identify:
    
    1. Which initial experiences lead to which types of reviews
    2. How different types of reviews correlate with customer retention or loss
    3. Key opportunities to intervene in the customer journey to improve outcomes
    
    For example, you can see that unhappy customers predominantly leave negative reviews and become lost customers, 
    while positive experiences mostly result in positive reviews and brand advocates.
  `

  return (
    <div className="space-y-4">
      <div className="w-full h-[400px] bg-gray-50 rounded-lg p-4 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Customer Satisfaction Flow</h3>
          <p className="text-sm text-gray-500 mb-4">
            Visualizes how customers move from experiences to reviews to outcomes
          </p>
          <div className="flex justify-center space-x-8">
            <div className="flex flex-col items-center">
              <h4 className="font-medium mb-2">Experiences</h4>
              <div className="space-y-2">
                <div className="px-3 py-1 bg-red-100 text-red-800 rounded">Unhappy Customer</div>
                <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded">Neutral Experience</div>
                <div className="px-3 py-1 bg-green-100 text-green-800 rounded">Positive Experience</div>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <h4 className="font-medium mb-2">Reviews</h4>
              <div className="space-y-2">
                <div className="px-3 py-1 bg-red-100 text-red-800 rounded">Negative Review</div>
                <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded">Moderate Review</div>
                <div className="px-3 py-1 bg-green-100 text-green-800 rounded">Positive Review</div>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <h4 className="font-medium mb-2">Outcomes</h4>
              <div className="space-y-2">
                <div className="px-3 py-1 bg-red-100 text-red-800 rounded">Lost Customer</div>
                <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded">Repeat Customer</div>
                <div className="px-3 py-1 bg-green-100 text-green-800 rounded">Brand Advocate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-600">{explanation || defaultExplanation}</p>
    </div>
  )
}
