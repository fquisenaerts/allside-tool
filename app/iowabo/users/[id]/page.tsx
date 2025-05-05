"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, CreditCard, User, Ban, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<any>(null)
  const [authUser, setAuthUser] = useState<any>(null)
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchUserData()
  }, [params.id])

  const fetchUserData = async () => {
    setLoading(true)
    setError(null)
    setDebugInfo(null)

    try {
      // Fetch user from public.users table
      const { data: userData, error: userError } = await supabase.from("users").select("*").eq("id", params.id).single()

      if (userError) {
        setDebugInfo(`Error fetching from users table: ${userError.message}`)
      } else {
        setUser(userData)
        setDebugInfo(`Successfully fetched user from users table: ${JSON.stringify(userData)}`)
      }

      // Try to fetch from auth.users (may require special permissions)
      try {
        const { data: authUserData, error: authUserError } = await supabase.rpc("get_auth_user_by_id", {
          user_id: params.id,
        })

        if (authUserError) {
          setDebugInfo((prev) => `${prev || ""}\nError fetching from auth.users: ${authUserError.message}`)
        } else if (authUserData) {
          setAuthUser(authUserData)
          setDebugInfo(
            (prev) => `${prev || ""}\nSuccessfully fetched user from auth.users: ${JSON.stringify(authUserData)}`,
          )
        }
      } catch (authError: any) {
        setDebugInfo((prev) => `${prev || ""}\nException fetching from auth.users: ${authError.message}`)
      }

      // Fetch user's subscriptions
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", params.id)
        .order("created_at", { ascending: false })

      if (subscriptionsError) {
        setDebugInfo((prev) => `${prev || ""}\nError fetching subscriptions: ${subscriptionsError.message}`)
      } else {
        setSubscriptions(subscriptionsData || [])
        setDebugInfo((prev) => `${prev || ""}\nFetched ${subscriptionsData?.length || 0} subscriptions`)
      }

      // If we couldn't get the user from either table, show an error
      if ((!userData || userError) && (!authUserData || authUserError)) {
        setError("Could not find user data in any table")
      }
    } catch (error: any) {
      console.error("Error fetching user data:", error)
      setError(`Error fetching user data: ${error.message}`)
      setDebugInfo(`Exception in fetchUserData: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!selectedSubscription) return

    setCancelLoading(true)
    try {
      // Call your subscription cancellation API or service
      const { error } = await supabase
        .from("subscriptions")
        .update({ status: "canceled", canceled_at: new Date().toISOString() })
        .eq("id", selectedSubscription.id)

      if (error) throw error

      // Refresh the data
      await fetchUserData()
      setCancelDialogOpen(false)
    } catch (error: any) {
      console.error("Error canceling subscription:", error)
      alert(`Failed to cancel subscription: ${error.message}`)
    } finally {
      setCancelLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-40 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-40 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-40 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    )
  }

  if (!user && !authUser) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">User not found</h2>
        <p className="text-gray-500 mb-4">
          The user you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Button asChild>
          <Link href="/iowabo/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Link>
        </Button>
      </div>
    )
  }

  // Combine data from both sources
  const combinedUser = {
    ...authUser,
    ...user,
    metadata: authUser?.raw_user_meta_data || {},
  }

  const getSubscriptionStatus = (status: string) => {
    switch (status) {
      case "active":
        return { label: "Active", color: "bg-green-100 text-green-800" }
      case "canceled":
        return { label: "Canceled", color: "bg-red-100 text-red-800" }
      case "trialing":
        return { label: "Trial", color: "bg-blue-100 text-blue-800" }
      default:
        return { label: status, color: "bg-gray-100 text-gray-800" }
    }
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
    } catch (e) {
      return dateString
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/iowabo/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">User Details</h1>
        <Button variant="outline" size="sm" onClick={fetchUserData} className="ml-auto">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {debugInfo && (
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <AlertTitle className="text-blue-800">Debug Information</AlertTitle>
          <AlertDescription className="text-blue-700 whitespace-pre-wrap">{debugInfo}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gray-100 p-3 rounded-full">
                <User className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <div className="font-medium">
                  {combinedUser.name || combinedUser.full_name || combinedUser.email || "N/A"}
                </div>
                <div className="text-sm text-gray-500">{combinedUser.email}</div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">User ID:</span>
                <span className="font-mono">{combinedUser.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Role:</span>
                <Badge variant="outline">{combinedUser.role || "user"}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Joined:</span>
                <span>{formatDateTime(combinedUser.created_at)}</span>
              </div>
              {combinedUser.last_sign_in_at && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Sign In:</span>
                  <span>{formatDateTime(combinedUser.last_sign_in_at)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Subscription Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gray-100 p-3 rounded-full">
                <CreditCard className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                {subscriptions.length > 0 && subscriptions[0].status === "active" ? (
                  <>
                    <div className="font-medium">Active Subscription</div>
                    <div className="text-sm text-gray-500">Plan: {subscriptions[0].plan_id}</div>
                  </>
                ) : (
                  <>
                    <div className="font-medium">No Active Subscription</div>
                    <div className="text-sm text-gray-500">User is not currently subscribed</div>
                  </>
                )}
              </div>
            </div>
            {subscriptions.length > 0 && subscriptions[0].status === "active" && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Started:</span>
                  <span>{formatDateTime(subscriptions[0].created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Current Period:</span>
                  <span>{formatDateTime(subscriptions[0].current_period_end)}</span>
                </div>
                <div className="mt-4">
                  <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full"
                        onClick={() => setSelectedSubscription(subscriptions[0])}
                      >
                        <Ban className="mr-2 h-4 w-4" />
                        Cancel Subscription
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to cancel this user's subscription? This action cannot be undone and the
                          user will lose access to premium features.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancelSubscription} disabled={cancelLoading}>
                          {cancelLoading ? "Canceling..." : "Yes, Cancel Subscription"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">User Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {combinedUser.metadata &&
                Object.entries(combinedUser.metadata).map(([key, value]: [string, any]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-500">{key}:</span>
                    <span className="max-w-[60%] truncate text-right">
                      {typeof value === "object" ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                ))}
              {(!combinedUser.metadata || Object.keys(combinedUser.metadata).length === 0) && (
                <div className="text-center py-4 text-gray-500">No metadata available</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>User Data</CardTitle>
          <CardDescription>All available user data from the database</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {user && (
              <div>
                <h3 className="text-lg font-medium mb-2">Public Users Table</h3>
                <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                  <pre className="text-xs">{JSON.stringify(user, null, 2)}</pre>
                </div>
              </div>
            )}

            {authUser && (
              <div>
                <h3 className="text-lg font-medium mb-2">Auth Users Table</h3>
                <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                  <pre className="text-xs">{JSON.stringify(authUser, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subscription History</CardTitle>
          <CardDescription>Complete history of user's subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          {subscriptions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No subscription history found for this user</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((subscription) => {
                  const status = getSubscriptionStatus(subscription.status)
                  return (
                    <TableRow key={subscription.id}>
                      <TableCell className="font-medium">{subscription.plan_id}</TableCell>
                      <TableCell>
                        <Badge className={status.color}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>{formatDateTime(subscription.created_at)}</TableCell>
                      <TableCell>
                        {subscription.canceled_at
                          ? formatDateTime(subscription.canceled_at)
                          : subscription.current_period_end
                            ? formatDateTime(subscription.current_period_end)
                            : "N/A"}
                      </TableCell>
                      <TableCell>${subscription.amount || "N/A"}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
