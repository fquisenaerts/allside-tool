"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getEstablishmentById } from "../../actions/establishments"
import { AnalyzePageMenu } from "../../components/AnalyzePageMenu"
import { ComprehensiveAnalysisDisplay } from "../../components/ComprehensiveAnalysisDisplay"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download } from "lucide-react"
import { generatePDFReport } from "../../utils/pdfGenerator"
import { useTranslation } from "../../hooks/useTranslation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function EstablishmentDetailPageClient({ id }: { id: string }) {
  const { t } = useTranslation()
  const router = useRouter()
  const [establishment, setEstablishment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEstablishment = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        if (sessionError || !sessionData.session) {
          router.push("/login")
          return
        }

        let result
        result = await getEstablishmentById(id, sessionData.session.user.id)
        if (result.success) {
          setEstablishment(result.data)
        } else {
          setError(result.error || t("establishment.errors.fetchFailed"))
        }
      } catch (err) {
        console.error("Error fetching establishment:", err)
        setError(t("establishment.errors.unexpected"))
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchEstablishment()
    }
  }, [id, router, t])

  const handleDownloadPDF = () => {
    if (!establishment || !establishment.analysis_results) return
    generatePDFReport(establishment.analysis_results)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-row bg-white text-black">
        <AnalyzePageMenu />
        <main className="flex-grow p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-row bg-white text-black">
        <AnalyzePageMenu />
        <main className="flex-grow p-8">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t("establishment.errors.title")}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={() => router.back()} className="bg-black text-white hover:bg-gray-800">
            {t("establishment.buttons.goBack")}
          </Button>
        </main>
      </div>
    )
  }

  if (!establishment) {
    return (
      <div className="min-h-screen flex flex-row bg-white text-black">
        <AnalyzePageMenu />
        <main className="flex-grow p-8">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t("establishment.errors.notFoundTitle")}</AlertTitle>
            <AlertDescription>{t("establishment.errors.notFoundDescription")}</AlertDescription>
          </Alert>
          <Button onClick={() => router.back()} className="bg-black text-white hover:bg-gray-800">
            {t("establishment.buttons.goBack")}
          </Button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-row bg-white text-black">
      <AnalyzePageMenu />
      <main className="flex-grow p-8">
        <div className="w-full mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-black">{establishment.name}</h1>
              <p className="text-xl text-gray-600">
                {t("establishment.analysisFor")} {establishment.type}
              </p>
            </div>
            <div className="flex gap-4">
              <Button onClick={() => router.back()} variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                {t("establishment.buttons.backToMyEstablishments")}
              </Button>
              <Button onClick={handleDownloadPDF} className="gap-2 bg-black text-white hover:bg-gray-800">
                <Download className="h-4 w-4" />
                {t("establishment.buttons.downloadPDF")}
              </Button>
            </div>
          </div>

          {establishment.analysis_results ? (
            <ComprehensiveAnalysisDisplay
              analysisResults={establishment.analysis_results}
              onDownloadPDF={handleDownloadPDF}
              showAllSections={true}
            />
          ) : (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t("establishment.noAnalysisTitle")}</AlertTitle>
              <AlertDescription>{t("establishment.noAnalysisDescription")}</AlertDescription>
            </Alert>
          )}
        </div>
      </main>
    </div>
  )
}
