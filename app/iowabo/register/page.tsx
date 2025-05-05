"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { backofficeRegister } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/app/components/Logo"

export default function BackofficeRegister() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [registrationCode, setRegistrationCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showSqlInstructions, setShowSqlInstructions] = useState(false)
  const [fixingRlsIssue, setFixingRlsIssue] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("email", email)
      formData.append("password", password)
      formData.append("confirmPassword", confirmPassword)
      formData.append("registrationCode", registrationCode)

      const result = await backofficeRegister(formData)

      if (!result.success) {
        setError(result.error || "Registration failed")

        // If the table doesn't exist, show SQL instructions
        if (result.tableExists === false) {
          setShowSqlInstructions(true)
        }

        // If there's an RLS issue, show RLS fix instructions
        if (result.error && result.error.includes("row-level security policy")) {
          setFixingRlsIssue(true)
        }

        return
      }

      // Force a hard navigation to the dashboard
      window.location.href = "/iowabo"
    } catch (error: any) {
      setError(error.message || "An error occurred during registration")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <CardTitle className="text-2xl text-center">Register Admin Account</CardTitle>
          <CardDescription className="text-center">Create a new admin account for the backoffice</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {fixingRlsIssue && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
              <h3 className="font-semibold text-amber-800 mb-2">Row-Level Security Issue</h3>
              <p className="text-sm text-amber-700 mb-2">
                There's an RLS policy issue with the backoffice_admins table. Please follow these steps to fix it:
              </p>
              <ol className="text-sm text-amber-700 list-decimal pl-5 space-y-1">
                <li>Go to your Supabase dashboard</li>
                <li>Navigate to the SQL Editor</li>
                <li>
                  Copy the SQL from the file{" "}
                  <code className="bg-amber-100 px-1 rounded">app/iowabo/fix_backoffice_rls.sql</code>
                </li>
                <li>Paste and run the SQL in the editor</li>
                <li>Return to this page and try registering again</li>
              </ol>
            </div>
          )}

          {showSqlInstructions && !fixingRlsIssue && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
              <h3 className="font-semibold text-amber-800 mb-2">Database Setup Required</h3>
              <p className="text-sm text-amber-700 mb-2">
                The backoffice_admins table doesn't exist in your database. Please follow these steps:
              </p>
              <ol className="text-sm text-amber-700 list-decimal pl-5 space-y-1">
                <li>Go to your Supabase dashboard</li>
                <li>Navigate to the SQL Editor</li>
                <li>
                  Copy the SQL from the file{" "}
                  <code className="bg-amber-100 px-1 rounded">app/iowabo/create_backoffice_table.sql</code>
                </li>
                <li>Paste and run the SQL in the editor</li>
                <li>Return to this page and try registering again</li>
              </ol>
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registrationCode">Registration Code</Label>
                <Input
                  id="registrationCode"
                  type="text"
                  placeholder="Enter the admin registration code"
                  value={registrationCode}
                  onChange={(e) => setRegistrationCode(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  You need a valid registration code to create an admin account
                </p>
              </div>
              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? "Registering..." : "Register Admin Account"}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-gray-500">
            Already have an admin account?{" "}
            <Link href="/iowabo/login" className="text-blue-600 hover:underline">
              Login here
            </Link>
          </div>
          <div className="mt-4 text-xs text-center">
            <button
              onClick={() => {
                setShowSqlInstructions(!showSqlInstructions)
                setFixingRlsIssue(false)
              }}
              className="text-gray-500 hover:text-gray-700 underline"
              type="button"
            >
              {showSqlInstructions ? "Hide Setup Instructions" : "Show Setup Instructions"}
            </button>
            {" | "}
            <button
              onClick={() => {
                setFixingRlsIssue(!fixingRlsIssue)
                setShowSqlInstructions(false)
              }}
              className="text-gray-500 hover:text-gray-700 underline"
              type="button"
            >
              {fixingRlsIssue ? "Hide RLS Fix Instructions" : "Show RLS Fix Instructions"}
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
