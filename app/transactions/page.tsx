"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TrendingUp, TrendingDown, Plus, Search, Filter, Calendar, DollarSign, Edit, Trash2 } from "lucide-react"
import Navbar from "@/components/navbar"
import { formatCurrency } from "@/lib/utils"

interface Transaction {
  id: string
  description: string
  amount: number
  date: string
  category?: string
  type: "income" | "expense"
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

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const router = useRouter()

  const [newTransaction, setNewTransaction] = useState({
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    category: "FOOD", // Updated default value to be a non-empty string
    type: "expense" as "income" | "expense",
  })

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/")
      return
    }

    fetchTransactions()
  }, [router])

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      // Fetch expenses
      const expensesResponse = await fetch("http://localhost:8080/api/users/expenses", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      // Fetch incomes
      const incomesResponse = await fetch("http://localhost:8080/api/users/incomes", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (expensesResponse.ok && incomesResponse.ok) {
        const expenses = await expensesResponse.json()
        const incomes = await incomesResponse.json()

        const allTransactions: Transaction[] = [
          ...expenses.map((expense: any) => ({
            ...expense,
            type: "expense" as const,
          })),
          ...incomes.map((income: any) => ({
            ...income,
            type: "income" as const,
          })),
        ]

        // Sort by date (newest first)
        allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        setTransactions(allTransactions)
      }
    } catch (err) {
      setError("Failed to load transactions")
    } finally {
      setLoading(false)
    }
  }

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const endpoint =
        newTransaction.type === "expense"
          ? "http://localhost:8080/api/users/expenses/save"
          : "http://localhost:8080/api/users/incomes/save"

      const payload = {
        description: newTransaction.description,
        amount: Number.parseFloat(newTransaction.amount),
        date: new Date(newTransaction.date).toLocaleDateString("en-GB"),
        ...(newTransaction.type === "expense" && { category: newTransaction.category }),
        currency: "USD",
        tags: [],
        isRecurring: false,
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        setSuccess(`${newTransaction.type === "expense" ? "Expense" : "Income"} added successfully!`)
        setNewTransaction({
          description: "",
          amount: "",
          date: new Date().toISOString().split("T")[0],
          category: "FOOD",
          type: "expense",
        })
        setShowAddForm(false)
        // Refresh transactions after successful addition
        await fetchTransactions()
      } else {
        const errorData = await response.text()
        setError(errorData || "Failed to add transaction")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setNewTransaction({
      description: transaction.description,
      amount: transaction.amount.toString(),
      date: new Date(transaction.date).toISOString().split("T")[0],
      category: transaction.category || "FOOD",
      type: transaction.type,
    })
    setShowAddForm(true)
  }

  const handleUpdateTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTransaction) return

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const endpoint = editingTransaction.type === "expense"
        ? `http://localhost:8080/api/users/expenses/${editingTransaction.id}`
        : `http://localhost:8080/api/users/incomes/${editingTransaction.id}`

      const payload = {
        description: newTransaction.description,
        amount: Number.parseFloat(newTransaction.amount),
        date: new Date(newTransaction.date).toLocaleDateString("en-GB"),
        ...(newTransaction.type === "expense" && { category: newTransaction.category }),
        currency: "USD",
        tags: [],
        isRecurring: false,
      }

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        setSuccess(`${editingTransaction.type === "expense" ? "Expense" : "Income"} updated successfully!`)
        setNewTransaction({
          description: "",
          amount: "",
          date: new Date().toISOString().split("T")[0],
          category: "FOOD",
          type: "expense",
        })
        setEditingTransaction(null)
        setShowAddForm(false)
        await fetchTransactions()
      } else {
        const errorData = await response.text()
        setError(errorData || "Failed to update transaction")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTransaction = async (transaction: Transaction) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const endpoint = transaction.type === "expense" 
        ? `http://localhost:8080/api/users/expenses/${transaction.id}`
        : `http://localhost:8080/api/users/incomes/${transaction.id}`

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setSuccess(`${transaction.type === "expense" ? "Expense" : "Income"} deleted successfully!`)
        await fetchTransactions()
      } else {
        setError("Failed to delete transaction")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    }
  }

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || transaction.category === selectedCategory
    const matchesType = activeTab === "all" || transaction.type === activeTab

    return matchesSearch && matchesCategory && matchesType
  })

  if (loading && transactions.length === 0) {
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
            <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
            <p className="text-gray-600">Manage your income and expenses</p>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
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

        {/* Add/Edit Transaction Form */}
        {showAddForm && (
          <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>{editingTransaction ? "Edit Transaction" : "Add New Transaction"}</CardTitle>
              <CardDescription>
                {editingTransaction ? "Update your transaction details" : "Record a new income or expense"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={editingTransaction ? handleUpdateTransaction : handleAddTransaction} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={newTransaction.type}
                      onValueChange={(value: "income" | "expense") =>
                        setNewTransaction({ ...newTransaction, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="expense">Expense</SelectItem>
                        <SelectItem value="income">Income</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Enter description"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newTransaction.date}
                      onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                      required
                    />
                  </div>
                  {newTransaction.type === "expense" && (
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={newTransaction.category}
                        onValueChange={(value) => setNewTransaction({ ...newTransaction, category: value })}
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
                  )}
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? (editingTransaction ? "Updating..." : "Adding...") : (editingTransaction ? "Update Transaction" : "Add Transaction")}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowAddForm(false)
                      setEditingTransaction(null)
                      setNewTransaction({
                        description: "",
                        amount: "",
                        date: new Date().toISOString().split("T")[0],
                        category: "FOOD",
                        type: "expense",
                      })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Filters and Search */}
        <Card className="mb-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {expenseCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0) + category.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="all">All Transactions</TabsTrigger>
            <TabsTrigger value="income" className="text-green-600">
              Income
            </TabsTrigger>
            <TabsTrigger value="expense" className="text-red-600">
              Expenses
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredTransactions.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="py-12">
                  <div className="text-center">
                    <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                    <p className="text-gray-500 mb-4">
                      {activeTab === "all"
                        ? "You haven't recorded any transactions yet."
                        : `No ${activeTab} transactions found.`}
                    </p>
                    <Button
                      onClick={() => setShowAddForm(true)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Transaction
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredTransactions.map((transaction) => (
                  <Card
                    key={transaction.id}
                    className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className={`p-3 rounded-full ${
                              transaction.type === "income" ? "bg-green-100" : "bg-red-100"
                            }`}
                          >
                            {transaction.type === "income" ? (
                              <TrendingUp className="w-5 h-5 text-green-600" />
                            ) : (
                              <TrendingDown className="w-5 h-5 text-red-600" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{transaction.description}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              {transaction.category && (
                                <Badge variant="secondary" className="text-xs">
                                  {transaction.category.charAt(0) + transaction.category.slice(1).toLowerCase()}
                                </Badge>
                              )}
                              <span className="text-sm text-gray-500 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(transaction.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-lg font-bold ${
                              transaction.type === "income" ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {transaction.type === "income" ? "+" : "-"}
                            {formatCurrency(transaction.amount)}
                          </span>
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleEditTransaction(transaction)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteTransaction(transaction)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
