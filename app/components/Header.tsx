"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import { ChevronDown, LogOut, UserIcon } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { Logo } from "./Logo"
import { LanguageSwitcher } from "./LanguageSwitcher"
import { useTranslation } from "@/app/hooks/useTranslation"
import { useToast } from "@/hooks/use-toast"

export function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const accountMenuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useTranslation()
  const { toast } = useToast()

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession()
      setUser(data?.session?.user || null)
      setLoading(false)

      // Set up auth state listener
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user || null)
      })

      return () => {
        authListener.subscription.unsubscribe()
      }
    }

    checkUser()
  }, [])

  // Close dropdown when clicking outside
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

      // Sign out directly using Supabase client
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      // Redirect to home page
      window.location.href = "/"
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
    <header className="py-6 bg-[#050314] text-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Logo />

          <nav className="hidden md:flex space-x-10">
            {user ? (
              // Show these links when user is logged in
              <>
                <Link href="/analyze" className="text-base font-medium text-white hover:text-gray-300">
                  {t("header.analyzer")}
                </Link>
                <Link href="/my-establishments" className="text-base font-medium text-white hover:text-gray-300">
                  {t("header.myEstablishments")}
                </Link>
              </>
            ) : (
              // Show these links when user is not logged in
              <>
                <Link href="#features" className="text-base font-medium text-white hover:text-gray-300">
                  {t("header.features")}
                </Link>
                <Link href="/about" className="text-base font-medium text-white hover:text-gray-300">
                  {t("header.aboutUs")}
                </Link>
                <Link href="/connect" className="text-base font-medium text-white hover:text-gray-300">
                  {t("header.connect")}
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center space-x-6">
            {/* Language Switcher Dropdown */}
            <LanguageSwitcher />

            {loading ? (
              <div className="h-10 w-24 bg-gray-200 animate-pulse rounded"></div>
            ) : user ? (
              // When logged in, show Account dropdown
              <div className="relative" ref={accountMenuRef}>
                <Button
                  variant="outline"
                  className="gap-2 bg-white text-black border-white hover:bg-gray-100 text-base px-5 py-2.5"
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                >
                  <UserIcon className="h-5 w-5" />
                  {t("header.account")}
                  <ChevronDown className="h-5 w-5" />
                </Button>

                {showAccountMenu && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-[100]"
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
              // When not logged in, show Get Started and Log In buttons
              <>
                <Button asChild className="bg-white text-black hover:bg-gray-100 text-base px-5 py-2.5">
                  <Link href="/login?redirect=payment">{t("header.getStarted")}</Link>
                </Button>
                <Link
                  href="/login"
                  className="inline-block bg-white text-black hover:bg-gray-100 font-medium rounded-md px-5 py-2.5 text-base transition-colors"
                >
                  {t("header.logIn")}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
