"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { logout } from "../actions/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function loadUser() {
      try {
        // Get the current session
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        if (!data.session) {
          // No session, redirect to login
          router.push("/login")
          return
        }

        // Get user details from public.users table
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.session.user.id)
          .single()

        if (userError && userError.code !== "PGRST116") {
          console.error("Error fetching user data:", userError)
        }

        setUser({
          ...data.session.user,
          profile: userData || {},
        })
      } catch (err: any) {
        setError(err.message || "Failed to load user data")
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [router])

  const handleLogout = async () => {
    await logout()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-[600px]">
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>Welcome to your account dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {user && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="mt-1">{user.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Name</h3>
                  <p className="mt-1">{user.profile?.name || user.user_metadata?.name || "Not provided"}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Account ID</h3>
                <p className="mt-1 text-xs font-mono">{user.id}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Last Sign In</h3>
                <p className="mt-1">{new Date(user.last_sign_in_at).toLocaleString()}</p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/")}>
            Go to Home
          </Button>
          <Button variant="destructive" onClick={handleLogout}>
            Log out
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
