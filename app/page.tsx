"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, TrendingUp, Shield, Smartphone, BarChart3 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  })

  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    password: "",
  })

  useEffect(() => {
    // Check if user is already logged in
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("token")
      console.log('Token check:', token)
      if (token) {
        console.log('Token found, redirecting to dashboard')
        router.replace("/dashboard")
      } else {
        console.log('No token found, staying on login page')
      }
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("http://localhost:8080/api/authenticate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginForm),
      })

      const data = await response.json()

      if (response.ok) {
        // Extract token from the message
        const tokenMatch = data.message.match(/Token: (.+)/)
        if (tokenMatch) {
          const token = tokenMatch[1]
          localStorage.setItem("token", token)
          localStorage.setItem("username", loginForm.username)
          router.replace("/dashboard")
        }
      } else {
        setError(data.message || "Login failed")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("http://localhost:8080/api/users/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerForm),
      })

      const data = await response.text()

      if (response.ok) {
        setSuccess("Registration successful! Please login.")
        setIsLogin(true)
        setRegisterForm({ username: "", email: "", password: "" })
      } else {
        setError(data || "Registration failed")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                FinanceTracker
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Hero content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Take Control of Your{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Financial Future
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Track expenses, set budgets, achieve goals, and get intelligent insights to make better financial
                decisions.
              </p>
            </div>

            {/* Features */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Smart Analytics</h3>
                  <p className="text-gray-600 text-sm">Get detailed insights into your spending patterns</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Secure & Private</h3>
                  <p className="text-gray-600 text-sm">Your financial data is encrypted and protected</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Goal Tracking</h3>
                  <p className="text-gray-600 text-sm">Set and achieve your financial goals</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Mobile Ready</h3>
                  <p className="text-gray-600 text-sm">Access your finances anywhere, anytime</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Auth forms */}
          <div className="flex justify-center">
            <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-2xl font-bold text-center text-gray-900">
                  {isLogin ? "Welcome Back" : "Get Started"}
                </CardTitle>
                <CardDescription className="text-center text-gray-600">
                  {isLogin ? "Sign in to your account" : "Create your account to start tracking"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={isLogin ? "login" : "register"} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100">
                    <TabsTrigger
                      value="login"
                      onClick={() => setIsLogin(true)}
                      className="data-[state=active]:bg-white data-[state=active]:text-blue-600"
                    >
                      Login
                    </TabsTrigger>
                    <TabsTrigger
                      value="register"
                      onClick={() => setIsLogin(false)}
                      className="data-[state=active]:bg-white data-[state=active]:text-blue-600"
                    >
                      Register
                    </TabsTrigger>
                  </TabsList>

                  {error && (
                    <Alert className="mb-4 border-red-200 bg-red-50">
                      <AlertDescription className="text-red-700">{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="mb-4 border-green-200 bg-green-50">
                      <AlertDescription className="text-green-700">{success}</AlertDescription>
                    </Alert>
                  )}

                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          type="text"
                          placeholder="Enter your username"
                          value={loginForm.username}
                          onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                          required
                          className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={loginForm.password}
                            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                            required
                            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                        disabled={loading}
                      >
                        {loading ? "Signing in..." : "Sign In"}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="register">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="reg-username">Username</Label>
                        <Input
                          id="reg-username"
                          type="text"
                          placeholder="Choose a username"
                          value={registerForm.username}
                          onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                          required
                          className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={registerForm.email}
                          onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                          required
                          className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-password">Password</Label>
                        <div className="relative">
                          <Input
                            id="reg-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password"
                            value={registerForm.password}
                            onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                            required
                            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                        disabled={loading}
                      >
                        {loading ? "Creating account..." : "Create Account"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
