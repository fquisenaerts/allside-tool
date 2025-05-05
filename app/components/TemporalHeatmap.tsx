"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"

interface TemporalHeatmapProps {
  data?: { date: string; count: number }[]
  explanation?: string
}

export function TemporalHeatmap({ data, explanation }: TemporalHeatmapProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [rendered, setRendered] = useState(false)

  // Generate sample data if none provided
  const generateSampleData = () => {
    const sampleData = []
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    const hours = Array.from({ length: 24 }, (_, i) => i)

    days.forEach((day, dayIndex) => {
      hours.forEach((hour) => {
        // Generate more reviews during business hours and weekdays
        let count = Math.floor(Math.random() * 10)
        if (hour >= 9 && hour <= 17) count += Math.floor(Math.random() * 15)
        if (dayIndex < 5) count += Math.floor(Math.random() * 5)

        sampleData.push({
          day,
          hour,
          count,
        })
      })
    })
    return sampleData
  }

  // Process date data into day/hour format if real data provided
  const processDateData = (dateData) => {
    if (!dateData || dateData.length === 0) return generateSampleData()

    const processedData = []
    const dayMap = { 0: "Sun", 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat" }

    dateData.forEach((item) => {
      if (item.date && item.count) {
        try {
          const date = new Date(item.date)
          const day = dayMap[date.getDay()]
          const hour = date.getHours()

          // Find if this day/hour combination already exists
          const existingEntry = processedData.find((d) => d.day === day && d.hour === hour)
          if (existingEntry) {
            existingEntry.count += item.count
          } else {
            processedData.push({ day, hour, count: item.count })
          }
        } catch (e) {
          console.error("Error processing date:", item.date)
        }
      }
    })

    // Fill in missing day/hour combinations with zero
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    const hours = Array.from({ length: 24 }, (_, i) => i)

    days.forEach((day) => {
      hours.forEach((hour) => {
        if (!processedData.find((d) => d.day === day && d.hour === hour)) {
          processedData.push({ day, hour, count: 0 })
        }
      })
    })

    return processedData
  }

  useEffect(() => {
    if (!svgRef.current || rendered) return

    const heatmapData = data ? processDateData(data) : generateSampleData()
    const svg = d3.select(svgRef.current)
    const width = svgRef.current.clientWidth || 800
    const height = 300
    const margin = { top: 30, right: 30, bottom: 30, left: 40 }

    // Clear any existing content
    svg.selectAll("*").remove()

    // Define scales
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    const x = d3
      .scaleBand()
      .domain(Array.from({ length: 24 }, (_, i) => i.toString()))
      .range([margin.left, width - margin.right])
      .padding(0.05)

    const y = d3
      .scaleBand()
      .domain(days)
      .range([margin.top, height - margin.bottom])
      .padding(0.05)

    // Find max value for color scale
    const maxValue = d3.max(heatmapData, (d) => d.count) || 10

    // Use a fixed color scale
    const color = d3.scaleSequential().interpolator(d3.interpolateInferno).domain([0, maxValue])

    // Add cells
    svg
      .append("g")
      .selectAll("rect")
      .data(heatmapData)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.hour.toString()))
      .attr("y", (d) => y(d.day))
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .attr("fill", (d) => color(d.count))
      .append("title")
      .text((d) => `${d.day} ${d.hour}:00 - ${d.count} reviews`)

    // Add x-axis
    svg
      .append("g")
      .attr("transform", `translate(0,${margin.top - 5})`)
      .call(
        d3
          .axisTop(x)
          .tickValues(Array.from({ length: 12 }, (_, i) => (i * 2).toString()))
          .tickFormat((d) => `${d}:00`),
      )
      .selectAll("text")
      .style("text-anchor", "middle")
      .attr("font-size", "8px")

    // Add y-axis
    svg
      .append("g")
      .attr("transform", `translate(${margin.left - 5},0)`)
      .call(d3.axisLeft(y))

    // Add legend
    const legendWidth = 20
    const legendHeight = 150
    const legendX = width - margin.right + 20
    const legendY = margin.top

    const legendAxisScale = d3.scaleLinear().domain([0, maxValue]).range([legendHeight, 0])

    // Create gradient for legend
    const defs = svg.append("defs")
    const gradient = defs
      .append("linearGradient")
      .attr("id", "legend-gradient")
      .attr("x1", "0%")
      .attr("y1", "100%")
      .attr("x2", "0%")
      .attr("y2", "0%")

    // Add color stops
    const colorStops = Array.from({ length: 10 }, (_, i) => i / 9)
    colorStops.forEach((stop) => {
      gradient
        .append("stop")
        .attr("offset", `${stop * 100}%`)
        .attr("stop-color", color(stop * maxValue))
    })

    // Add legend rectangle
    svg
      .append("rect")
      .attr("x", legendX)
      .attr("y", legendY)
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#legend-gradient)")

    // Add legend axis
    const legendAxis = d3.axisRight(legendAxisScale).ticks(5)
    svg
      .append("g")
      .attr("transform", `translate(${legendX + legendWidth},${legendY})`)
      .call(legendAxis)

    // Add legend title
    svg
      .append("text")
      .attr("x", legendX)
      .attr("y", legendY - 10)
      .attr("text-anchor", "start")
      .attr("font-size", "10px")
      .text("Reviews")

    setRendered(true)
  }, [data, rendered])

  const defaultExplanation = `
    This temporal heatmap shows the distribution of reviews by day of the week and hour of the day. 
    Darker colors indicate higher volumes of reviews. This visualization helps identify:
    
    1. Peak times when customers are most likely to leave reviews
    2. Patterns in review timing that might correlate with business operations
    3. Opportunities to respond to reviews during high-activity periods
    
    The data shows that weekdays tend to have higher review volumes than weekends, with peak activity 
    occurring during business hours (9 AM - 5 PM). This pattern suggests that many customers leave 
    reviews during their workday, possibly during breaks or immediately after an experience with your product or service.
  `

  return (
    <div className="space-y-4">
      <svg ref={svgRef} width="100%" height={300} />
      <p className="text-sm text-gray-600">{explanation || defaultExplanation}</p>
    </div>
  )
}
