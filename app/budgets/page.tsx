"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PieChart, Plus, AlertTriangle, CheckCircle, TrendingUp, Edit, Trash2 } from "lucide-react"
import Navbar from "@/components/navbar"
import { formatCurrency } from "@/lib/utils"

interface Budget {
  id: string
  category: string
  monthlyLimit: number
  currentSpending: number
}

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

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const router = useRouter()

  const [newBudget, setNewBudget] = useState({
    category: "",
    monthlyLimit: "",
  })

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/")
      return
    }

    fetchBudgets()
  }, [router])

  const fetchBudgets = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("http://localhost:8080/api/users/budgets", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Fetched budgets:", data) // Debug log
        setBudgets(data)
      } else {
        console.error("Failed to fetch budgets:", response.status)
        setError("Failed to load budgets")
      }
    } catch (err) {
      console.error("Error fetching budgets:", err)
      setError("Failed to load budgets")
    } finally {
      setLoading(false)
    }
  }

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget)
    setNewBudget({
      category: budget.category,
      monthlyLimit: budget.monthlyLimit.toString(),
    })
    setShowAddForm(true)
  }

  const handleUpdateBudget = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBudget) return

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`http://localhost:8080/api/users/budgets/${editingBudget.category}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          monthlyLimit: Number.parseFloat(newBudget.monthlyLimit),
        }),
      })

      if (response.ok) {
        setSuccess("Budget updated successfully!")
        setNewBudget({ category: "", monthlyLimit: "" })
        setEditingBudget(null)
        setShowAddForm(false)
        await fetchBudgets()
      } else {
        const errorData = await response.text()
        setError(errorData || "Failed to update budget")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("http://localhost:8080/api/users/budgets/save", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: newBudget.category,
          monthlyLimit: Number.parseFloat(newBudget.monthlyLimit),
        }),
      })

      if (response.ok) {
        setSuccess("Budget created successfully!")
        setNewBudget({ category: "", monthlyLimit: "" })
        setShowAddForm(false)
        await fetchBudgets()
      } else {
        const errorData = await response.text()
        setError(errorData || "Failed to create budget")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBudget = async (category: string) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`http://localhost:8080/api/users/budgets/${category}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setSuccess("Budget deleted successfully!")
        await fetchBudgets()
      } else {
        setError("Failed to delete budget")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    }
  }

  const getBudgetStatus = (budget: Budget) => {
    const percentage = (budget.currentSpending / budget.monthlyLimit) * 100
    if (percentage >= 100) return { status: "exceeded", color: "red", icon: AlertTriangle }
    if (percentage >= 80) return { status: "warning", color: "yellow", icon: AlertTriangle }
    return { status: "good", color: "green", icon: CheckCircle }
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
            <h1 className="text-3xl font-bold text-gray-900">Budget Management</h1>
            <p className="text-gray-600">Set and track your spending limits</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={fetchBudgets}
              variant="outline"
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Budget
            </Button>
          </div>
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

        {/* Add/Edit Budget Form */}
        {showAddForm && (
          <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>{editingBudget ? "Edit Budget" : "Create New Budget"}</CardTitle>
              <CardDescription>
                {editingBudget ? "Update your budget limit" : "Set a monthly spending limit for a category"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={editingBudget ? handleUpdateBudget : handleAddBudget} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newBudget.category}
                      onValueChange={(value) => setNewBudget({ ...newBudget, category: value })}
                      disabled={!!editingBudget}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {expenseCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category.charAt(0) + category.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthlyLimit">Monthly Limit</Label>
                    <Input
                      id="monthlyLimit"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newBudget.monthlyLimit}
                      onChange={(e) => setNewBudget({ ...newBudget, monthlyLimit: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? (editingBudget ? "Updating..." : "Creating...") : (editingBudget ? "Update Budget" : "Create Budget")}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowAddForm(false)
                      setEditingBudget(null)
                      setNewBudget({ category: "", monthlyLimit: "" })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Budget Overview */}
        {budgets.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="py-12">
              <div className="text-center">
                <PieChart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No budgets created yet</h3>
                <p className="text-gray-500 mb-4">Start by creating your first budget to track your spending limits.</p>
                <Button
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Budget
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map((budget) => {
              const percentage = (budget.currentSpending / budget.monthlyLimit) * 100
              const { status, color, icon: StatusIcon } = getBudgetStatus(budget)

              return (
                <Card
                  key={budget.id}
                  className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {budget.category.charAt(0) + budget.category.slice(1).toLowerCase()}
                      </CardTitle>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleEditBudget(budget)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Spent this month</span>
                        <span className="text-sm font-medium">
                          {formatCurrency(budget.currentSpending)} / {formatCurrency(budget.monthlyLimit)}
                        </span>
                      </div>
                      <Progress
                        value={Math.min(percentage, 100)}
                        className={`h-3 ${
                          status === "exceeded"
                            ? "[&>div]:bg-red-500"
                            : status === "warning"
                              ? "[&>div]:bg-yellow-500"
                              : "[&>div]:bg-green-500"
                        }`}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge
                        variant={status === "exceeded" ? "destructive" : status === "warning" ? "secondary" : "default"}
                        className="flex items-center gap-1"
                      >
                        <StatusIcon className="w-3 h-3" />
                        {percentage.toFixed(0)}% used
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {formatCurrency(budget.monthlyLimit - budget.currentSpending)} remaining
                      </span>
                    </div>

                    {status === "exceeded" && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700 font-medium">Budget Exceeded!</p>
                        <p className="text-xs text-red-600">
                          You've spent {formatCurrency(budget.currentSpending - budget.monthlyLimit)} over your limit.
                        </p>
                      </div>
                    )}

                    {status === "warning" && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-700 font-medium">Approaching Limit</p>
                        <p className="text-xs text-yellow-600">You're close to reaching your budget limit.</p>
                      </div>
                    )}

                    {status === "good" && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-700 font-medium">On Track</p>
                        <p className="text-xs text-green-600">You're staying within your budget limits.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Budget Summary */}
        {budgets.length > 0 && (
          <Card className="mt-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Budget Summary
              </CardTitle>
              <CardDescription>Overview of all your budgets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(budgets.reduce((sum, budget) => sum + budget.monthlyLimit, 0))}
                  </div>
                  <div className="text-sm text-gray-600">Total Budget</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(budgets.reduce((sum, budget) => sum + budget.currentSpending, 0))}
                  </div>
                  <div className="text-sm text-gray-600">Total Spent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(
                      budgets.reduce((sum, budget) => sum + (budget.monthlyLimit - budget.currentSpending), 0),
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Total Remaining</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
