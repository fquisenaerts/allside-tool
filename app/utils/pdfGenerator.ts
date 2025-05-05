import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

export function generatePDFReport(data: any) {
  const doc = new jsPDF()
  let yPos = 20

  // Title
  doc.setFontSize(20)
  doc.text("Sentiment Analysis Report", 15, yPos)
  yPos += 20

  // Basic Stats
  doc.setFontSize(16)
  doc.text("Analysis Overview", 15, yPos)
  yPos += 10
  doc.setFontSize(12)

  const reviewCount = data.reviewCount || 0
  const averageNote = data.averageNote ? data.averageNote.toFixed(2) : "N/A"
  const language = data.language || "English"

  doc.text(`Total Reviews: ${reviewCount}`, 20, yPos)
  yPos += 8
  doc.text(`Average Rating: ${averageNote}`, 20, yPos)
  yPos += 8
  doc.text(`Language: ${language}`, 20, yPos)
  yPos += 15

  // Overall Sentiment
  doc.setFontSize(16)
  doc.text("Overall Satisfaction", 15, yPos)
  yPos += 10
  doc.setFontSize(12)

  // Create sentiment data table
  const sentimentData = [
    ["Sentiment", "Percentage"],
    ["Positive", `${data.sentiment?.positive.toFixed(1)}%`],
    ["Negative", `${data.sentiment?.negative.toFixed(1)}%`],
    ["Neutral", `${data.sentiment?.neutral.toFixed(1)}%`],
  ]

  autoTable(doc, {
    head: [sentimentData[0]],
    body: sentimentData.slice(1),
    startY: yPos,
    theme: "grid",
  })

  yPos = (doc as any).lastAutoTable.finalY + 10

  // Generate sentiment explanation
  const positivePercentage = data.sentiment?.positive.toFixed(1) || 0
  const negativePercentage = data.sentiment?.negative.toFixed(1) || 0
  const neutralPercentage = data.sentiment?.neutral.toFixed(1) || 0

  let sentiment = ""
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

  const sentimentText = `Based on the analysis of ${reviewCount} reviews, customer sentiment is ${sentiment}. This insight can help you tailor your marketing strategy and product development priorities.`

  const splitSentiment = doc.splitTextToSize(sentimentText, 180)
  doc.text(splitSentiment, 15, yPos)
  yPos += splitSentiment.length * 7 + 15

  // Add new page if needed
  if (yPos > 250) {
    doc.addPage()
    yPos = 20
  }

  // Strengths and Weaknesses
  doc.setFontSize(16)
  doc.text("Strengths and Weaknesses", 15, yPos)
  yPos += 10

  if (data.strengths?.length > 0) {
    doc.setFontSize(14)
    doc.text("Top Strengths", 15, yPos)
    yPos += 8

    autoTable(doc, {
      head: [["Strength", "Count"]],
      body: data.strengths.map((s: any) => [s.strength, s.count]),
      startY: yPos,
      theme: "grid",
    })

    yPos = (doc as any).lastAutoTable.finalY + 10
  }

  if (yPos > 250) {
    doc.addPage()
    yPos = 20
  }

  if (data.weaknesses?.length > 0) {
    doc.setFontSize(14)
    doc.text("Top Weaknesses", 15, yPos)
    yPos += 8

    autoTable(doc, {
      head: [["Weakness", "Count"]],
      body: data.weaknesses.map((w: any) => [w.weakness, w.count]),
      startY: yPos,
      theme: "grid",
    })

    yPos = (doc as any).lastAutoTable.finalY + 10
  }

  // Add new page for emotions and themes
  doc.addPage()
  yPos = 20

  // Main Emotions
  if (data.emotions?.length > 0) {
    doc.setFontSize(16)
    doc.text("Main Emotions", 15, yPos)
    yPos += 10

    autoTable(doc, {
      head: [["Emotion", "Count"]],
      body: data.emotions.map((e: any) => [e.emotion, e.count]),
      startY: yPos,
      theme: "grid",
    })

    yPos = (doc as any).lastAutoTable.finalY + 10
  }

  // Key Themes
  if (data.themes?.length > 0) {
    doc.setFontSize(16)
    doc.text("Key Themes", 15, yPos)
    yPos += 10

    autoTable(doc, {
      head: [["Theme", "Count"]],
      body: data.themes.map((t: any) => [t.theme, t.count]),
      startY: yPos,
      theme: "grid",
    })

    yPos = (doc as any).lastAutoTable.finalY + 10
  }

  // Add new page for keywords
  doc.addPage()
  yPos = 20

  // Keywords
  if (data.keywords?.length > 0) {
    doc.setFontSize(16)
    doc.text("Keywords", 15, yPos)
    yPos += 10

    autoTable(doc, {
      head: [["Keyword", "Count"]],
      body: data.keywords.map((k: any) => [k.text, k.value]),
      startY: yPos,
      theme: "grid",
    })

    yPos = (doc as any).lastAutoTable.finalY + 10
  }

  // Add new page for content enhancement
  doc.addPage()
  yPos = 20

  // Content Enhancement
  doc.setFontSize(16)
  doc.text("Content Enhancement Suggestions", 15, yPos)
  yPos += 10

  // Generate arguments based on actual review data
  const generateArguments = () => {
    // Sort strengths, weaknesses, and keywords by count/value
    const sortedStrengths = [...(data.strengths || [])].sort((a, b) => b.count - a.count)
    const sortedWeaknesses = [...(data.weaknesses || [])].sort((a, b) => b.count - a.count)
    const sortedKeywords = [...(data.themes || [])].sort((a, b) => b.count - a.count)

    // Best elements to highlight (top strengths)
    const bestElements = sortedStrengths.slice(0, 3).map((s) => s.strength)

    // Differentiating elements (combination of unique strengths and keywords)
    const allTerms = [...(sortedStrengths.map((s) => s.strength) || []), ...(sortedKeywords.map((k) => k.theme) || [])]
    const uniqueTerms = [...new Set(allTerms)]
    const differentiatingElements = uniqueTerms.filter((term) => !bestElements.includes(term)).slice(0, 4)

    // Standard arguments (common aspects that aren't major strengths or weaknesses)
    const allMajorPoints = [
      ...(sortedStrengths.slice(0, 3).map((s) => s.strength) || []),
      ...(sortedWeaknesses.slice(0, 3).map((w) => w.weakness) || []),
    ]

    const standardElements = uniqueTerms.filter((term) => !allMajorPoints.includes(term)).slice(0, 3)

    // If we don't have enough data, provide some defaults
    if (bestElements.length === 0) {
      bestElements.push("product quality", "customer service", "value for money")
    }

    if (differentiatingElements.length === 0) {
      differentiatingElements.push("unique design", "innovative features", "reliability", "ease of use")
    }

    if (standardElements.length === 0) {
      standardElements.push("durability", "performance", "brand reputation")
    }

    return {
      best: bestElements,
      differentiating: differentiatingElements,
      standard: standardElements,
    }
  }

  const args = generateArguments()

  // Best elements
  doc.setFontSize(14)
  doc.text("Best elements to highlight", 15, yPos)
  yPos += 8

  args.best.forEach((item, index) => {
    doc.text(`• ${item}`, 20, yPos)
    yPos += 7
  })

  yPos += 5

  // Differentiating elements
  doc.setFontSize(14)
  doc.text("Other differentiating elements to emphasize", 15, yPos)
  yPos += 8

  args.differentiating.forEach((item, index) => {
    doc.text(`• ${item}`, 20, yPos)
    yPos += 7
  })

  yPos += 5

  // Standard arguments
  doc.setFontSize(14)
  doc.text("Standard arguments", 15, yPos)
  yPos += 8

  args.standard.forEach((item, index) => {
    doc.text(`• ${item}`, 20, yPos)
    yPos += 7
  })

  // Add new page for review summary
  doc.addPage()
  yPos = 20

  // Review Summary
  if (data.reviewSummary?.length > 0) {
    doc.setFontSize(16)
    doc.text("Summary of Reviews", 15, yPos)
    yPos += 10

    // Create a table with review summaries
    const reviewRows = data.reviewSummary.map((r: any) => [
      r.text.substring(0, 50) + (r.text.length > 50 ? "..." : ""),
      r.sentiment,
      (r.strengths || []).join(", "),
      (r.keywords || []).join(", "),
    ])

    autoTable(doc, {
      head: [["Review", "Sentiment", "Strengths", "Keywords"]],
      body: reviewRows,
      startY: yPos,
      theme: "grid",
      styles: { overflow: "linebreak", cellWidth: "wrap" },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 30 },
        2: { cellWidth: 40 },
        3: { cellWidth: 40 },
      },
    })
  }

  // Save the PDF
  doc.save("sentiment_analysis_report.pdf")
}
