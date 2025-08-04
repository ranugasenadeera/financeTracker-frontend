"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Target, Plus, Calendar, DollarSign, TrendingUp, CheckCircle, Clock, Edit, Trash2 } from "lucide-react"
import Navbar from "@/components/navbar"
import { formatCurrency } from "@/lib/utils"

interface Goal {
  id: string
  name: string
  description: string
  targetAmount: number
  savedAmount: number
  targetDate: string
  createdAt: string
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [showAllocateForm, setShowAllocateForm] = useState<string | null>(null)
  const router = useRouter()

  const [newGoal, setNewGoal] = useState({
    name: "",
    description: "",
    targetAmount: "",
    targetDate: "",
  })

  const [allocation, setAllocation] = useState({
    amount: "",
  })

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/")
      return
    }

    fetchGoals()
  }, [router])

  const fetchGoals = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("http://localhost:8080/api/users/goals", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setGoals(data)
      }
    } catch (err) {
      setError("Failed to load goals")
    } finally {
      setLoading(false)
    }
  }

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal)
    setNewGoal({
      name: goal.name,
      description: goal.description,
      targetAmount: goal.targetAmount.toString(),
      targetDate: new Date(goal.targetDate).toISOString().split("T")[0],
    })
    setShowAddForm(true)
  }

  const handleUpdateGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingGoal) return

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`http://localhost:8080/api/users/goals/${editingGoal.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newGoal.name,
          description: newGoal.description,
          targetAmount: Number.parseFloat(newGoal.targetAmount),
          targetDate: newGoal.targetDate,
        }),
      })

      if (response.ok) {
        setSuccess("Goal updated successfully!")
        setNewGoal({ name: "", description: "", targetAmount: "", targetDate: "" })
        setEditingGoal(null)
        setShowAddForm(false)
        await fetchGoals()
      } else {
        const errorData = await response.text()
        setError(errorData || "Failed to update goal")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteGoal = async (goalId: string) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`http://localhost:8080/api/users/goals/${goalId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setSuccess("Goal deleted successfully!")
        await fetchGoals()
      } else {
        setError("Failed to delete goal")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    }
  }

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingGoal) {
      await handleUpdateGoal(e)
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("http://localhost:8080/api/users/goals", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newGoal.name,
          description: newGoal.description,
          targetAmount: Number.parseFloat(newGoal.targetAmount),
          targetDate: newGoal.targetDate,
        }),
      })

      if (response.ok) {
        setSuccess("Goal added successfully!")
        setNewGoal({ name: "", description: "", targetAmount: "", targetDate: "" })
        setShowAddForm(false)
        await fetchGoals()
      } else {
        const errorData = await response.text()
        setError(errorData || "Failed to add goal")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleAllocateSavings = async (goalId: string) => {
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("http://localhost:8080/api/users/goals/allocate", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          goalId: goalId,
          amount: Number.parseFloat(allocation.amount),
        }),
      })

      if (response.ok) {
        setSuccess("Savings allocated successfully!")
        setAllocation({ amount: "" })
        setShowAllocateForm(null)
        fetchGoals()
      } else {
        const errorData = await response.text()
        setError(errorData || "Failed to allocate savings")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getGoalStatus = (goal: Goal) => {
    const percentage = (goal.savedAmount / goal.targetAmount) * 100
    const targetDate = new Date(goal.targetDate)
    const today = new Date()
    const daysRemaining = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (percentage >= 100) return { status: "completed", color: "green", icon: CheckCircle }
    if (daysRemaining < 0) return { status: "overdue", color: "red", icon: Clock }
    if (daysRemaining <= 30) return { status: "urgent", color: "yellow", icon: Clock }
    return { status: "active", color: "blue", icon: Target }
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
            <h1 className="text-3xl font-bold text-gray-900">Financial Goals</h1>
            <p className="text-gray-600">Set and track your savings goals</p>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Goal
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

        {/* Add Goal Form */}
        {showAddForm && (
          <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>{editingGoal ? "Edit Goal" : "Create New Goal"}</CardTitle>
              <CardDescription>Set a new financial goal to work towards</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddGoal} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Goal Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Emergency Fund, Vacation, New Car"
                      value={newGoal.name}
                      onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetAmount">Target Amount</Label>
                    <Input
                      id="targetAmount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newGoal.targetAmount}
                      onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your goal..."
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetDate">Target Date</Label>
                  <Input
                    id="targetDate"
                    type="date"
                    value={newGoal.targetDate}
                    onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? (editingGoal ? "Updating..." : "Creating...") : (editingGoal ? "Update Goal" : "Create Goal")}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowAddForm(false)
                      setEditingGoal(null)
                      setNewGoal({ name: "", description: "", targetAmount: "", targetDate: "" })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Goals List */}
        {goals.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="py-12">
              <div className="text-center">
                <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No goals created yet</h3>
                <p className="text-gray-500 mb-4">
                  Start by creating your first financial goal to track your progress.
                </p>
                <Button
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Goal
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {goals.map((goal) => {
              const percentage = (goal.savedAmount / goal.targetAmount) * 100
              const { status, color, icon: StatusIcon } = getGoalStatus(goal)
              const targetDate = new Date(goal.targetDate)
              const today = new Date()
              const daysRemaining = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

              return (
                <Card
                  key={goal.id}
                  className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-1">{goal.name}</CardTitle>
                        {goal.description && <CardDescription className="text-sm">{goal.description}</CardDescription>}
                      </div>
                      <div className="flex gap-1 ml-4">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleEditGoal(goal)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Progress</span>
                        <span className="text-sm font-medium">
                          {formatCurrency(goal.savedAmount)} / {formatCurrency(goal.targetAmount)}
                        </span>
                      </div>
                      <Progress
                        value={Math.min(percentage, 100)}
                        className={`h-3 ${
                          status === "completed"
                            ? "[&>div]:bg-green-500"
                            : status === "overdue"
                              ? "[&>div]:bg-red-500"
                              : status === "urgent"
                                ? "[&>div]:bg-yellow-500"
                                : "[&>div]:bg-blue-500"
                        }`}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge
                        variant={
                          status === "completed"
                            ? "default"
                            : status === "overdue"
                              ? "destructive"
                              : status === "urgent"
                                ? "secondary"
                                : "outline"
                        }
                        className="flex items-center gap-1"
                      >
                        <StatusIcon className="w-3 h-3" />
                        {percentage.toFixed(0)}% complete
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {daysRemaining > 0
                          ? `${daysRemaining} days left`
                          : daysRemaining === 0
                            ? "Due today"
                            : `${Math.abs(daysRemaining)} days overdue`}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-gray-900">
                          {formatCurrency(goal.targetAmount - goal.savedAmount)}
                        </div>
                        <div className="text-xs text-gray-600">Remaining</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">
                          {daysRemaining > 0
                            ? formatCurrency((goal.targetAmount - goal.savedAmount) / daysRemaining)
                            : formatCurrency(0)}
                        </div>
                        <div className="text-xs text-gray-600">Per day needed</div>
                      </div>
                    </div>

                    {status === "completed" ? (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Goal Completed! 🎉
                        </p>
                        <p className="text-xs text-green-600">Congratulations on reaching your target!</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {showAllocateForm === goal.id ? (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                            <Label htmlFor="allocation">Allocate Savings</Label>
                            <div className="flex gap-2">
                              <Input
                                id="allocation"
                                type="number"
                                step="0.01"
                                placeholder="Amount to allocate"
                                value={allocation.amount}
                                onChange={(e) => setAllocation({ amount: e.target.value })}
                                className="flex-1"
                              />
                              <Button
                                size="sm"
                                onClick={() => handleAllocateSavings(goal.id)}
                                disabled={loading || !allocation.amount}
                              >
                                Allocate
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setShowAllocateForm(null)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                            onClick={() => setShowAllocateForm(goal.id)}
                          >
                            <DollarSign className="w-4 h-4 mr-2" />
                            Allocate Savings
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Goals Summary */}
        {goals.length > 0 && (
          <Card className="mt-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Goals Summary
              </CardTitle>
              <CardDescription>Overview of all your financial goals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{goals.length}</div>
                  <div className="text-sm text-gray-600">Total Goals</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {goals.filter((goal) => goal.savedAmount / goal.targetAmount >= 1).length}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(goals.reduce((sum, goal) => sum + goal.targetAmount, 0))}
                  </div>
                  <div className="text-sm text-gray-600">Total Target</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(goals.reduce((sum, goal) => sum + goal.savedAmount, 0))}
                  </div>
                  <div className="text-sm text-gray-600">Total Saved</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
