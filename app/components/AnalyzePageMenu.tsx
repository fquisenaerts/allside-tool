"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import { ChevronDown, LogOut, UserIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { Logo } from "./Logo"
import { LanguageSwitcher } from "./LanguageSwitcher"
import { useTranslation } from "@/app/hooks/useTranslation"
import { useToast } from "@/hooks/use-toast"

export function AnalyzePageMenu() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const accountMenuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { t } = useTranslation()
  const { toast } = useToast()

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession()
      setUser(data?.session?.user || null)
      setLoading(false)

      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user || null)
      })

      return () => {
        authListener.subscription.unsubscribe()
      }
    }

    checkUser()
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setShowAccountMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSignOut = async () => {
    try {
      setLoggingOut(true)
      setShowAccountMenu(false)
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }
      window.location.href = "/" // Redirect to home page after logout
    } catch (error: any) {
      console.error("Error signing out:", error)
      toast({
        title: "Logout Error",
        description: error.message || "An error occurred during logout. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoggingOut(false)
    }
  }

  const navigateTo = (path: string) => {
    router.push(path)
    setShowAccountMenu(false)
  }

  return (
    <div className="w-64 flex-shrink-0 bg-black border-r border-gray-800 p-4 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="mb-8">
        <Logo />
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col items-start space-y-4 w-full">
        {/* Removed Home Link */}
        <Link
          href="/analyze"
          className="text-lg font-medium text-white hover:text-gray-300 w-full text-left px-2 py-1 rounded"
        >
          {t("header.analyzer")}
        </Link>
        <Link
          href="/my-establishments"
          className="text-lg font-medium text-white hover:text-gray-300 w-full text-left px-2 py-1 rounded"
        >
          {t("header.myEstablishments")}
        </Link>
        <Link
          href="/subscription"
          className="text-lg font-medium text-white hover:text-gray-300 w-full text-left px-2 py-1 rounded"
        >
          {t("header.subscription")}
        </Link>
        <Link
          href="/profile"
          className="text-lg font-medium text-white hover:text-gray-300 w-full text-left px-2 py-1 rounded"
        >
          {t("header.myProfile")}
        </Link>
        {/* Removed Contact Link */}
        {/* Removed About Us Link */}
      </nav>

      {/* User Actions and Language Switcher */}
      <div className="mt-auto flex flex-col items-start space-y-4 w-full pt-8">
        {loading ? (
          <div className="h-10 w-full bg-gray-700 animate-pulse rounded"></div>
        ) : user ? (
          <div className="relative w-full" ref={accountMenuRef}>
            <Button
              variant="outline"
              className="gap-2 bg-white text-black border-white hover:bg-gray-100 text-base px-5 py-2.5 w-full justify-start"
              onClick={() => setShowAccountMenu(!showAccountMenu)}
            >
              <UserIcon className="h-5 w-5" />
              {t("header.account")}
              <ChevronDown className="h-5 w-5 ml-auto" />
            </Button>

            {showAccountMenu && (
              <div
                className="absolute left-0 bottom-full mb-2 w-full bg-white border border-gray-200 rounded-md shadow-lg z-[100]"
                style={{ display: showAccountMenu ? "block" : "none" }}
              >
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-black truncate">{user.email}</p>
                </div>
                <div className="py-1">
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-100"
                    onClick={() => navigateTo("/profile")}
                  >
                    {t("header.myProfile")}
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-100"
                    onClick={() => navigateTo("/my-establishments")}
                  >
                    {t("header.myEstablishments")}
                  </button>
                  {user.user_metadata?.is_admin && (
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-100"
                      onClick={() => navigateTo("/iowabo")}
                    >
                      {t("header.backoffice")}
                    </button>
                  )}
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                    onClick={handleSignOut}
                    disabled={loggingOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {loggingOut ? "Signing out..." : t("header.signOut")}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <Button
              asChild
              className="bg-white text-black hover:bg-gray-100 text-base px-5 py-2.5 w-full justify-center"
            >
              <Link href="/login?redirect=payment">{t("header.getStarted")}</Link>
            </Button>
            <Link
              href="/login"
              className="inline-block bg-gray-800 text-white hover:bg-gray-700 font-medium rounded-md px-5 py-2.5 text-base transition-colors w-full text-center"
            >
              {t("header.logIn")}
            </Link>
          </>
        )}
        <div className="w-full mt-4">
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  )
}
