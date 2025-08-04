"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BarChart3, TrendingUp, TrendingDown, PieChart, Calendar, Download, RefreshCw, DollarSign } from "lucide-react"
import Navbar from "@/components/navbar"
import { formatCurrency } from "@/lib/utils"

interface Report {
  id: string
  type: string
  generatedAt: string
  data: {
    [key: string]: any
  }
}

const reportTypes = [
  { value: "spending_trend", label: "Spending Trends" },
  { value: "income_vs_expenses", label: "Income vs Expenses" },
]

const expenseCategories = [
  "FOOD",
  "TRANSPORTATION",
  "ENTERTAINMENT",
  "UTILITIES",
  "RENT",
  "SHOPPING",
  "HEALTH",
  "GROCERIES",
  "OTHER",
]

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [generatingReport, setGeneratingReport] = useState(false)
  const router = useRouter()

  const [reportForm, setReportForm] = useState({
    type: "spending_trend",
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    categories: [] as string[],
    tags: [] as string[],
  })

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/")
      return
    }

    fetchReports()
  }, [router])

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("http://localhost:8080/api/users/reports", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setReports(data)
      }
    } catch (err) {
      setError("Failed to load reports")
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneratingReport(true)
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const endpoint =
        reportForm.type === "spending_trend"
          ? "http://localhost:8080/api/users/reports/spending-trends"
          : "http://localhost:8080/api/users/reports/income-vs-expenses"

      const params = new URLSearchParams({
        startDate: reportForm.startDate,
        endDate: reportForm.endDate,
        ...(reportForm.categories.length > 0 && { categories: reportForm.categories.join(",") }),
        ...(reportForm.tags.length > 0 && { tags: reportForm.tags.join(",") }),
      })

      const response = await fetch(`${endpoint}?${params}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        setSuccess("Report generated successfully!")
        fetchReports()
      } else {
        const errorData = await response.text()
        setError(errorData || "Failed to generate report")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setGeneratingReport(false)
    }
  }

  const formatReportData = (report: Report) => {
    if (report.type === "spending_trend") {
      const spendingByCategory = report.data.spendingByCategory || {}
      return Object.entries(spendingByCategory).map(([category, amount]) => ({
        category: category.charAt(0) + category.slice(1).toLowerCase(),
        amount: amount as number,
      }))
    } else if (report.type === "income_vs_expenses") {
      return {
        totalIncome: report.data.totalIncome || 0,
        totalExpenses: report.data.totalExpenses || 0,
        netSavings: report.data.netSavings || 0,
      }
    }
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
            <p className="text-gray-600">Generate and view detailed financial reports</p>
          </div>
          <Button onClick={fetchReports} variant="outline" className="flex items-center gap-2 bg-transparent">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Report Generation Form */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Generate Report
                </CardTitle>
                <CardDescription>Create a new financial report</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerateReport} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reportType">Report Type</Label>
                    <Select
                      value={reportForm.type}
                      onValueChange={(value) => setReportForm({ ...reportForm, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {reportTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={reportForm.startDate}
                        onChange={(e) => setReportForm({ ...reportForm, startDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={reportForm.endDate}
                        onChange={(e) => setReportForm({ ...reportForm, endDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {reportForm.type === "spending_trend" && (
                    <div className="space-y-2">
                      <Label>Categories (Optional)</Label>
                      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                        {expenseCategories.map((category) => (
                          <label key={category} className="flex items-center space-x-2 text-sm">
                            <input
                              type="checkbox"
                              checked={reportForm.categories.includes(category)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setReportForm({
                                    ...reportForm,
                                    categories: [...reportForm.categories, category],
                                  })
                                } else {
                                  setReportForm({
                                    ...reportForm,
                                    categories: reportForm.categories.filter((c) => c !== category),
                                  })
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                            <span>{category.charAt(0) + category.slice(1).toLowerCase()}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={generatingReport}
                  >
                    {generatingReport ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Generate Report
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Reports List */}
          <div className="lg:col-span-2 space-y-6">
            {reports.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="py-12">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No reports generated yet</h3>
                    <p className="text-gray-500 mb-4">
                      Generate your first report to get insights into your financial data.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {reports.map((report) => {
                  const reportData = formatReportData(report)
                  const reportTypeLabel = reportTypes.find((t) => t.value === report.type)?.label || report.type

                  return (
                    <Card key={report.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {report.type === "spending_trend" ? (
                                <PieChart className="w-5 h-5 text-purple-600" />
                              ) : (
                                <TrendingUp className="w-5 h-5 text-green-600" />
                              )}
                              {reportTypeLabel}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <Calendar className="w-4 h-4" />
                              Generated on {new Date(report.generatedAt).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {report.type === "spending_trend" && Array.isArray(reportData) ? (
                          <div className="space-y-4">
                            <h4 className="font-semibold text-gray-900">Spending by Category</h4>
                            {reportData.length === 0 ? (
                              <p className="text-gray-500 text-sm">No spending data found for the selected period.</p>
                            ) : (
                              <div className="space-y-3">
                                {reportData.map((item, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                                      <span className="font-medium">{item.category}</span>
                                    </div>
                                    <Badge variant="secondary">{formatCurrency(item.amount)}</Badge>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : report.type === "income_vs_expenses" && reportData && typeof reportData === "object" ? (
                          <div className="space-y-4">
                            <h4 className="font-semibold text-gray-900">Financial Summary</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                  <TrendingUp className="w-5 h-5 text-green-600" />
                                  <span className="text-sm font-medium text-green-700">Total Income</span>
                                </div>
                                <div className="text-2xl font-bold text-green-600">
                                  {formatCurrency(reportData.totalIncome)}
                                </div>
                              </div>
                              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                  <TrendingDown className="w-5 h-5 text-red-600" />
                                  <span className="text-sm font-medium text-red-700">Total Expenses</span>
                                </div>
                                <div className="text-2xl font-bold text-red-600">
                                  {formatCurrency(reportData.totalExpenses)}
                                </div>
                              </div>
                              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                  <DollarSign className="w-5 h-5 text-blue-600" />
                                  <span className="text-sm font-medium text-blue-700">Net Savings</span>
                                </div>
                                <div
                                  className={`text-2xl font-bold ${
                                    reportData.netSavings >= 0 ? "text-blue-600" : "text-red-600"
                                  }`}
                                >
                                  {formatCurrency(reportData.netSavings)}
                                </div>
                              </div>
                            </div>
                            {reportData.netSavings < 0 && (
                              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-700 font-medium">⚠️ Spending Alert</p>
                                <p className="text-xs text-red-600">
                                  Your expenses exceeded your income by{" "}
                                  {formatCurrency(Math.abs(reportData.netSavings))} during this period.
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500">No data available for this report.</p>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
