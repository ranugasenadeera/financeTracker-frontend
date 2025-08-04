"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  PieChart,
  Bell,
  ChevronDown,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Navbar from "@/components/navbar"
import { formatCurrency } from "@/lib/utils"

interface DashboardData {
  user: {
    id: string
    username: string
    email: string
  }
  expenses: Array<{
    id: string
    description: string
    amount: number
    category: string
    date: string
  }>
  incomes: Array<{
    id: string
    description: string
    amount: number
    date: string
  }>
  budgets: Array<{
    id: string
    category: string
    monthlyLimit: number
    currentSpending: number
  }>
  goals: Array<{
    id: string
    name: string
    targetAmount: number
    savedAmount: number
    targetDate: string
  }>
  totalExpenses: number
  totalIncomes: number
  netSavings: number
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.replace("/")
      return
    }

    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token")
      const username = localStorage.getItem("username")

      if (!token || !username) {
        setError("Authentication required")
        setLoading(false)
        return
      }

      // Fetch all data in parallel
      const [expensesRes, incomesRes, budgetsRes, goalsRes] = await Promise.all([
        fetch("http://localhost:8080/api/users/expenses", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("http://localhost:8080/api/users/incomes", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("http://localhost:8080/api/users/budgets", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("http://localhost:8080/api/users/goals", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      const [expenses, incomes, budgets, goals] = await Promise.all([
        expensesRes.ok ? expensesRes.json() : [],
        incomesRes.ok ? incomesRes.json() : [],
        budgetsRes.ok ? budgetsRes.json() : [],
        goalsRes.ok ? goalsRes.json() : []
      ])

      // Calculate current month and year for budget calculations
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()

      // Calculate totals
      const totalExpenses = expenses.reduce((sum: number, expense: any) => sum + expense.amount, 0)
      const totalIncomes = incomes.reduce((sum: number, income: any) => sum + income.amount, 0)
      const netSavings = totalIncomes - totalExpenses

      // Use budgets with currentSpending from backend (already calculated for current month)
      const budgetsWithSpending = budgets

      const dashboardData: DashboardData = {
        user: { id: "1", username: username || "", email: "user@example.com" },
        expenses: expenses.slice(0, 10), // Recent expenses
        incomes: incomes.slice(0, 10), // Recent incomes
        budgets: budgetsWithSpending,
        goals,
        totalExpenses,
        totalIncomes,
        netSavings,
      }

      setDashboardData(dashboardData)
    } catch (err) {
      console.error("Dashboard fetch error:", err)
      setError("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-red-600 mb-4">{error}</div>
            {error === "Authentication required" && (
              <Button onClick={() => router.replace("/")} className="bg-blue-600 hover:bg-blue-700">
                Go to Login
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const recentExpenses = dashboardData?.expenses.slice(0, 5) || []
  const recentIncomes = dashboardData?.incomes.slice(0, 3) || []

  // Calculate monthly trends
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

  const currentMonthExpenses = dashboardData?.expenses.filter(expense => {
    const expenseDate = new Date(expense.date)
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
  }).reduce((sum, expense) => sum + expense.amount, 0) || 0

  const lastMonthExpenses = dashboardData?.expenses.filter(expense => {
    const expenseDate = new Date(expense.date)
    return expenseDate.getMonth() === lastMonth && expenseDate.getFullYear() === lastMonthYear
  }).reduce((sum, expense) => sum + expense.amount, 0) || 0

  const currentMonthIncomes = dashboardData?.incomes.filter(income => {
    const incomeDate = new Date(income.date)
    return incomeDate.getMonth() === currentMonth && incomeDate.getFullYear() === currentYear
  }).reduce((sum, income) => sum + income.amount, 0) || 0

  const lastMonthIncomes = dashboardData?.incomes.filter(income => {
    const incomeDate = new Date(income.date)
    return incomeDate.getMonth() === lastMonth && incomeDate.getFullYear() === lastMonthYear
  }).reduce((sum, income) => sum + income.amount, 0) || 0

  const expenseChange = lastMonthExpenses > 0 ? ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0
  const incomeChange = lastMonthIncomes > 0 ? ((currentMonthIncomes - lastMonthIncomes) / lastMonthIncomes) * 100 : 0
  const savingsChange = (currentMonthIncomes - currentMonthExpenses) - (lastMonthIncomes - lastMonthExpenses)
  const savingsPercentChange = (lastMonthIncomes - lastMonthExpenses) !== 0 ? (savingsChange / Math.abs(lastMonthIncomes - lastMonthExpenses)) * 100 : 0

  const completedGoals = dashboardData?.goals.filter(goal => (goal.savedAmount / goal.targetAmount) >= 1).length || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section with Notifications */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {dashboardData?.user.username}! 👋</h1>
            <p className="text-gray-600">Here's your financial overview for today.</p>
          </div>
          
          {/* Notifications Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="relative">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
                {/* Badge for notification count */}
                {((dashboardData?.budgets.some(budget => (budget.currentSpending / budget.monthlyLimit) > 0.8)) ||
                  (dashboardData?.goals.some(goal => {
                    const targetDate = new Date(goal.targetDate)
                    const today = new Date()
                    const daysRemaining = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                    return daysRemaining <= 60 && daysRemaining > 0 && (goal.savedAmount / goal.targetAmount) < 1
                  }))) && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 px-2 py-1 text-xs">
                    {[
                      ...dashboardData?.budgets.filter(budget => (budget.currentSpending / budget.monthlyLimit) > 0.8),
                      ...dashboardData?.goals.filter(goal => {
                        const targetDate = new Date(goal.targetDate)
                        const today = new Date()
                        const daysRemaining = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                        return daysRemaining <= 60 && daysRemaining > 0 && (goal.savedAmount / goal.targetAmount) < 1
                      })
                    ].length}
                  </Badge>
                )}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              {((dashboardData?.budgets.some(budget => (budget.currentSpending / budget.monthlyLimit) > 0.8)) ||
                (dashboardData?.goals.some(goal => {
                  const targetDate = new Date(goal.targetDate)
                  const today = new Date()
                  const daysRemaining = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                  return daysRemaining <= 60 && daysRemaining > 0 && (goal.savedAmount / goal.targetAmount) < 1
                }))) ? (
                <>
                  {/* Budget alerts */}
                  {dashboardData?.budgets
                    .filter(budget => (budget.currentSpending / budget.monthlyLimit) > 0.8)
                    .slice(0, 3)
                    .map((budget, index) => (
                      <DropdownMenuItem key={index} className="p-3 flex items-start gap-3">
                        <div className="bg-orange-100 p-1.5 rounded-full">
                          <PieChart className="w-4 h-4 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-orange-800">Budget Alert</p>
                          <p className="text-xs text-orange-600">
                            You've used {Math.round((budget.currentSpending / budget.monthlyLimit) * 100)}% of your {budget.category.toLowerCase()} budget
                          </p>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  
                  {/* Goal reminders */}
                  {dashboardData?.goals
                    .filter(goal => {
                      const targetDate = new Date(goal.targetDate)
                      const today = new Date()
                      const daysRemaining = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                      return daysRemaining <= 60 && daysRemaining > 0 && (goal.savedAmount / goal.targetAmount) < 1
                    })
                    .slice(0, 3)
                    .map((goal, index) => {
                      const targetDate = new Date(goal.targetDate)
                      const today = new Date()
                      const daysRemaining = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                      return (
                        <DropdownMenuItem key={index} className="p-3 flex items-start gap-3">
                          <div className="bg-blue-100 p-1.5 rounded-full">
                            <Target className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-blue-800">Goal Reminder</p>
                            <p className="text-xs text-blue-600">
                              Your "{goal.name}" goal is {daysRemaining} days away
                            </p>
                          </div>
                        </DropdownMenuItem>
                      )
                    })}
                </>
              ) : (
                <DropdownMenuItem className="p-3 flex items-center gap-3">
                  <div className="bg-green-100 p-1.5 rounded-full">
                    <Bell className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">No notifications</p>
                    <p className="text-xs text-gray-500">You're all caught up! 🎉</p>
                  </div>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Income</p>
                  <p className="text-2xl font-bold">{formatCurrency(dashboardData?.totalIncomes || 0)}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-green-100">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                <span className="text-sm">
                  {incomeChange >= 0 ? '+' : ''}{incomeChange.toFixed(1)}% from last month
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Total Expenses</p>
                  <p className="text-2xl font-bold">{formatCurrency(dashboardData?.totalExpenses || 0)}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <TrendingDown className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-red-100">
                {expenseChange >= 0 ? (
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 mr-1" />
                )}
                <span className="text-sm">
                  {expenseChange >= 0 ? '+' : ''}{expenseChange.toFixed(1)}% from last month
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Net Savings</p>
                  <p className="text-2xl font-bold">{formatCurrency(dashboardData?.netSavings || 0)}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <Wallet className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-blue-100">
                {savingsPercentChange >= 0 ? (
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 mr-1" />
                )}
                <span className="text-sm">
                  {savingsPercentChange >= 0 ? '+' : ''}{savingsPercentChange.toFixed(1)}% from last month
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Active Goals</p>
                  <p className="text-2xl font-bold">{dashboardData?.goals.length || 0}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <Target className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-purple-100">
                <Target className="w-4 h-4 mr-1" />
                <span className="text-sm">
                  {completedGoals > 0 ? `${completedGoals} goals completed` : 'Keep working on your goals!'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Transactions */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Your latest financial activities</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.push("/transactions")}>
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentExpenses.length === 0 && recentIncomes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No transactions yet</p>
                      <p className="text-sm">Start by adding your first expense or income</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {[...recentExpenses, ...recentIncomes]
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 5)
                        .map((transaction, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-full ${"category" in transaction ? "bg-red-100" : "bg-green-100"}`}
                              >
                                {"category" in transaction ? (
                                  <TrendingDown className="w-4 h-4 text-red-600" />
                                ) : (
                                  <TrendingUp className="w-4 h-4 text-green-600" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{transaction.description}</p>
                                <p className="text-sm text-gray-500">
                                  {"category" in transaction ? String(transaction.category) : "Income"} • {new Date(transaction.date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`font-semibold ${"category" in transaction ? "text-red-600" : "text-green-600"}`}
                            >
                              {"category" in transaction ? "-" : "+"}
                              {formatCurrency(transaction.amount)}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Budget Overview */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-blue-600" />
                  Budget Overview
                </CardTitle>
                <CardDescription>Your spending vs budget limits</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData?.budgets.length === 0 ? (
                  <div className="text-center py-6">
                    <PieChart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 mb-2">No budgets set</p>
                    <Button size="sm" onClick={() => router.push("/budgets")} className="bg-blue-600 hover:bg-blue-700">
                      Create Budget
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboardData?.budgets.map((budget) => {
                      const percentage = (budget.currentSpending / budget.monthlyLimit) * 100
                      return (
                        <div key={budget.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{budget.category}</span>
                            <span className="text-sm text-gray-500">
                              {formatCurrency(budget.currentSpending)} / {formatCurrency(budget.monthlyLimit)}
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                          <div className="flex justify-between items-center">
                            <Badge
                              variant={percentage > 80 ? "destructive" : percentage > 60 ? "secondary" : "default"}
                            >
                              {percentage.toFixed(0)}% used
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Goals Progress */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Goals Progress
                </CardTitle>
                <CardDescription>Track your financial goals</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData?.goals.length === 0 ? (
                  <div className="text-center py-6">
                    <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 mb-2">No goals set</p>
                    <Button
                      size="sm"
                      onClick={() => router.push("/goals")}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Create Goal
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboardData?.goals.map((goal) => {
                      const percentage = (goal.savedAmount / goal.targetAmount) * 100
                      return (
                        <div key={goal.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{goal.name}</span>
                            <span className="text-sm text-gray-500">
                              {formatCurrency(goal.savedAmount)} / {formatCurrency(goal.targetAmount)}
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                          <div className="flex justify-between items-center">
                            <Badge variant={percentage >= 100 ? "default" : "secondary"}>
                              {percentage.toFixed(0)}% complete
                            </Badge>
                            <span className="text-xs text-gray-500">Due: {new Date(goal.targetDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
