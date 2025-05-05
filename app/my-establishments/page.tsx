"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getUserEstablishments, deleteEstablishment } from "../actions/establishments"
import { Header } from "../components/Header"
import { Footer } from "../components/Footer"
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

export default function MyEstablishmentsPage() {
  const [establishments, setEstablishments] = useState<any[]>([])
  const [filteredEstablishments, setFilteredEstablishments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [selectedFilter, setSelectedFilter] = useState<string>("all")
  const [selectedEstablishments, setSelectedEstablishments] = useState<string[]>([])
  const [showMasterAnalysisDialog, setShowMasterAnalysisDialog] = useState(false)
  const [masterAnalysisError, setMasterAnalysisError] = useState<string | null>(null)
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const filterDropdownRef = useRef<HTMLDivElement>(null)

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
        setError(result.error || "Failed to fetch establishments")
      }
    } catch (err) {
      console.error("Error fetching establishments:", err)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!user) return

    if (!confirm("Are you sure you want to delete this establishment?")) {
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
        setError(result.error || "Failed to delete establishment")
      }
    } catch (err) {
      console.error("Error deleting establishment:", err)
      setError("An unexpected error occurred")
    }
  }

  const handleViewAnalysis = (id: string) => {
    router.push(`/establishment/${id}`)
  }

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter)
    // Clear selections when changing filters
    setSelectedEstablishments([])
    setShowFilterDropdown(false)
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
      return "Please select at least two establishments for a Master Analysis"
    }

    // Get the selected establishment objects
    const selected = establishments.filter((est) => selectedEstablishments.includes(est.id))

    // Check if they're all the same type
    const types = selected.map((est) => getEstablishmentSourceType(est))
    const uniqueTypes = [...new Set(types)]

    if (uniqueTypes.length > 1) {
      return "Master Analysis can only be performed on establishments of the same type"
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
        return <Badge className="bg-blue-500">Google</Badge>
      case "tripadvisor":
        return <Badge className="bg-green-500">TripAdvisor</Badge>
      case "booking":
        return <Badge className="bg-indigo-500">Booking.com</Badge>
      case "xls":
        return <Badge className="bg-amber-500">Excel</Badge>
      default:
        return <Badge className="bg-gray-500">Other</Badge>
    }
  }

  // Filter options for the dropdown
  const filterOptions = [
    { label: "All Sources", value: "all" },
    { label: "Google", value: "google" },
    { label: "TripAdvisor", value: "tripadvisor" },
    { label: "Booking.com", value: "booking" },
    { label: "Excel Files", value: "xls" },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[#050314]">
      <Header />

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-4 text-center text-white">My Establishments</h1>
          <p className="text-xl text-gray-400 mb-8 text-center">View and manage your saved establishment analyses</p>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : establishments.length === 0 ? (
            <div className="bg-white p-8 rounded-lg text-center">
              <h2 className="text-2xl font-semibold mb-4">No establishments saved yet</h2>
              <p className="text-gray-600 mb-6">
                Analyze an establishment and click "Add to My Establishments" to save it here.
              </p>
              <Button
                onClick={() => router.push("/analyze")}
                className="bg-white text-black hover:bg-white/90 border border-gray-300"
              >
                Analyze an Establishment
              </Button>
            </div>
          ) : (
            <>
              {/* Filter and Actions Bar */}
              <div className="bg-white p-4 rounded-lg mb-6 flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <CustomDropdown
                    options={filterOptions}
                    value={selectedFilter}
                    onChange={handleFilterChange}
                    icon={<Filter className="h-4 w-4" />}
                  />

                  {filteredEstablishments.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                      className="text-sm text-black border border-gray-300 bg-white hover:bg-gray-50"
                    >
                      {selectedEstablishments.length === filteredEstablishments.length ? "Deselect All" : "Select All"}
                    </Button>
                  )}
                </div>

                {selectedEstablishments.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-black">{selectedEstablishments.length} selected</span>
                    <Button
                      onClick={handleMasterAnalysisClick}
                      className="bg-white text-black hover:bg-white/90 border border-gray-300"
                      disabled={selectedEstablishments.length < 2}
                    >
                      Perform Master Analysis
                    </Button>
                  </div>
                )}
              </div>

              {masterAnalysisError && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Cannot Perform Master Analysis</AlertTitle>
                  <AlertDescription>{masterAnalysisError}</AlertDescription>
                </Alert>
              )}

              {filteredEstablishments.length === 0 ? (
                <div className="bg-white p-8 rounded-lg text-center">
                  <h2 className="text-xl font-semibold mb-4">No establishments match the selected filter</h2>
                  <Button
                    variant="outline"
                    onClick={() => handleFilterChange("all")}
                    className="text-black border border-gray-300 bg-white hover:bg-gray-50"
                  >
                    Show All Establishments
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
                              <CardDescription>{establishment.type}</CardDescription>
                            </div>
                            <CardTitle className="truncate">{establishment.name}</CardTitle>
                          </div>
                          <Checkbox
                            checked={selectedEstablishments.includes(establishment.id)}
                            onCheckedChange={(checked) =>
                              handleSelectEstablishment(establishment.id, checked as boolean)
                            }
                            className="mt-1"
                          />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4">
                          <p className="text-sm text-gray-500 mb-1">URL:</p>
                          <p className="text-sm truncate">{establishment.url}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Analyzed on:</p>
                          <p className="text-sm">{new Date(establishment.created_at).toLocaleDateString()}</p>
                        </div>
                        {establishment.analysis_results && (
                          <div className="mt-3">
                            <p className="text-sm text-gray-500 mb-1">Reviews:</p>
                            <p className="text-sm font-medium">
                              {establishment.analysis_results.reviewCount || 0} reviews
                            </p>
                            {establishment.analysis_results.sentiment && (
                              <div className="mt-1 flex items-center gap-2">
                                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-green-500"
                                    style={{ width: `${establishment.analysis_results.sentiment.positive}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs font-medium">
                                  {Math.round(establishment.analysis_results.sentiment.positive)}% positive
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
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => window.open(establishment.url, "_blank")}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Visit
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleViewAnalysis(establishment.id)}
                            className="bg-white text-black hover:bg-white/90 border border-gray-300"
                          >
                            <BarChart className="h-4 w-4 mr-2" />
                            View Analysis
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

      <Footer />

      {/* Master Analysis Confirmation Dialog */}
      <Dialog open={showMasterAnalysisDialog} onOpenChange={setShowMasterAnalysisDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Perform Master Analysis</DialogTitle>
            <DialogDescription>
              You are about to perform a Master Analysis on {selectedEstablishments.length} establishments. This will
              combine all reviews from these establishments into a single analysis.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <h3 className="font-medium mb-2">Selected establishments:</h3>
            <ul className="max-h-40 overflow-y-auto space-y-1">
              {establishments
                .filter((est) => selectedEstablishments.includes(est.id))
                .map((est) => (
                  <li key={est.id} className="text-sm flex items-center gap-2">
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
              Cancel
            </Button>
            <Button
              onClick={performMasterAnalysis}
              className="bg-white text-black hover:bg-white/90 border border-gray-300"
            >
              Proceed with Master Analysis
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
