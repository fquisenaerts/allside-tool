"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"

interface ExportReportsProps {
  results: any[]
}

// Dummy function for generateAIResponse, replace with actual implementation or import
const generateAIResponse = (review: any) => {
  return "Suggested response based on AI"
}

export function ExportReports({ results }: ExportReportsProps) {
  const exportPDF = () => {
    const doc = new jsPDF()
    results.forEach((result, index) => {
      if (index > 0) {
        doc.addPage()
      }
      doc.text(`Analysis Results ${index + 1}`, 14, 15)
      doc.text(`Overall Sentiment: ${result.sentiment}`, 14, 25)
      doc.text(`Score: ${(result.score * 100).toFixed(1)}%`, 14, 35)
      doc.text(`Key Themes: ${result.themes.join(", ")}`, 14, 45)

      autoTable(doc, {
        head: [["Category", "Details"]],
        body: [
          ["Ad Suggestions", result.adSuggestions.map((s) => `${s.type}: ${s.suggestion}`).join("\n")],
          ["Product Suggestions", result.productSuggestions.join("\n")],
          ["Strengths", result.strengths.map((s) => `${s.category}: ${s.count}`).join("\n")],
          ["Weaknesses", result.weaknesses.map((w) => `${w.category}: ${w.count}`).join("\n")],
          ["Main Emotions", result.mainEmotions.map((e) => `${e.emotion}: ${e.count}`).join("\n")],
          ["Opinion Trend", result.opinionTrend],
          ["Keywords", result.keywords.map((k) => `${k.text}: ${k.value}`).join("\n")],
        ],
        startY: 55,
      })

      doc.addPage()
      autoTable(doc, {
        head: [["Review", "Sentiment", "Platform", "Strengths", "Keywords", "Suggested Response"]],
        body: result.reviewSummary.map((review: any) => [
          review.text,
          review.sentiment,
          review.platform,
          review.strengths.join(", "),
          review.keywords.join(", "),
          generateAIResponse(review),
        ]),
        startY: 15,
      })
    })
    doc.save("sentiment_analysis_report.pdf")
  }

  const exportExcel = () => {
    const wb = XLSX.utils.book_new()
    results.forEach((result, index) => {
      const wsData = [
        ["Overall Sentiment", result.sentiment],
        ["Score", result.score],
        ["Key Themes", result.themes.join(", ")],
        ["Ad Suggestions", result.adSuggestions.map((s) => `${s.type}: ${s.suggestion}`).join("\n")],
        ["Product Suggestions", result.productSuggestions.join("\n")],
        ["Strengths", result.strengths.map((s) => `${s.category}: ${s.count}`).join("\n")],
        ["Weaknesses", result.weaknesses.map((w) => `${w.category}: ${w.count}`).join("\n")],
        ["Main Emotions", result.mainEmotions.map((e) => `${e.emotion}: ${e.count}`).join("\n")],
        ["Opinion Trend", result.opinionTrend],
        ["Keywords", result.keywords.map((k) => `${k.text}: ${k.value}`).join("\n")],
        [],
        ["Review Summary"],
        ["Review", "Sentiment", "Platform", "Strengths", "Keywords", "Suggested Response"],
        ...result.reviewSummary.map((review: any) => [
          review.text,
          review.sentiment,
          review.platform,
          review.strengths.join(", "),
          review.keywords.join(", "),
          generateAIResponse(review),
        ]),
      ]
      const ws = XLSX.utils.aoa_to_sheet(wsData)
      XLSX.utils.book_append_sheet(wb, ws, `Analysis ${index + 1}`)
    })
    XLSX.writeFile(wb, "sentiment_analysis_report.xlsx")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Reports</CardTitle>
      </CardHeader>
      <CardContent className="flex space-x-4">
        <Button onClick={exportPDF}>Export PDF</Button>
        <Button onClick={exportExcel}>Export Excel</Button>
      </CardContent>
    </Card>
  )
}
