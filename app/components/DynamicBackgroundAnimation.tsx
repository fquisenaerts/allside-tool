"use client"

import type React from "react"
import { useRef, useEffect, useCallback } from "react"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
  alpha: number
}

interface ShootingStar {
  x: number
  y: number
  length: number
  speed: number
  angle: number // Radians
  alpha: number
  decay: number
}

const DynamicBackgroundAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameId = useRef<number | null>(null)
  const particles = useRef<Particle[]>([])
  const shootingStars = useRef<ShootingStar[]>([])
  const lastStarTime = useRef<number>(0)

  const minParticles = 50
  const maxParticles = 100
  const particleColor = "rgba(255, 255, 255, 0.8)"
  const lineColor = "rgba(255, 255, 255, 0.1)"
  const maxLineDistance = 150

  const minStarInterval = 3000 // Minimum time between stars (ms)
  const maxStarInterval = 10000 // Maximum time between stars (ms)

  const createParticle = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return null
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 1.5 + 0.5,
      color: particleColor,
      alpha: Math.random() * 0.5 + 0.5,
    }
  }, [])

  const createShootingStar = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const startX = Math.random() * canvas.width
    const startY = Math.random() * canvas.height * 0.5 // Stars mostly from top half
    const angle = Math.random() * Math.PI * 0.5 + Math.PI * 0.25 // Angle between 45 and 135 degrees (down-right to down-left)
    const speed = Math.random() * 5 + 2 // Pixels per frame
    const length = Math.random() * 100 + 50 // Length of the tail
    const decay = Math.random() * 0.02 + 0.01 // How fast it fades

    return {
      x: startX,
      y: startY,
      length,
      speed,
      angle,
      alpha: 1,
      decay,
    }
  }, [])

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      particles.current.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy

        // Wrap particles around
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.alpha
        ctx.fill()

        // Draw lines between close particles
        for (let j = i + 1; j < particles.current.length; j++) {
          const p2 = particles.current[j]
          const distance = Math.sqrt((p.x - p2.x) ** 2 + (p.y - p2.y) ** 2)

          if (distance < maxLineDistance) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = lineColor
            ctx.globalAlpha = 1 - distance / maxLineDistance // Fade lines based on distance
            ctx.stroke()
          }
        }
      })

      // Update and draw shooting stars
      shootingStars.current = shootingStars.current.filter((star) => star.alpha > 0)
      shootingStars.current.forEach((star) => {
        star.x += star.speed * Math.cos(star.angle)
        star.y += star.speed * Math.sin(star.angle)
        star.alpha -= star.decay

        if (star.alpha < 0) star.alpha = 0

        ctx.beginPath()
        ctx.moveTo(star.x, star.y)
        ctx.lineTo(star.x - star.length * Math.cos(star.angle), star.y - star.length * Math.sin(star.angle))
        ctx.strokeStyle = `rgba(255, 255, 255, ${star.alpha})`
        ctx.lineWidth = 2
        ctx.lineCap = "round"
        ctx.stroke()
      })

      ctx.globalAlpha = 1 // Reset global alpha
    },
    [createParticle, createShootingStar],
  )

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    draw(ctx, canvas)

    // Manage particle count
    if (particles.current.length < minParticles) {
      particles.current.push(createParticle()!)
    } else if (particles.current.length > maxParticles) {
      particles.current.shift() // Remove oldest particle
    }

    // Manage shooting stars
    const now = Date.now()
    if (now - lastStarTime.current > Math.random() * (maxStarInterval - minStarInterval) + minStarInterval) {
      shootingStars.current.push(createShootingStar()!)
      lastStarTime.current = now
    }

    animationFrameId.current = requestAnimationFrame(animate)
  }, [draw, createParticle, createShootingStar])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      // Re-initialize particles on resize to distribute them correctly
      particles.current = Array.from({ length: minParticles }, () => createParticle()!)
    }

    window.addEventListener("resize", resizeCanvas)
    resizeCanvas() // Initial resize

    // Initialize particles
    particles.current = Array.from({ length: minParticles }, () => createParticle()!)

    animationFrameId.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [animate, createParticle])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />
}

export default DynamicBackgroundAnimation
