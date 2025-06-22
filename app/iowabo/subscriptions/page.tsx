"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Ban, CheckCircle, Search } from "lucide-react"
import Link from "next/link"

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const fetchSubscriptions = async () => {
    setLoading(true)
    try {
      // Fetch subscriptions with user information
      const { data, error } = await supabase
        .from("subscriptions")
        .select(`
          *,
          profiles:user_id (
            email,
            full_name
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      setSubscriptions(data || [])
    } catch (error) {
      console.error("Error fetching subscriptions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!selectedSubscription) return

    setCancelLoading(true)
    try {
      // Update subscription status in database
      const { error } = await supabase
        .from("subscriptions")
        .update({
          status: "canceled",
          canceled_at: new Date().toISOString(),
        })
        .eq("id", selectedSubscription.id)

      if (error) throw error

      // Refresh the data
      await fetchSubscriptions()
      setCancelDialogOpen(false)
    } catch (error) {
      console.error("Error canceling subscription:", error)
      alert("Failed to cancel subscription. Please try again.")
    } finally {
      setCancelLoading(false)
    }
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

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  const filteredSubscriptions = subscriptions.filter((subscription) => {
    const email = subscription.profiles?.email || ""
    const name = subscription.profiles?.full_name || ""
    const plan = subscription.plan_id || ""
    const status = subscription.status || ""

    const query = searchQuery.toLowerCase()
    return (
      email.toLowerCase().includes(query) ||
      name.toLowerCase().includes(query) ||
      plan.toLowerCase().includes(query) ||
      status.toLowerCase().includes(query)
    )
  })

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Subscription Management</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Subscriptions Overview</CardTitle>
          <CardDescription>Manage user subscriptions and plans</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <Search className="mr-2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by email, name, plan or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-12 bg-gray-100 rounded animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                        No subscriptions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSubscriptions.map((subscription) => {
                      const status = getSubscriptionStatus(subscription.status)
                      return (
                        <TableRow key={subscription.id}>
                          <TableCell>
                            <div className="font-medium">{subscription.profiles?.email || "N/A"}</div>
                            <div className="text-sm text-gray-500">{subscription.profiles?.full_name || ""}</div>
                          </TableCell>
                          <TableCell>{subscription.plan_id}</TableCell>
                          <TableCell>
                            <Badge className={status.color}>{status.label}</Badge>
                          </TableCell>
                          <TableCell>{formatDate(subscription.current_period_start)}</TableCell>
                          <TableCell>{formatDate(subscription.current_period_end)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/iowabo/users/${subscription.user_id}`}>View User</Link>
                              </Button>
                              {subscription.status === "active" && (
                                <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => setSelectedSubscription(subscription)}
                                    >
                                      <Ban className="mr-1 h-4 w-4" />
                                      Cancel
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to cancel this subscription? This action cannot be undone
                                        and the user will lose access to premium features.
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
                              )}
                              {subscription.status === "canceled" && (
                                <Button variant="outline" size="sm" className="text-green-600">
                                  <CheckCircle className="mr-1 h-4 w-4" />
                                  Reactivate
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subscription Plans</CardTitle>
          <CardDescription>Available subscription plans</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Free Trial</h3>
              <p className="text-sm text-gray-500 mb-2">14 days</p>
              <ul className="text-sm space-y-1 mb-4">
                <li>1 establishment record analyzed</li>
                <li>Up to 200 reviews analyzed</li>
                <li>Basic features</li>
              </ul>
              <Badge>Default for new users</Badge>
            </div>

            <div className="border rounded-lg p-4 border-green-200 bg-green-50">
              <h3 className="font-semibold mb-2">Standard Plan</h3>
              <p className="text-sm text-gray-500 mb-2">€16/month</p>
              <ul className="text-sm space-y-1 mb-4">
                <li>1 establishment record analyzed</li>
                <li>Up to 2000 reviews analyzed</li>
                <li>All features included</li>
              </ul>
              <Badge className="bg-green-100 text-green-800">Most Popular</Badge>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Custom Plan</h3>
              <p className="text-sm text-gray-500 mb-2">Custom pricing</p>
              <ul className="text-sm space-y-1 mb-4">
                <li>Multiple establishments</li>
                <li>Unlimited reviews</li>
                <li>Advanced features</li>
              </ul>
              <Badge variant="outline">Contact sales</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
