"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import { ChevronDown, LogOut, UserIcon } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { Logo } from "./Logo"

export function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const accountMenuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()

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
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const navigateTo = (path: string) => {
    router.push(path)
    setShowAccountMenu(false)
  }

  return (
    <header className="py-4 bg-[#050314] text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Logo />

          <nav className="hidden md:flex space-x-8">
            {user ? (
              // Show these links when user is logged in
              <>
                <Link href="/analyze" className="text-sm text-white hover:text-gray-300">
                  Analyzer
                </Link>
                <Link href="/my-establishments" className="text-sm text-white hover:text-gray-300">
                  My Establishments
                </Link>
              </>
            ) : (
              // Show these links when user is not logged in
              <>
                <Link href="#features" className="text-sm text-white hover:text-gray-300">
                  Features
                </Link>
                <Link href="#resources" className="text-sm text-white hover:text-gray-300">
                  Resources
                </Link>
                <Link href="/connect" className="text-sm text-white hover:text-gray-300">
                  Connect
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
            ) : user ? (
              // When logged in, show Account dropdown
              <div className="relative" ref={accountMenuRef}>
                <Button
                  variant="outline"
                  className="gap-2 bg-white text-black border-white hover:bg-gray-100"
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                >
                  <UserIcon className="h-4 w-4" />
                  Account
                  <ChevronDown className="h-4 w-4" />
                </Button>

                {showAccountMenu && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-[100]"
                    style={{ display: showAccountMenu ? "block" : "none" }}
                  >
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-black truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <button
                        className="w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-100"
                        onClick={() => navigateTo("/profile")}
                      >
                        My Profile
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-100"
                        onClick={() => navigateTo("/my-establishments")}
                      >
                        My Establishments
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                        onClick={handleSignOut}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // When not logged in, show Get Started and Log In buttons
              <>
                <Button asChild className="bg-white text-black hover:bg-gray-100">
                  <Link href="/login">Get Started</Link>
                </Button>
                <Link href="/login" className="text-sm text-white hover:text-gray-300">
                  Log in
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
