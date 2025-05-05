"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Auth } from "./components/Auth"

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <Auth />
  }

  return <>{children}</>
}
