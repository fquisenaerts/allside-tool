"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"
import * as d3Sankey from "d3-sankey"

interface SatisfactionFlowChartProps {
  data?: {
    nodes: { name: string }[]
    links: { source: number; target: number; value: number }[]
  }
  explanation?: string
}

export function SatisfactionFlowChart({ data, explanation }: SatisfactionFlowChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  // Default data if none provided
  const defaultData = {
    nodes: [
      { name: "Unhappy Customer" },
      { name: "Neutral Experience" },
      { name: "Positive Experience" },
      { name: "Negative Review" },
      { name: "Moderate Review" },
      { name: "Positive Review" },
      { name: "Lost Customer" },
      { name: "Repeat Customer" },
      { name: "Brand Advocate" },
    ],
    links: [
      { source: 0, target: 3, value: 20 },
      { source: 0, target: 4, value: 10 },
      { source: 1, target: 3, value: 5 },
      { source: 1, target: 4, value: 25 },
      { source: 1, target: 5, value: 15 },
      { source: 2, target: 4, value: 5 },
      { source: 2, target: 5, value: 30 },
      { source: 3, target: 6, value: 22 },
      { source: 3, target: 7, value: 3 },
      { source: 4, target: 6, value: 10 },
      { source: 4, target: 7, value: 25 },
      { source: 4, target: 8, value: 5 },
      { source: 5, target: 7, value: 15 },
      { source: 5, target: 8, value: 20 },
    ],
  }

  const chartData = data || defaultData

  useEffect(() => {
    if (!svgRef.current) return

    // Set a fixed size for stability
    const width = svgRef.current.clientWidth || 800
    const height = 400

    // Clear any existing content
    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    // Set up the sankey generator with fixed parameters
    const sankey = d3Sankey
      .sankey()
      .nodeWidth(15)
      .nodePadding(10)
      .extent([
        [1, 1],
        [width - 1, height - 5],
      ])

    // Format the data for d3-sankey
    const sankeyData = {
      nodes: chartData.nodes.map((d, i) => ({ ...d, id: i })),
      links: chartData.links.map((d) => ({
        ...d,
        source: d.source,
        target: d.target,
      })),
    }

    // Generate the sankey diagram
    const { nodes, links } = sankey(sankeyData)

    // Define color scale with fixed colors
    const colorScale = d3
      .scaleOrdinal()
      .domain([
        "Unhappy Customer",
        "Neutral Experience",
        "Positive Experience",
        "Negative Review",
        "Moderate Review",
        "Positive Review",
        "Lost Customer",
        "Repeat Customer",
        "Brand Advocate",
      ])
      .range(["#ef4444", "#f59e0b", "#22c55e", "#ef4444", "#f59e0b", "#22c55e", "#ef4444", "#3b82f6", "#22c55e"])

    // Add links
    svg
      .append("g")
      .selectAll("path")
      .data(links)
      .enter()
      .append("path")
      .attr("d", d3Sankey.sankeyLinkHorizontal())
      .attr("stroke-width", (d) => Math.max(1, d.width))
      .attr("stroke", (d) => colorScale(d.source.name))
      .attr("stroke-opacity", 0.5)
      .attr("fill", "none")
      .append("title")
      .text((d) => `${d.source.name} → ${d.target.name}: ${d.value}`)

    // Add nodes
    const node = svg
      .append("g")
      .selectAll("rect")
      .data(nodes)
      .enter()
      .append("rect")
      .attr("x", (d) => d.x0)
      .attr("y", (d) => d.y0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("width", (d) => d.x1 - d.x0)
      .attr("fill", (d) => colorScale(d.name))
      .attr("stroke", "#000")

    // Add node titles
    node.append("title").text((d) => `${d.name}: ${d.value}`)

    // Add node labels
    svg
      .append("g")
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .attr("x", (d) => (d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6))
      .attr("y", (d) => (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", (d) => (d.x0 < width / 2 ? "start" : "end"))
      .text((d) => d.name)
      .attr("font-size", "10px")
      .attr("fill", "#000") // Ensure text is visible
  }, []) // Empty dependency array to ensure it only runs once

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
      <svg ref={svgRef} width="100%" height={400} />
      <p className="text-sm text-gray-600">{explanation || defaultExplanation}</p>
    </div>
  )
}
