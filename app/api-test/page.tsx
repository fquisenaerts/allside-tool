"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function ApiTest() {
  const [userId, setUserId] = useState("test-user-123")
  const [email, setEmail] = useState("test@example.com")
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testApi = async () => {
    setLoading(true)
    setResponse(null)

    try {
      // Test the API with fetch first to see the response
      const res = await fetch(
        `/api/direct-stripe-checkout?userId=${encodeURIComponent(userId)}&email=${encodeURIComponent(email)}`,
      )

      // Try to parse the response as JSON
      try {
        const data = await res.json()
        setResponse({
          status: res.status,
          statusText: res.statusText,
          data,
        })
      } catch (e) {
        // If it's not JSON, get the text
        const text = await res.text()
        setResponse({
          status: res.status,
          statusText: res.statusText,
          text: text || "(empty response)",
          headers: Object.fromEntries(res.headers.entries()),
        })
      }
    } catch (error) {
      setResponse({
        error: true,
        message: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setLoading(false)
    }
  }

  const directRedirect = () => {
    window.location.href = `/api/direct-stripe-checkout?userId=${encodeURIComponent(userId)}&email=${encodeURIComponent(email)}`
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>API Test Tool</CardTitle>
          <CardDescription>Test the direct-stripe-checkout API</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">User ID</label>
            <Input value={userId} onChange={(e) => setUserId(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="flex space-x-4">
            <Button onClick={testApi} disabled={loading}>
              {loading ? "Testing..." : "Test API (Fetch)"}
            </Button>
            <Button onClick={directRedirect} variant="outline">
              Direct Redirect
            </Button>
          </div>
        </CardContent>
      </Card>

      {response && (
        <Card>
          <CardHeader>
            <CardTitle>API Response</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">{JSON.stringify(response, null, 2)}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
