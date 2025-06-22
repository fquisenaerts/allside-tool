"use client"

import { useEffect, useState, useRef } from "react"
import { usePathname } from "next/navigation"

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const trailRef = useRef<{ x: number; y: number; opacity: number }[]>([])
  const requestRef = useRef<number>()
  const pathname = usePathname()

  // Check if we should display the cursor on the current page
  const shouldDisplayCursor = !pathname.startsWith("/analyze") && !pathname.startsWith("/my-establishments")

  useEffect(() => {
    if (!shouldDisplayCursor) return

    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
      if (!isVisible) setIsVisible(true)
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    const handleMouseEnter = () => {
      setIsVisible(true)
    }

    window.addEventListener("mousemove", updatePosition)
    document.addEventListener("mouseleave", handleMouseLeave)
    document.addEventListener("mouseenter", handleMouseEnter)

    return () => {
      window.removeEventListener("mousemove", updatePosition)
      document.removeEventListener("mouseleave", handleMouseLeave)
      document.removeEventListener("mouseenter", handleMouseEnter)
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [isVisible, shouldDisplayCursor])

  useEffect(() => {
    if (!shouldDisplayCursor) return

    // Create trail effect
    const updateTrail = () => {
      // Add current position to the trail
      trailRef.current = [
        { x: position.x, y: position.y, opacity: 0.6 }, // Keep initial opacity at 0.6
        ...trailRef.current.slice(0, 40), // Keep 40 points for longer fade
      ]

      // Reduce opacity of trail elements over time (slower fade)
      trailRef.current = trailRef.current.map((point, index) => ({
        ...point,
        opacity: Math.max(0, 0.6 - index * 0.01), // Keep fade rate
      }))

      requestRef.current = requestAnimationFrame(updateTrail)
    }

    requestRef.current = requestAnimationFrame(updateTrail)
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [position, shouldDisplayCursor])

  // Don't render anything if we shouldn't display the cursor or if it's not visible
  if (!shouldDisplayCursor || !isVisible) return null

  return (
    <>
      {/* Trail elements */}
      {trailRef.current.map((point, index) => (
        <div
          key={index}
          className="pointer-events-none fixed z-[9999]"
          style={{
            left: `${point.x}px`,
            top: `${point.y}px`,
            transform: "translate(-50%, -50%)",
            opacity: point.opacity,
          }}
        >
          <div
            className="rounded-full"
            style={{
              width: `${30 - index * 0.2}px`, // Keep the same size
              height: `${30 - index * 0.2}px`, // Keep the same size
              background: `radial-gradient(circle, rgba(255,255,255,${0.3 * point.opacity}) 0%, rgba(255,255,255,${
                0.2 * point.opacity
              }) 50%, rgba(255,255,255,0) 100%)`, // Keep the same transparency
              boxShadow: `0 0 20px 10px rgba(255,255,255,${0.1 * point.opacity})`, // Keep the same glow
              transition: "width 0.2s, height 0.2s",
            }}
          ></div>
        </div>
      ))}

      {/* Main cursor */}
      <div
        className="pointer-events-none fixed z-[9999]"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: "translate(-50%, -50%)",
        }}
      >
        {/* Aura */}
        <div
          className="rounded-full"
          style={{
            width: "30px", // Keep the same size
            height: "30px", // Keep the same size
            background:
              "radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%)", // Keep the same transparency
            boxShadow: "0 0 20px 10px rgba(255,255,255,0.1)", // Keep the same glow
          }}
        ></div>
      </div>
    </>
  )
}
