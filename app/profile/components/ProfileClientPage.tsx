"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { logout } from "../../actions/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CalendarIcon, CheckCircle, CreditCard, Edit, Save, User } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Header } from "../../components/Header"
import { Footer } from "../../components/Footer"
import { useTranslation } from "@/app/hooks/useTranslation"
import { getLocalizedUrl } from "@/lib/urlMapping"
import { useLanguage } from "@/app/contexts/LanguageContext"

export default function ProfileClientPage() {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    phone: "",
  })
  const [subscription, setSubscription] = useState<any>(null)
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

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
          router.push(getLocalizedUrl("/login", language))
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

        const userInfo = {
          ...data.session.user,
          profile: userData || {},
        }

        setUser(userInfo)
        setFormData({
          name: userInfo.profile?.name || userInfo.user_metadata?.name || "",
          company: userInfo.profile?.company || userInfo.user_metadata?.company || "",
          phone: userInfo.profile?.phone || userInfo.user_metadata?.phone || "",
        })

        // Fetch subscription data
        fetchSubscription(data.session.user.id)
      } catch (err: any) {
        setError(err.message || t("profile.errorLoading"))
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [router, language, t])

  const fetchSubscription = async (userId: string) => {
    setIsLoadingSubscription(true)
    try {
      // Get user's subscription
      const { data: subscriptionData, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (!error && subscriptionData) {
        setSubscription(subscriptionData)
      }
    } catch (error) {
      console.error("Error fetching subscription:", error)
    } finally {
      setIsLoadingSubscription(false)
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSaveProfile = async () => {
    try {
      setError(null)
      setSuccess(null)

      if (!user) return

      // Update the user profile in the database
      const { error } = await supabase
        .from("users")
        .update({
          name: formData.name,
          company: formData.company,
          phone: formData.phone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error

      // Update local user state
      setUser({
        ...user,
        profile: {
          ...user.profile,
          ...formData,
        },
      })

      setSuccess(t("profile.profileUpdated"))
      setEditing(false)
    } catch (err: any) {
      setError(err.message || t("profile.errorUpdatingProfile"))
    }
  }

  const handleCancelSubscription = async () => {
    if (!user || !subscription) return

    setIsCanceling(true)
    try {
      const response = await fetch("/api/cancel-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscriptionId: subscription.id,
          userId: user.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t("subscription.cancelError"))
      }

      // Update local subscription state
      setSubscription({
        ...subscription,
        cancel_at_period_end: true,
      })

      toast({
        title: t("subscription.cancelSuccessTitle"),
        description: t("subscription.cancelSuccessDescription"),
        duration: 5000,
      })
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: err.message || t("subscription.cancelError"),
        duration: 5000,
      })
    } finally {
      setIsCanceling(false)
      setCancelDialogOpen(false)
    }
  }

  const getSubscriptionBadge = () => {
    if (isLoadingSubscription) return t("common.loading")

    if (!subscription) {
      return t("profile.freeTrial")
    }

    if (subscription.status === "trialing") {
      const trialEnd = new Date(subscription.trial_end)
      const daysLeft = Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      return t("profile.trialDaysLeft", { days: daysLeft > 0 ? daysLeft : 0 })
    }

    if (subscription.status === "active") {
      if (subscription.cancel_at_period_end) {
        return t("profile.canceling")
      }
      return subscription.plan_id === "standard" ? t("profile.standardPlan") : t("profile.customPlan")
    }

    return t("profile.inactive")
  }

  const getSubscriptionColor = () => {
    if (!subscription) return "bg-gray-500"

    if (subscription.status === "trialing") return "bg-blue-500"
    if (subscription.status === "active") {
      if (subscription.cancel_at_period_end) return "bg-orange-500"
      return "bg-green-500"
    }

    return "bg-gray-500"
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString(language === "fr" ? "fr-FR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-[#050314]">
          <p className="text-white">{t("profile.loading")}</p>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="bg-[#050314] text-white min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-white mb-8">{t("profile.title")}</h1>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>{t("common.error")}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 border-green-500 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertTitle>{t("common.success")}</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="bg-gray-800">
              <TabsTrigger value="profile" className="data-[state=active]:bg-gray-700">
                <User className="mr-2 h-4 w-4" />
                {t("profile.profileTab")}
              </TabsTrigger>
              <TabsTrigger value="subscription" className="data-[state=active]:bg-gray-700">
                <CreditCard className="mr-2 h-4 w-4" />
                {t("profile.subscriptionTab")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card className="bg-gray-900 border-gray-800 text-white">
                <CardHeader className="flex flex-row items-center justify-between border-b border-gray-800">
                  <div>
                    <CardTitle className="text-white">{t("profile.personalInfo")}</CardTitle>
                    <CardDescription className="text-gray-400">{t("profile.managePersonalDetails")}</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setEditing(!editing)}
                    className="border-gray-700 text-white hover:bg-gray-800 hover:text-white"
                  >
                    {editing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                  </Button>
                </CardHeader>
                <CardContent className="pt-6">
                  {user && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-gray-300">
                            {t("profile.email")}
                          </Label>
                          <Input
                            id="email"
                            value={user.email}
                            disabled
                            className="bg-gray-800 border-gray-700 text-white"
                          />
                          <p className="text-xs text-gray-500">{t("profile.emailCannotBeChanged")}</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-gray-300">
                            {t("profile.fullName")}
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            disabled={!editing}
                            className={
                              !editing
                                ? "bg-gray-800 border-gray-700 text-white"
                                : "bg-gray-800 border-gray-600 text-white"
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="company" className="text-gray-300">
                            {t("profile.company")}
                          </Label>
                          <Input
                            id="company"
                            name="company"
                            value={formData.company}
                            onChange={handleInputChange}
                            disabled={!editing}
                            className={
                              !editing
                                ? "bg-gray-800 border-gray-700 text-white"
                                : "bg-gray-800 border-gray-600 text-white"
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-gray-300">
                            {t("profile.phoneNumber")}
                          </Label>
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            disabled={!editing}
                            className={
                              !editing
                                ? "bg-gray-800 border-gray-700 text-white"
                                : "bg-gray-800 border-gray-600 text-white"
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-300">{t("profile.accountId")}</Label>
                        <div className="p-2 bg-gray-800 border border-gray-700 rounded text-xs font-mono text-gray-300">
                          {user.id}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-300">{t("profile.lastSignIn")}</Label>
                        <div className="flex items-center text-gray-300">
                          <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                          <span>
                            {new Date(user.last_sign_in_at).toLocaleString(language === "fr" ? "fr-FR" : "en-US")}
                          </span>
                        </div>
                      </div>

                      {editing && (
                        <Button
                          onClick={handleSaveProfile}
                          className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          {t("profile.saveChanges")}
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subscription">
              <Card className="bg-gray-900 border-gray-800 text-white">
                <CardHeader className="border-b border-gray-800">
                  <CardTitle className="text-white">{t("subscription.title")}</CardTitle>
                  <CardDescription className="text-gray-400">{t("subscription.manageBilling")}</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {isLoadingSubscription ? (
                    <div className="text-center py-6 text-gray-300">{t("subscription.loading")}</div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-800 border border-gray-700 rounded-lg">
                        <div>
                          <h3 className="font-medium text-white">{t("subscription.currentPlan")}</h3>
                          <div className="flex items-center mt-1">
                            <Badge className={getSubscriptionColor()}>{getSubscriptionBadge()}</Badge>
                          </div>
                        </div>
                        {(!subscription || subscription.status !== "active") && (
                          <Button
                            onClick={() => (window.location.href = "https://buy.stripe.com/8wM5kpgmA7na9eU4gg")}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            {t("subscription.upgradeButton")}
                          </Button>
                        )}
                      </div>

                      {subscription && (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h3 className="text-sm font-medium text-gray-400">{t("subscription.subscriptionId")}</h3>
                              <p className="mt-1 font-mono text-xs text-gray-300">{subscription.id}</p>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-gray-400">{t("subscription.status")}</h3>
                              <p className="mt-1 capitalize text-gray-300">{subscription.status}</p>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-gray-400">{t("subscription.startDate")}</h3>
                              <p className="mt-1 text-gray-300">{formatDate(subscription.created_at)}</p>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-gray-400">{t("subscription.nextBillingDate")}</h3>
                              <p className="mt-1 text-gray-300">{formatDate(subscription.current_period_end)}</p>
                            </div>
                          </div>

                          {subscription.status === "active" && (
                            <div className="mt-6 p-4 border border-gray-700 rounded-lg">
                              <h3 className="font-medium mb-2 text-white">{t("subscription.manageSubscription")}</h3>
                              <p className="text-sm text-gray-400 mb-4">
                                {t("subscription.manageSubscriptionDescription")}
                              </p>
                              <div className="flex flex-col sm:flex-row gap-3">
                                <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800">
                                  {t("subscription.manageBillingButton")}
                                </Button>

                                {!subscription.cancel_at_period_end && (
                                  <Button
                                    variant="destructive"
                                    onClick={() => setCancelDialogOpen(true)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    {t("subscription.cancelSubscription")}
                                  </Button>
                                )}

                                {subscription.cancel_at_period_end && (
                                  <div className="flex items-center text-orange-400 border border-orange-900 bg-orange-950 p-2 rounded">
                                    <AlertCircle className="h-4 w-4 mr-2" />
                                    <span className="text-sm">
                                      {t("subscription.willEndOn", {
                                        date: formatDate(subscription.current_period_end),
                                      })}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {!subscription && (
                        <div className="mt-6 p-4 border border-gray-700 rounded-lg">
                          <h3 className="font-medium mb-2 text-white">{t("subscription.upgradeToStandardPlan")}</h3>
                          <p className="text-sm text-gray-400 mb-4">
                            {t("subscription.upgradeToStandardPlanDescription")}
                          </p>
                          <Button
                            onClick={() => (window.location.href = "https://buy.stripe.com/8wM5kpgmA7na9eU4gg")}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            {t("subscription.upgradeNow")}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-8 flex justify-end">
            <Button variant="destructive" onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
              {t("header.signOut")}
            </Button>
          </div>

          {/* Cancellation Confirmation Dialog */}
          <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
            <DialogContent className="bg-gray-900 text-white border-gray-800">
              <DialogHeader>
                <DialogTitle className="text-white">{t("subscription.cancelSubscription")}</DialogTitle>
                <DialogDescription className="text-gray-400">{t("subscription.cancelConfirmation")}</DialogDescription>
              </DialogHeader>
              <div className="flex items-center p-3 bg-amber-950 border border-amber-900 rounded-md">
                <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                <p className="text-sm text-amber-400">
                  {t("subscription.willRemainActive", { date: formatDate(subscription?.current_period_end) })}
                </p>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCancelDialogOpen(false)}
                  disabled={isCanceling}
                  className="border-gray-700 text-white hover:bg-gray-800"
                >
                  {t("subscription.keepSubscription")}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCancelSubscription}
                  disabled={isCanceling}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isCanceling ? t("subscription.canceling") : t("subscription.confirmCancellation")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Footer />
    </>
  )
}
