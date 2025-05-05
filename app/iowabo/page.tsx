"use client"

import { useEffect, useState } from "react"
import { createAdminClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, CreditCard, TrendingUp, AlertCircle, ArrowRight, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function BackofficeDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    freeUsers: 0,
    recentSignups: 0,
    expiringSubscriptions: 0,
    trialUsers: 0,
    standardPlanUsers: 0,
    customPlanUsers: 0,
  })
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)
    setDebugInfo(null)

    try {
      // Use admin client for better permissions
      const adminClient = createAdminClient()

      // Get total users count directly from auth.users
      try {
        const {
          data: authUsers,
          error: authError,
          count,
        } = await adminClient.from("auth.users").select("*", { count: "exact", head: true })

        if (!authError && count !== null) {
          stats.totalUsers = count
          setDebugInfo(`Found ${count} users in auth.users table`)
        } else {
          // Fallback to profiles or users table
          try {
            const { count: profilesCount, error: profilesError } = await adminClient
              .from("profiles")
              .select("*", { count: "exact", head: true })

            if (!profilesError && profilesCount !== null) {
              stats.totalUsers = profilesCount
              setDebugInfo(`Found ${profilesCount} users in profiles table`)
            } else {
              // Try users table
              const { count: usersCount, error: usersError } = await adminClient
                .from("users")
                .select("*", { count: "exact", head: true })

              if (!usersError && usersCount !== null) {
                stats.totalUsers = usersCount
                setDebugInfo(`Found ${usersCount} users in users table`)
              } else {
                // If all else fails, try direct SQL count
                const { data: sqlCount, error: sqlError } = await adminClient.rpc("get_total_users_count")

                if (!sqlError && sqlCount && sqlCount.count) {
                  stats.totalUsers = sqlCount.count
                  setDebugInfo(`Found ${sqlCount.count} users via SQL function`)
                } else {
                  stats.totalUsers = 0
                  setDebugInfo(`Could not determine user count: ${sqlError?.message || "Unknown error"}`)
                }
              }
            }
          } catch (countError: any) {
            console.error("Error counting users:", countError)
            setDebugInfo(`Error counting users: ${countError.message}`)
            stats.totalUsers = 0
          }
        }
      } catch (authError: any) {
        console.error("Error accessing auth.users:", authError)
        setDebugInfo(`Error accessing auth.users: ${authError.message}`)

        // Fallback to RPC function
        try {
          const { data: userCountData, error: userCountError } = await adminClient.rpc("get_total_users_count")

          if (!userCountError && userCountData) {
            console.log("Got user count from RPC function:", userCountData.count)
            stats.totalUsers = userCountData.count
            setDebugInfo(`Got user count from RPC function: ${userCountData.count}`)
          } else {
            setDebugInfo(`RPC function error: ${userCountError?.message || "Unknown error"}`)
          }
        } catch (rpcError: any) {
          console.error("RPC function error:", rpcError)
          setDebugInfo(`RPC function error: ${rpcError.message}`)
        }
      }

      // Check if subscriptions table exists
      let subscriptionsExist = true
      try {
        const { error: testError } = await adminClient
          .from("subscriptions")
          .select("id", { count: "exact", head: true })
          .limit(1)

        if (testError) {
          console.error("Error checking subscriptions table:", testError)
          subscriptionsExist = false
          setDebugInfo((prev) => `${prev || ""}\nSubscriptions table not accessible: ${testError.message}`)
        }
      } catch (error: any) {
        console.error("Error checking subscriptions table:", error)
        subscriptionsExist = false
        setDebugInfo((prev) => `${prev || ""}\nError checking subscriptions table: ${error.message}`)
      }

      if (subscriptionsExist) {
        // Get active subscriptions count
        const { count: activeSubscriptions, error: subscriptionsError } = await adminClient
          .from("subscriptions")
          .select("*", { count: "exact", head: true })
          .eq("status", "active")

        if (subscriptionsError) {
          console.error("Error fetching active subscriptions:", subscriptionsError)
          setDebugInfo((prev) => `${prev || ""}\nError fetching active subscriptions: ${subscriptionsError.message}`)
        } else {
          stats.activeSubscriptions = activeSubscriptions || 0
          setDebugInfo((prev) => `${prev || ""}\nFound ${activeSubscriptions} active subscriptions`)
        }

        // Get trial users count
        const { count: trialUsers, error: trialError } = await adminClient
          .from("subscriptions")
          .select("*", { count: "exact", head: true })
          .eq("status", "trialing")

        if (trialError) {
          console.error("Error fetching trial users:", trialError)
          setDebugInfo((prev) => `${prev || ""}\nError fetching trial users: ${trialError.message}`)
        } else {
          stats.trialUsers = trialUsers || 0
          setDebugInfo((prev) => `${prev || ""}\nFound ${trialUsers} trial users`)
        }

        // Get standard plan users count
        const { count: standardPlanUsers, error: standardError } = await adminClient
          .from("subscriptions")
          .select("*", { count: "exact", head: true })
          .eq("status", "active")
          .eq("plan_id", "standard")

        if (standardError) {
          console.error("Error fetching standard plan users:", standardError)
        } else {
          stats.standardPlanUsers = standardPlanUsers || 0
        }

        // Get custom plan users count
        const { count: customPlanUsers, error: customError } = await adminClient
          .from("subscriptions")
          .select("*", { count: "exact", head: true })
          .eq("status", "active")
          .eq("plan_id", "custom")

        if (customError) {
          console.error("Error fetching custom plan users:", customError)
        } else {
          stats.customPlanUsers = customPlanUsers || 0
        }

        // Calculate free users (total users - active subscriptions - trial users)
        stats.freeUsers = Math.max(0, stats.totalUsers - stats.activeSubscriptions - stats.trialUsers)
        setDebugInfo((prev) => `${prev || ""}\nCalculated ${stats.freeUsers} free users`)

        // Get expiring subscriptions (next 7 days)
        const now = new Date()
        const sevenDaysFromNow = new Date()
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

        const { count: expiringSubscriptions, error: expiringError } = await adminClient
          .from("subscriptions")
          .select("*", { count: "exact", head: true })
          .eq("status", "active")
          .gte("current_period_end", now.toISOString())
          .lte("current_period_end", sevenDaysFromNow.toISOString())

        if (expiringError) {
          console.error("Error fetching expiring subscriptions:", expiringError)
        } else {
          stats.expiringSubscriptions = expiringSubscriptions || 0
        }
      } else {
        // If subscriptions table doesn't exist, set defaults
        stats.activeSubscriptions = 0
        stats.trialUsers = 0
        stats.standardPlanUsers = 0
        stats.customPlanUsers = 0
        stats.freeUsers = stats.totalUsers
        stats.expiringSubscriptions = 0
      }

      // Get recent signups (last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      // Try different tables to get recent signups
      try {
        // Try auth.users first (with admin client)
        const { count: authRecentCount, error: authRecentError } = await adminClient
          .from("auth.users")
          .select("*", { count: "exact", head: true })
          .gte("created_at", sevenDaysAgo.toISOString())

        if (!authRecentError && authRecentCount !== null) {
          stats.recentSignups = authRecentCount
          setDebugInfo((prev) => `${prev || ""}\nFound ${authRecentCount} recent signups in auth.users`)
        } else {
          // Try profiles table
          const { count: recentSignups, error: recentSignupsError } = await adminClient
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .gte("created_at", sevenDaysAgo.toISOString())

          if (!recentSignupsError) {
            stats.recentSignups = recentSignups || 0
            setDebugInfo((prev) => `${prev || ""}\nFound ${recentSignups} recent signups in profiles`)
          } else {
            // Try users table
            const { count: recentUsersCount, error: recentUsersError } = await adminClient
              .from("users")
              .select("*", { count: "exact", head: true })
              .gte("created_at", sevenDaysAgo.toISOString())

            if (!recentUsersError) {
              stats.recentSignups = recentUsersCount || 0
              setDebugInfo((prev) => `${prev || ""}\nFound ${recentUsersCount} recent signups in users`)
            } else {
              stats.recentSignups = 0
              setDebugInfo((prev) => `${prev || ""}\nCould not determine recent signups`)
            }
          }
        }
      } catch (error: any) {
        console.error("Error fetching recent signups:", error)
        stats.recentSignups = 0
        setDebugInfo((prev) => `${prev || ""}\nError fetching recent signups: ${error.message}`)
      }

      // Get recent users
      try {
        // Try auth.users first (with admin client)
        const { data: authUsers, error: authUsersError } = await adminClient
          .from("auth.users")
          .select("id, email, created_at")
          .order("created_at", { ascending: false })
          .limit(5)

        if (!authUsersError && authUsers && authUsers.length > 0) {
          // If we have data, fetch their subscriptions if the table exists
          if (subscriptionsExist) {
            const usersWithSubscriptions = await Promise.all(
              authUsers.map(async (user) => {
                try {
                  const { data: userSubscriptions } = await adminClient
                    .from("subscriptions")
                    .select("*")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false })
                    .limit(1)

                  return {
                    ...user,
                    subscriptions: userSubscriptions || [],
                  }
                } catch (error) {
                  return {
                    ...user,
                    subscriptions: [],
                  }
                }
              }),
            )
            setRecentUsers(usersWithSubscriptions)
            setDebugInfo(
              (prev) => `${prev || ""}\nFetched ${usersWithSubscriptions.length} recent users from auth.users`,
            )
          } else {
            // If subscriptions table doesn't exist, just add empty subscriptions array
            const usersWithEmptySubs = authUsers.map((user) => ({
              ...user,
              subscriptions: [],
            }))
            setRecentUsers(usersWithEmptySubs)
            setDebugInfo(
              (prev) =>
                `${prev || ""}\nFetched ${usersWithEmptySubs.length} recent users from auth.users (no subscriptions)`,
            )
          }
        } else {
          // Try profiles table first
          const { data: profileUsers, error: profilesError } = await adminClient
            .from("profiles")
            .select("id, email, created_at")
            .order("created_at", { ascending: false })
            .limit(5)

          if (!profilesError && profileUsers && profileUsers.length > 0) {
            // If we have data, fetch their subscriptions if the table exists
            if (subscriptionsExist) {
              const usersWithSubscriptions = await Promise.all(
                profileUsers.map(async (user) => {
                  try {
                    const { data: userSubscriptions } = await adminClient
                      .from("subscriptions")
                      .select("*")
                      .eq("user_id", user.id)
                      .order("created_at", { ascending: false })
                      .limit(1)

                    return {
                      ...user,
                      subscriptions: userSubscriptions || [],
                    }
                  } catch (error) {
                    return {
                      ...user,
                      subscriptions: [],
                    }
                  }
                }),
              )

              setRecentUsers(usersWithSubscriptions)
              setDebugInfo(
                (prev) => `${prev || ""}\nFetched ${usersWithSubscriptions.length} recent users from profiles`,
              )
            } else {
              // If subscriptions table doesn't exist, just add empty subscriptions array
              const usersWithEmptySubs = profileUsers.map((user) => ({
                ...user,
                subscriptions: [],
              }))
              setRecentUsers(usersWithEmptySubs)
              setDebugInfo(
                (prev) =>
                  `${prev || ""}\nFetched ${usersWithEmptySubs.length} recent users from profiles (no subscriptions)`,
              )
            }
          } else {
            // Try users table
            const { data: users, error: usersError } = await adminClient
              .from("users")
              .select("id, email, created_at")
              .order("created_at", { ascending: false })
              .limit(5)

            if (!usersError && users && users.length > 0) {
              const usersWithEmptySubs = users.map((user) => ({
                ...user,
                subscriptions: [],
              }))
              setRecentUsers(usersWithEmptySubs)
              setDebugInfo(
                (prev) => `${prev || ""}\nFetched ${usersWithEmptySubs.length} recent users from users table`,
              )
            } else {
              // If all else fails, create sample data
              setRecentUsers([
                {
                  id: "1",
                  email: "user1@example.com",
                  created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                  subscriptions: [],
                },
                {
                  id: "2",
                  email: "user2@example.com",
                  created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                  subscriptions: [],
                },
                {
                  id: "3",
                  email: "user3@example.com",
                  created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                  subscriptions: [],
                },
              ])
              setDebugInfo((prev) => `${prev || ""}\nUsing sample user data as fallback`)
            }
          }
        }
      } catch (error: any) {
        console.error("Error fetching recent users:", error)
        setDebugInfo((prev) => `${prev || ""}\nError fetching recent users: ${error.message}`)
        setRecentUsers([])
      }

      setStats({ ...stats })
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error)
      setError(`Error fetching dashboard data: ${error.message || "Unknown error"}`)
      setDebugInfo(`Error in fetchDashboardData: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const getSubscriptionStatus = (user: any) => {
    if (!user.subscriptions || user.subscriptions.length === 0) {
      return { label: "Free Plan", color: "bg-gray-100 text-gray-800" }
    }

    const subscription = user.subscriptions[0]
    if (subscription.status === "active") {
      return { label: "Paid", color: "bg-green-100 text-green-800" }
    } else if (subscription.status === "canceled") {
      return { label: "Canceled", color: "bg-red-100 text-red-800" }
    } else if (subscription.status === "trialing") {
      return { label: "Trial", color: "bg-blue-100 text-blue-800" }
    } else {
      return { label: subscription.status, color: "bg-gray-100 text-gray-800" }
    }
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6 text-black">Dashboard</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex justify-between items-center">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={() => fetchDashboardData()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {debugInfo && (
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <AlertTitle className="text-blue-800">Debug Information</AlertTitle>
          <AlertDescription className="text-blue-700 whitespace-pre-wrap">{debugInfo}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-gray-500 mr-2" />
              <div className="text-2xl font-bold">
                {loading ? <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div> : stats.totalUsers}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 text-gray-500 mr-2" />
              <div className="text-2xl font-bold">
                {loading ? (
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  stats.activeSubscriptions
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Current paying customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Free Plan Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-gray-500 mr-2" />
              <div className="text-2xl font-bold">
                {loading ? <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div> : stats.freeUsers}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Users on free plan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">New Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-gray-500 mr-2" />
              <div className="text-2xl font-bold">
                {loading ? <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div> : stats.recentSignups}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Signups in the last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Trial Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="text-2xl font-bold">
                {loading ? <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div> : stats.trialUsers}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Users on free trial</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Standard Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="text-2xl font-bold">
                {loading ? <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div> : stats.standardPlanUsers}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Users on standard plan (€16/month)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="text-2xl font-bold">
                {loading ? (
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  stats.expiringSubscriptions
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Subscriptions expiring in 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Users */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-black">Recent Users</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/iowabo/users">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <CardDescription>Latest user registrations</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : recentUsers.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No users found</div>
          ) : (
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-black">{user.email}</div>
                    <div className="text-sm text-gray-500">Joined {formatDateTime(user.created_at)}</div>
                  </div>
                  <Badge className={getSubscriptionStatus(user).color}>{getSubscriptionStatus(user).label}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-black">User Management</CardTitle>
            <CardDescription>Manage user accounts and profiles</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link href="/iowabo/users">
                <Users className="mr-2 h-4 w-4" />
                View Users
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-black">Subscription Management</CardTitle>
            <CardDescription>Manage user subscriptions and plans</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link href="/iowabo/subscriptions">
                <CreditCard className="mr-2 h-4 w-4" />
                View Subscriptions
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-black">Settings</CardTitle>
            <CardDescription>Configure backoffice settings</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link href="/iowabo/settings">
                <AlertCircle className="mr-2 h-4 w-4" />
                View Settings
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
