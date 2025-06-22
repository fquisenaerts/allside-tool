"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getUserEstablishments, deleteEstablishment } from "../actions/establishments"
// Removed Header and Footer imports
import { AnalyzePageMenu } from "../components/AnalyzePageMenu" // Import new sidebar component
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, ExternalLink, BarChart, Filter } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { CustomDropdown } from "../components/CustomDropdown"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "../hooks/useTranslation"

export default function MyEstablishmentsClientPage() {
  const { t } = useTranslation()
  const [establishments, setEstablishments] = useState<any[]>([])
  const [filteredEstablishments, setFilteredEstablishments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [selectedFilter, setSelectedFilter] = useState<string>("all")
  const [selectedEstablishments, setSelectedEstablishments] = useState<string[]>([])
  const [showMasterAnalysisDialog, setShowMasterAnalysisDialog] = useState(false)
  const [masterAnalysisError, setMasterAnalysisError] = useState<string | null>(null)
  const sampleDataLoadedRef = useRef(false) // Ref to track if sample data has been loaded

  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession()

      if (data?.session?.user) {
        setUser(data.session.user)
        fetchEstablishments(data.session.user.id)
      } else {
        // Redirect to login if not authenticated
        router.push("/login")
      }
    }

    checkUser()
  }, [router])

  useEffect(() => {
    // Apply filter whenever establishments or selectedFilter changes
    if (selectedFilter === "all") {
      setFilteredEstablishments(establishments)
    } else {
      const filtered = establishments.filter((est) => {
        // Determine the source type based on URL or type field
        const sourceType = getEstablishmentSourceType(est)
        return sourceType === selectedFilter
      })
      setFilteredEstablishments(filtered)
    }
  }, [establishments, selectedFilter])

  // Helper function to determine the source type of an establishment
  const getEstablishmentSourceType = (establishment: any): string => {
    const url = establishment.url?.toLowerCase() || ""
    const type = establishment.type?.toLowerCase() || ""

    if (url.includes("google.com/maps") || type.includes("google")) {
      return "google"
    } else if (url.includes("tripadvisor") || type.includes("tripadvisor")) {
      return "tripadvisor"
    } else if (url.includes("booking.com") || type.includes("booking")) {
      return "booking"
    } else if (url.includes("trustpilot") || type.includes("trustpilot")) {
      return "trustpilot"
    } else if (url.includes(".xls") || type.includes("file") || type.includes("excel")) {
      return "xls"
    } else {
      return "other"
    }
  }

  const fetchEstablishments = async (userId: string) => {
    setLoading(true)
    setError(null)

    try {
      const result = await getUserEstablishments(userId)

      if (result.success) {
        setEstablishments(result.data || [])
        setFilteredEstablishments(result.data || [])
      } else {
        setError(result.error || t("myEstablishments.errors.fetchFailed"))
      }
    } catch (err) {
      console.error("Error fetching establishments:", err)
      setError(t("myEstablishments.errors.unexpected"))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!user) return

    if (!confirm(t("myEstablishments.confirmDelete"))) {
      return
    }

    try {
      const result = await deleteEstablishment(id, user.id)

      if (result.success) {
        // Remove from local state
        const updatedEstablishments = establishments.filter((est) => est.id !== id)
        setEstablishments(updatedEstablishments)

        // Also remove from selected establishments if it was selected
        if (selectedEstablishments.includes(id)) {
          setSelectedEstablishments((prev) => prev.filter((estId) => estId !== id))
        }
      } else {
        setError(result.error || t("myEstablishments.errors.deleteFailed"))
      }
    } catch (err) {
      console.error("Error deleting establishment:", err)
      setError(t("myEstablishments.errors.unexpected"))
    }
  }

  const handleViewAnalysis = (id: string) => {
    router.push(`/establishment/${id}`)
  }

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter)
    // Clear selections when changing filters
    setSelectedEstablishments([])
  }

  const handleSelectEstablishment = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedEstablishments((prev) => [...prev, id])
    } else {
      setSelectedEstablishments((prev) => prev.filter((estId) => estId !== id))
    }
  }

  const handleSelectAll = () => {
    if (selectedEstablishments.length === filteredEstablishments.length) {
      // If all are selected, deselect all
      setSelectedEstablishments([])
    } else {
      // Otherwise, select all filtered establishments
      setSelectedEstablishments(filteredEstablishments.map((est) => est.id))
    }
  }

  const validateMasterAnalysis = () => {
    if (selectedEstablishments.length < 2) {
      return t("myEstablishments.masterAnalysis.errors.minimumSelection")
    }

    // Get the selected establishment objects
    const selected = establishments.filter((est) => selectedEstablishments.includes(est.id))

    // Check if they're all the same type
    const types = selected.map((est) => getEstablishmentSourceType(est))
    const uniqueTypes = [...new Set(types)]

    if (uniqueTypes.length > 1) {
      return t("myEstablishments.masterAnalysis.errors.mixedTypes")
    }

    return null
  }

  const handleMasterAnalysisClick = () => {
    const validationError = validateMasterAnalysis()
    if (validationError) {
      setMasterAnalysisError(validationError)
      return
    }

    setShowMasterAnalysisDialog(true)
  }

  const performMasterAnalysis = () => {
    // Get the selected establishment objects
    const selected = establishments.filter((est) => selectedEstablishments.includes(est.id))

    // Determine the type for the bulk analysis
    const sourceType = getEstablishmentSourceType(selected[0])

    // Extract URLs for the bulk analysis
    const urls = selected.map((est) => est.url)

    // Encode the URLs and type for the query parameters
    const encodedUrls = encodeURIComponent(JSON.stringify(urls))
    const encodedType = encodeURIComponent(
      sourceType === "google"
        ? "Google My Business"
        : sourceType === "tripadvisor"
          ? "TripAdvisor"
          : sourceType === "booking"
            ? "Booking.com"
            : sourceType === "trustpilot"
              ? "Trustpilot"
              : "File",
    )

    // Redirect to the analyze page with the bulk analysis parameters
    router.push(`/analyze?bulk=true&type=${encodedType}&urls=${encodedUrls}`)
  }

  // Get source type badge
  const getSourceTypeBadge = (establishment: any) => {
    const sourceType = getEstablishmentSourceType(establishment)

    switch (sourceType) {
      case "google":
        return <Badge className="bg-blue-500">{t("myEstablishments.sourceTypes.google")}</Badge>
      case "tripadvisor":
        return <Badge className="bg-green-500">{t("myEstablishments.sourceTypes.tripadvisor")}</Badge>
      case "booking":
        return <Badge className="bg-indigo-500">{t("myEstablishments.sourceTypes.booking")}</Badge>
      case "trustpilot":
        return <Badge className="bg-purple-500">{t("myEstablishments.sourceTypes.trustpilot")}</Badge>
      case "xls":
        return <Badge className="bg-amber-500">{t("myEstablishments.sourceTypes.excel")}</Badge>
      default:
        return <Badge className="bg-gray-500">{t("myEstablishments.sourceTypes.other")}</Badge>
    }
  }

  // Filter options for the dropdown, memoized to prevent re-creation on every render
  const filterOptions = useMemo(
    () => [
      { label: t("myEstablishments.filters.all"), value: "all" },
      { label: t("myEstablishments.filters.google"), value: "google" },
      { label: t("myEstablishments.filters.tripadvisor"), value: "tripadvisor" },
      { label: t("myEstablishments.filters.booking"), value: "booking" },
      { label: t("myEstablishments.filters.trustpilot"), value: "trustpilot" },
      { label: t("myEstablishments.filters.excel"), value: "xls" },
    ],
    [t],
  )

  // Add sample data if no establishments are found and not already loaded
  useEffect(() => {
    if (!loading && establishments.length === 0 && !error && !sampleDataLoadedRef.current) {
      // Create sample data for demonstration
      const sampleEstablishments = [
        {
          id: "sample-1",
          name: "Grand Hotel Paris",
          url: "https://www.booking.com/hotel/fr/grand-hotel-paris",
          type: "Booking.com",
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          analysis_results: {
            reviewCount: 245,
            sentiment: {
              positive: 78,
              negative: 22,
              neutral: 0,
            },
          },
        },
        {
          id: "sample-2",
          name: "Café de la Place",
          url: "https://www.google.com/maps/place/cafe+de+la+place",
          type: "Google My Business",
          created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          analysis_results: {
            reviewCount: 132,
            sentiment: {
              positive: 85,
              negative: 15,
              neutral: 0,
            },
          },
        },
        {
          id: "sample-3",
          name: "Seaside Resort",
          url: "https://www.tripadvisor.com/Hotel_Review-Seaside_Resort",
          type: "TripAdvisor",
          created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
          analysis_results: {
            reviewCount: 189,
            sentiment: {
              positive: 72,
              negative: 28,
              neutral: 0,
            },
          },
        },
        {
          id: "sample-4",
          name: "Tech Solutions Inc.",
          url: "https://www.trustpilot.com/review/techsolutions.com",
          type: "Trustpilot",
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          analysis_results: {
            reviewCount: 95,
            sentiment: {
              positive: 90,
              negative: 10,
              neutral: 0,
            },
          },
        },
      ]

      setEstablishments(sampleEstablishments)
      setFilteredEstablishments(sampleEstablishments)
      sampleDataLoadedRef.current = true // Mark sample data as loaded
    }
  }, [loading, establishments.length, error, t])

  return (
    <div className="min-h-screen flex flex-row bg-white text-black">
      {/* Vertical Sidebar for My Establishments Page */}
      <AnalyzePageMenu />

      <main className="flex-grow p-8">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-4 text-center text-black">{t("myEstablishments.title")}</h1>
          <p className="text-xl text-gray-600 mb-8 text-center">{t("myEstablishments.subtitle")}</p>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t("myEstablishments.errors.title")}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
            </div>
          ) : establishments.length === 0 ? (
            <div className="bg-white p-8 rounded-lg text-center">
              <h2 className="text-2xl font-semibold mb-4 text-black">{t("myEstablishments.empty.title")}</h2>
              <p className="text-gray-600 mb-6">{t("myEstablishments.empty.description")}</p>
              <Button
                onClick={() => router.push("/analyze")}
                className="bg-black text-white hover:bg-gray-800 border border-gray-300"
              >
                {t("myEstablishments.empty.analyzeButton")}
              </Button>
            </div>
          ) : (
            <>
              {/* Filter and Actions Bar */}
              <div className="bg-white p-4 rounded-lg mb-6 flex flex-wrap justify-between items-center gap-4 border border-gray-200">
                <div className="flex items-center gap-4">
                  <CustomDropdown
                    options={filterOptions}
                    value={selectedFilter}
                    onChange={handleFilterChange}
                    icon={<Filter className="h-4 w-4 text-black" />}
                  />

                  {filteredEstablishments.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                      className="text-sm text-black border border-gray-300 bg-white hover:bg-gray-50"
                    >
                      {selectedEstablishments.length === filteredEstablishments.length
                        ? t("myEstablishments.buttons.deselectAll")
                        : t("myEstablishments.buttons.selectAll")}
                    </Button>
                  )}
                </div>

                {selectedEstablishments.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-black">
                      {t("myEstablishments.selected", { count: selectedEstablishments.length })}
                    </span>
                    <Button
                      onClick={handleMasterAnalysisClick}
                      className="bg-black text-white hover:bg-gray-800 border border-gray-300"
                      disabled={selectedEstablishments.length < 2}
                    >
                      {t("myEstablishments.buttons.masterAnalysis")}
                    </Button>
                  </div>
                )}
              </div>

              {masterAnalysisError && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{t("myEstablishments.masterAnalysis.errors.title")}</AlertTitle>
                  <AlertDescription>{masterAnalysisError}</AlertDescription>
                </Alert>
              )}

              {filteredEstablishments.length === 0 ? (
                <div className="bg-white p-8 rounded-lg text-center">
                  <h2 className="text-xl font-semibold mb-4 text-black">{t("myEstablishments.noMatches")}</h2>
                  <Button
                    variant="outline"
                    onClick={() => handleFilterChange("all")}
                    className="text-black border border-gray-300 bg-white hover:bg-gray-50"
                  >
                    {t("myEstablishments.buttons.showAll")}
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEstablishments.map((establishment) => (
                    <Card
                      key={establishment.id}
                      className={`overflow-hidden ${
                        selectedEstablishments.includes(establishment.id) ? "ring-2 ring-blue-500" : ""
                      }`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {getSourceTypeBadge(establishment)}
                              <CardDescription className="text-gray-600">{establishment.type}</CardDescription>
                            </div>
                            <CardTitle className="truncate text-black">{establishment.name}</CardTitle>
                          </div>
                          <Checkbox
                            checked={selectedEstablishments.includes(establishment.id)}
                            onCheckedChange={(checked) =>
                              handleSelectEstablishment(establishment.id, checked as boolean)
                            }
                            className="mt-1 border-gray-300 data-[state=checked]:bg-black data-[state=checked]:text-white"
                          />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4">
                          <p className="text-sm text-gray-500 mb-1">{t("myEstablishments.card.url")}:</p>
                          <p className="text-sm truncate text-black">{establishment.url}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">{t("myEstablishments.card.analyzedOn")}:</p>
                          <p className="text-sm text-black">
                            {new Date(establishment.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {establishment.analysis_results && (
                          <div className="mt-3">
                            <p className="text-sm text-gray-500 mb-1">{t("myEstablishments.card.reviews")}:</p>
                            <p className="text-sm font-medium text-black">
                              {t("myEstablishments.card.reviewCount", {
                                count: establishment.analysis_results.reviewCount || 0,
                              })}
                            </p>
                            {establishment.analysis_results.sentiment && (
                              <div className="mt-1 flex items-center gap-2">
                                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-green-500"
                                    style={{ width: `${establishment.analysis_results.sentiment.positive}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs font-medium text-black">
                                  {t("myEstablishments.card.positivePercentage", {
                                    percentage: Math.round(establishment.analysis_results.sentiment.positive),
                                  })}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(establishment.id)}
                          className="text-red-500 hover:text-red-700 border-gray-300"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t("myEstablishments.buttons.delete")}
                        </Button>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(establishment.url, "_blank")}
                            className="text-black border-gray-300"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            {t("myEstablishments.buttons.visit")}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleViewAnalysis(establishment.id)}
                            className="bg-black text-white hover:bg-gray-800 border border-gray-300"
                          >
                            <BarChart className="h-4 w-4 mr-2" />
                            {t("myEstablishments.buttons.viewAnalysis")}
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Master Analysis Confirmation Dialog */}
      <Dialog open={showMasterAnalysisDialog} onOpenChange={setShowMasterAnalysisDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-black">{t("myEstablishments.masterAnalysis.title")}</DialogTitle>
            <DialogDescription className="text-gray-600">
              {t("myEstablishments.masterAnalysis.description", { count: selectedEstablishments.length })}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <h3 className="font-medium mb-2 text-black">{t("myEstablishments.masterAnalysis.selectedTitle")}:</h3>
            <ul className="max-h-40 overflow-y-auto space-y-1">
              {establishments
                .filter((est) => selectedEstablishments.includes(est.id))
                .map((est) => (
                  <li key={est.id} className="text-sm flex items-center gap-2 text-black">
                    {getSourceTypeBadge(est)}
                    <span className="truncate">{est.name}</span>
                  </li>
                ))}
            </ul>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowMasterAnalysisDialog(false)}
              className="text-black border border-gray-300 bg-white hover:bg-gray-50"
            >
              {t("myEstablishments.buttons.cancel")}
            </Button>
            <Button
              onClick={performMasterAnalysis}
              className="bg-black text-white hover:bg-gray-800 border border-gray-300"
            >
              {t("myEstablishments.buttons.proceedWithMasterAnalysis")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
