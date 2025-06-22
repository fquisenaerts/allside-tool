"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Header } from "../components/Header"
import { Footer } from "../components/Footer"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useTranslation } from "@/app/hooks/useTranslation"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Separator } from "@/components/ui/separator"
import { ChromeIcon } from "lucide-react"

export default function LoginClient() {
  const { t } = useTranslation()
  const router = useRouter()
  const pathname = usePathname()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        router.push("/analyze")
      }
    }
    checkUser()
  }, [router])

  const handleGoogleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      alert(error.message)
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    console.log("🚀 NEW VERSION: Starting login process")

    try {
      console.log("🚀 NEW VERSION: Calling signInWithPassword")

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      })

      console.log("🚀 NEW VERSION: Login response received, error:", error)

      if (error) {
        console.log("🚀 NEW VERSION: Login failed with error:", error.message)
        setError(error.message)
        setLoading(false)
        return
      }

      console.log("🚀 NEW VERSION: Login successful, showing alert")
      alert("🚀 NEW VERSION: Login successful! About to redirect...")

      console.log("🚀 NEW VERSION: Attempting redirect")
      window.location.href = "/analyze"
    } catch (err: any) {
      console.log("🚀 NEW VERSION: Exception caught:", err)
      setError("Login failed. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050314] text-white flex flex-col">
      <Header />
      <div className="flex-grow flex items-center justify-center">
        <Card className="w-[400px] mt-20 bg-[#050314] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">{t("auth.logIn")}</CardTitle>
            <CardDescription className="text-gray-400">{t("auth.signInToAccount")}</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>{t("auth.errorTitle")}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="email"
                placeholder={t("auth.email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#0f0a2e] border-gray-700 text-white"
                disabled={loading}
              />
              <Input
                type="password"
                placeholder={t("auth.password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[#0f0a2e] border-gray-700 text-white"
                disabled={loading}
              />
              <Button type="submit" className="w-full bg-white text-black hover:bg-gray-100" disabled={loading}>
                {loading ? t("auth.signingIn") : t("auth.signIn")}
              </Button>
            </form>

            <div className="relative my-6">
              <Separator className="absolute inset-0 h-px my-auto bg-gray-600" />
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#050314] px-2 text-gray-400">Or continue with</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <ChromeIcon className="h-4 w-4" />
              Connect with Google
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/signup" className="text-sm text-gray-400 hover:text-white">
              {t("auth.dontHaveAccount")}
            </Link>
          </CardFooter>
        </Card>
      </div>
      <Footer />
    </div>
  )
}
