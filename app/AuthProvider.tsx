"use client"

import { useContext, createContext, useEffect, useState, useRef, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import { getLocalizedUrl, getLanguageFromPath } from "@/lib/urlMapping"
import { useLanguage } from "./hooks/useLanguage"

interface AuthContextType {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const publicPaths = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/auth/callback",
  "/about",
  "/contact",
  "/book-a-demo",
  "/connexion",
  "/inscription",
  "/a-propos",
  "/contactez-nous",
  "/reserver-une-demo",
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const { language } = useLanguage()
  const hasRedirected = useRef<string | null>(null)
  const isCheckingUser = useRef(false)
  const isInitialized = useRef(false)

  useEffect(() => {
    // Prevent duplicate initialization
    if (isInitialized.current) {
      console.log("AuthProvider: Already initialized, skipping...")
      return
    }

    isInitialized.current = true

    const checkUser = async () => {
      // Prevent multiple simultaneous checkUser calls
      if (isCheckingUser.current) {
        console.log("AuthProvider: checkUser already in progress, skipping...")
        return
      }

      isCheckingUser.current = true
      console.log("AuthProvider: Checking user session...")

      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("AuthProvider: Error getting session:", error)
          setUser(null)
        } else {
          setUser(session?.user || null)
          console.log("AuthProvider: Session user:", session?.user?.id ? "Logged In" : "Logged Out")
        }
      } catch (error) {
        console.error("AuthProvider: Exception during session check:", error)
        setUser(null)
      } finally {
        setLoading(false)
        isCheckingUser.current = false
      }
    }

    checkUser()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log(
        "AuthProvider: Auth state changed. Event:",
        _event,
        "Session user:",
        session?.user?.id ? "Logged In" : "Logged Out",
      )

      // Don't process INITIAL_SESSION events if we already processed one
      if (_event === "INITIAL_SESSION" && hasRedirected.current?.includes("initial")) {
        console.log("AuthProvider: Ignoring duplicate INITIAL_SESSION event")
        return
      }

      const newUser = session?.user || null
      setUser(newUser)
      setLoading(false)

      // Handle post-login redirection only for SIGNED_IN events
      if (_event === "SIGNED_IN" && session?.user) {
        const currentPath = window.location.pathname
        const currentLanguage = getLanguageFromPath(currentPath)
        const redirectKey = `${currentLanguage}-login`

        if (hasRedirected.current !== redirectKey) {
          const isAuthPage = ["/login", "/signup", "/connexion", "/inscription"].includes(currentPath)

          if (isAuthPage) {
            const targetUrl = getLocalizedUrl("/analyze", currentLanguage)
            console.log(`AuthProvider: Post-login redirect for ${currentLanguage} from ${currentPath} to ${targetUrl}`)
            hasRedirected.current = redirectKey

            setTimeout(() => {
              router.replace(targetUrl)
            }, 500)
          }
        }
      }

      // Mark initial session as processed and reset redirect flag when user logs out
      if (_event === "INITIAL_SESSION") {
        hasRedirected.current = hasRedirected.current ? hasRedirected.current + "-initial" : "initial"
      } else if (_event === "SIGNED_OUT") {
        hasRedirected.current = null
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
      isInitialized.current = false
    }
  }, []) // Keep empty dependency array

  useEffect(() => {
    if (loading) {
      console.log("AuthProvider: Loading, skipping redirection logic...")
      return
    }

    const isPublicPath = publicPaths.includes(pathname)
    const currentLanguage = getLanguageFromPath(pathname)
    const redirectKey = `${currentLanguage}-logout`

    // Only handle unauthenticated users on protected paths
    if (!user && !isPublicPath) {
      if (hasRedirected.current !== redirectKey) {
        const targetUrl = getLocalizedUrl("/login", currentLanguage)
        console.log(
          `AuthProvider: Redirecting unauthenticated user for ${currentLanguage} from ${pathname} to ${targetUrl}`,
        )
        hasRedirected.current = redirectKey
        router.replace(targetUrl)
      }
    }
  }, [user, loading, pathname, router])

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
