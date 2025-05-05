"use client"

import { useState } from "react"

type ToastVariant = "default" | "destructive"

interface Toast {
  title: string
  description?: string
  variant?: ToastVariant
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = (toast: Toast) => {
    setToasts((prev) => [...prev, toast])

    // In a real implementation, you'd want to remove the toast after some time
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t !== toast))
    }, 5000)

    // For now, just log to console since we don't have a UI component
    console.log(`Toast: ${toast.title}${toast.description ? ` - ${toast.description}` : ""}`)
  }

  return { toast, toasts }
}
