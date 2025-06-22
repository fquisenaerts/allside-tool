"use client"

interface AnalysisDebugProps {
  analysisResults: any
}

export function AnalysisDebug({ analysisResults }: AnalysisDebugProps) {
  if (!analysisResults) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="font-semibold text-red-800">Debug: No Analysis Results</h3>
        <p className="text-red-600">analysisResults is null or undefined</p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="font-semibold text-blue-800">Debug: Analysis Results Structure</h3>
      <div className="mt-2 text-sm text-blue-700">
        <p>Review Count: {analysisResults.reviewCount || "N/A"}</p>
        <p>Sentiment: {analysisResults.sentiment ? "✓" : "✗"}</p>
        <p>Emotions: {analysisResults.emotions ? `${analysisResults.emotions.length} items` : "✗"}</p>
        <p>Themes: {analysisResults.themes ? `${analysisResults.themes.length} items` : "✗"}</p>
        <p>Strengths: {analysisResults.strengths ? `${analysisResults.strengths.length} items` : "✗"}</p>
        <p>Weaknesses: {analysisResults.weaknesses ? `${analysisResults.weaknesses.length} items` : "✗"}</p>
        <p>Review Summary: {analysisResults.reviewSummary ? `${analysisResults.reviewSummary.length} items` : "✗"}</p>
        <p>Review Dates: {analysisResults.reviewDates ? `${analysisResults.reviewDates.length} items` : "✗"}</p>
      </div>
    </div>
  )
}
