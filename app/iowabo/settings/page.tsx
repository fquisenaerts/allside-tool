"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Bell, Lock, Settings, User, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { checkBackofficeAuth } from "../actions"

export default function SettingsPage() {
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [admin, setAdmin] = useState<any>(null)

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true)
      try {
        const { authenticated, admin: adminData } = await checkBackofficeAuth()

        if (authenticated && adminData) {
          setAdmin(adminData)
        } else {
          // If no admin data, create sample data
          setAdmin({
            email: "admin@example.com",
            created_at: new Date().toISOString(),
            role: "Administrator"
          })
        }
      } catch (err: any) {
        console.error("Error fetching admin data:", err)
        setError(`Error: ${err.message || "Unknown error"}`)
        
        // Set sample admin data as fallback
        setAdmin({
          email: "admin@example.com",
          created_at: new Date().toISOString(),
          role: "Administrator"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [])

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>

      {saved && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Your settings have been saved successfully.</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex justify-between items-center">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="account">
            <User className="h-4 w-4 mr-2" />
            Account
          </TabsTrigger>
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>View and manage your account details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
                </div>
              ) : admin ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email</Label>
                    <Input id="admin-email" value={admin.email || "N/A"} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-role">Role</Label>
                    <Input id="admin-role" value="Administrator" readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-created">Account Created</Label>
                    <Input
                      id="admin-created"
                      value={admin.created_at ? new Date(admin.created_at).toLocaleString() : "N/A"}
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-name">Name</Label>
                    <Input id="admin-name" defaultValue="Admin User" />
                  </div>
                  <Button onClick={handleSave}>Save Changes</Button>
                </>
              ) : (
                <div className="text-center py-4 text-gray-500">Account information not available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage your backoffice general settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site-name">Site Name</Label>
                <Input id="site-name" defaultValue="Allside Admin" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-email">Support Email</Label>
                <Input id="support-email" type="email" defaultValue="support@allside.com" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="maintenance-mode" />
                <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
              </div>
              <Button onClick={handleSave}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage your notification preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="new-user">New User Registration</Label>
                  <p className="text-sm text-gray-500">Receive notifications when a new user registers</p>
                </div>
                <Switch id="new-user" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="new-subscription">New Subscription</Label>
                  <p className="text-sm text-gray-500">Receive notifications when a user subscribes</p>
                </div>
                <Switch id="new-subscription" defaultChecked />
              </div>
              \
