"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import cloud from "d3-cloud"

interface KeywordCloudProps {
  keywords: { text: string; value: number }[]
  explanation?: string
}

export function KeywordCloud({ keywords, explanation }: KeywordCloudProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [rendered, setRendered] = useState(false)

  useEffect(() => {
    if (!svgRef.current || rendered) return

    const svg = d3.select(svgRef.current)
    const width = svgRef.current.clientWidth || 800
    const height = 400

    // Clear any existing content
    svg.selectAll("*").remove()

    // Filter out generic keywords and normalize text
    let processedKeywords = [...(keywords || [])].filter(
      (k) =>
        k.text &&
        k.text !== "general feedback" &&
        k.text !== "Unknown" &&
        k.text !== "unknown" &&
        k.text !== "general" &&
        k.text !== "feedback" &&
        k.text !== "experience" &&
        k.text !== "review",
    )

    // If we have fewer than 5 keywords, add some common ones with lower values
    if (processedKeywords.length < 5) {
      // Only add what we need to get to 5 keywords
      const neededCount = 5 - processedKeywords.length

      // Use any existing keywords to determine the domain
      let domain = "general"
      if (processedKeywords.length > 0) {
        const allKeywords = processedKeywords.map((k) => k.text.toLowerCase()).join(" ")
        if (allKeywords.includes("food") || allKeywords.includes("restaurant") || allKeywords.includes("meal")) {
          domain = "restaurant"
        } else if (allKeywords.includes("hotel") || allKeywords.includes("room") || allKeywords.includes("stay")) {
          domain = "hotel"
        } else if (
          allKeywords.includes("product") ||
          allKeywords.includes("quality") ||
          allKeywords.includes("purchase")
        ) {
          domain = "product"
        } else if (
          allKeywords.includes("service") ||
          allKeywords.includes("support") ||
          allKeywords.includes("staff")
        ) {
          domain = "service"
        }
      }

      // Domain-specific additional keywords
      const additionalKeywordsByDomain = {
        restaurant: [
          { text: "taste", value: 2 },
          { text: "atmosphere", value: 2 },
          { text: "menu", value: 1 },
          { text: "portion", value: 1 },
          { text: "freshness", value: 1 },
        ],
        hotel: [
          { text: "comfort", value: 2 },
          { text: "location", value: 2 },
          { text: "cleanliness", value: 1 },
          { text: "amenities", value: 1 },
          { text: "view", value: 1 },
        ],
        product: [
          { text: "quality", value: 2 },
          { text: "durability", value: 2 },
          { text: "design", value: 1 },
          { text: "functionality", value: 1 },
          { text: "value", value: 1 },
        ],
        service: [
          { text: "responsiveness", value: 2 },
          { text: "professionalism", value: 2 },
          { text: "expertise", value: 1 },
          { text: "communication", value: 1 },
          { text: "reliability", value: 1 },
        ],
        general: [
          { text: "quality", value: 2 },
          { text: "service", value: 2 },
          { text: "value", value: 1 },
          { text: "convenience", value: 1 },
          { text: "satisfaction", value: 1 },
        ],
      }

      const additionalKeywords = additionalKeywordsByDomain[domain]
      processedKeywords = [...processedKeywords, ...additionalKeywords.slice(0, neededCount)]
    }

    // Fixed color palette
    const colors = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#14b8a6"]

    // Configure the layout with fixed parameters
    const layout = cloud()
      .size([width, height])
      .words(
        processedKeywords.map((k) => ({
          text: k.text,
          size: 10 + k.value * 3,
          value: k.value,
        })),
      )
      .padding(5)
      .rotate(0) // No rotation for stability
      .font("Arial")
      .fontSize((d) => d.size)
      .on("end", (words) => {
        // Create a color scale based on word frequency
        const colorScale = d3
          .scaleOrdinal()
          .domain(processedKeywords.map((k) => k.text))
          .range(colors)

        svg
          .append("g")
          .attr("transform", `translate(${width / 2},${height / 2})`)
          .selectAll("text")
          .data(words)
          .enter()
          .append("text")
          .style("font-size", (d) => `${d.size}px`)
          .style("font-family", "Arial")
          .style("fill", (d) => colorScale(d.text))
          .attr("text-anchor", "middle")
          .attr("transform", (d) => `translate(${d.x}, ${d.y})`)
          .text((d) => d.text)
      })

    layout.start()
    setRendered(true)
  }, [keywords, rendered])

  return (
    <div className="w-full">
      <svg ref={svgRef} width="100%" height="400"></svg>
      {explanation && <p className="text-sm text-gray-500 mt-2">{explanation}</p>}
    </div>
  )
}
