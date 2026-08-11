import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import Select from "react-select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useTheme } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { EmailVerificationModal } from "@/components/EmailVerificationModal"
import axiosInstance from "@/lib/axiosInstance"

import {
  API_ENDPOINTS,
  API_BASE_URL_LOGIN
} from "@/lib/apiconfig"

import axios from "axios"

import { Mail, Lock, Eye, EyeOff, Building2, User, Phone, Lightbulb, CheckCircle2 } from "lucide-react"

export function LoginPage() {
  const navigate = useNavigate()

  // Redirect to dashboard if already logged in
  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (token) {
      navigate("/")
    }
  }, [navigate])

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState("")
  const [isRegistering, setIsRegistering] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)

  // Registration States
  const [companyName, setCompanyName] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [businessCategory, setBusinessCategory] = useState<{ value: string; label: string } | null>(null)
  const [businessCategories, setBusinessCategories] = useState<{ value: string; label: string }[]>([])
  const [registerLoading, setRegisterLoading] = useState(false)
  const [registerError, setRegisterError] = useState("")
  const [registerSuccess, setRegisterSuccess] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSuccess, setForgotSuccess] = useState(false)
  const [forgotError, setForgotError] = useState("")

  // Fetch business categories on component mount
  useEffect(() => {
    const fetchBusinessCategories = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL_LOGIN}${API_ENDPOINTS.TENANT_BUSINESS_CATEGORIES}`
        );

        const categories = response.data.map((cat: any) => ({
          value: cat.id,
          label: cat.name,
        }))
        setBusinessCategories(categories)
      } catch (error) {
        console.error("Error fetching business categories:", error)
      }
    }
    fetchBusinessCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
      localStorage.removeItem("user_info")
      localStorage.removeItem("schema_name")
      localStorage.removeItem("isFirstLogin")
      localStorage.removeItem("tenant_groups")
      localStorage.removeItem("tenant_permissions")
      localStorage.removeItem("business_category")

      const loginResponse = await axiosInstance.post(
        `${API_BASE_URL_LOGIN}${API_ENDPOINTS.LOGIN_TENANT}`,
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      const token = loginResponse?.data?.access
      const refresh = loginResponse?.data?.refresh
      const user = loginResponse?.data?.user
      const tenants = loginResponse?.data?.tenants
      const tenantGroups = loginResponse?.data?.tenant_groups
      const tenantPermissions = loginResponse?.data?.tenant_permissions

      if (!token) throw new Error("No access token received")

      localStorage.setItem("access_token", token)
      localStorage.setItem("refresh_token", refresh)
      localStorage.setItem("user_info", JSON.stringify(user))
      localStorage.setItem("tenant_groups", JSON.stringify(tenantGroups || []))
      localStorage.setItem("tenant_permissions", JSON.stringify(tenantPermissions || []))

      if (tenants && tenants.length > 0) {
        localStorage.setItem("schema_name", tenants[0].schema_name)
        localStorage.setItem("business_category", tenants[0].business_category)
      }

      toast.success("Login successful!")
      navigate("/")
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail

      if (errorMessage === "Please verify your email before signing in") {
        setShowVerificationModal(true)
        setError("")
      } else {
        setError(errorMessage)
        toast.error(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotError("")
    setForgotSuccess(false)
    setForgotLoading(true)

    try {
      const response = await axios.post(
        `${API_BASE_URL_LOGIN}tenants/password/reset/`,
        { email: forgotEmail },
        { headers: { "Content-Type": "application/json" } }
      );

      // Check the response message to determine if email is registered
      const message = response.data?.message || response.data?.detail || ""

      if (message.toLowerCase().includes("email is not registered") ||
        message.toLowerCase().includes("not registered")) {
        // Email is not registered - show error
        setForgotError("This email is not registered. Please check your email or sign up for a new account.")
        toast.error("Email not registered")
      } else {
        // Email is registered - show success
        setForgotSuccess(true)
        toast.success("Password reset link sent to your email!")
      }
    } catch (error: any) {
      console.error("Error sending password reset:", error)
      setForgotError(error.response?.data?.detail || "Failed to send password reset link")
      toast.error("Failed to send password reset link")
    } finally {
      setForgotLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegisterError("")
    setRegisterSuccess(false)
    setRegisterLoading(true)

    try {
      const payload = {
        company_name: companyName,
        business_category: businessCategory ? businessCategory.value : null,
        on_trial: true,
        owner: {
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
          email: registerEmail,
          password: registerPassword,
        },
      }

      await axios.post(
        `${API_BASE_URL_LOGIN}${API_ENDPOINTS.TENANT_PROVISION}`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      setRegisterSuccess(true)
      toast.success("Account created successfully!")

      // Auto transition to Sign In after success
      setTimeout(() => {
        setEmail(registerEmail)
        setPassword(registerPassword)
        setIsRegistering(false)
        setRegisterSuccess(false)
        setCompanyName("")
        setFirstName("")
        setLastName("")
        setPhoneNumber("")
        setRegisterEmail("")
        setRegisterPassword("")
        setBusinessCategory(null)
        setShowRegisterPassword(false)
      }, 1500)
    } catch (error: any) {
      console.error("Registration error:", error)
      let errorMessage = "Failed to register. Please try again."
      if (error.response?.data) {
        if (typeof error.response.data === "string") {
          errorMessage = error.response.data
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message
        } else if (typeof error.response.data === "object") {
          errorMessage = Object.entries(error.response.data)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(", ") : val}`)
            .join(" | ")
        }
      }
      setRegisterError(errorMessage)
      toast.error("Registration failed!")
    } finally {
      setRegisterLoading(false)
    }
  }

  const handleViewChange = (callback: () => void) => {
    setIsAnimating(true)
    setTimeout(() => {
      callback()
      setIsAnimating(false)
    }, 150)
  }

  // Fetch business categories on component mount
  useEffect(() => {
    const fetchBusinessCategories = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL_LOGIN}${API_ENDPOINTS.TENANT_BUSINESS_CATEGORIES}`
        );
        const categories = response.data.map((cat: { id: string; name: string }) => ({
          value: cat.id,
          label: cat.name,
        }))
        setBusinessCategories(categories)
      } catch (error) {
        console.error("Error fetching business categories:", error)
      }
    }
    fetchBusinessCategories()
  }, [])

  return (
    <div className="flex min-h-svh items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 relative">
      {/* Theme Toggle Button */}
      <div className="absolute top-6 right-6">
        <ThemeToggle variant="dropdown" />
      </div>

      <div className="w-full max-w-[440px] my-auto space-y-10 py-6 animate-in fade-in slide-in-from-right-4 duration-700">
        {/* Mobile Logo (Visible on Mobile) */}
        <div className="lg:hidden flex flex-col items-center gap-4 mb-8">
          <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Lightbulb className="text-white h-8 w-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
            PO'O <span className="text-blue-600">Technologies</span>
          </h2>
        </div>

        <Card className="w-full border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              {isRegistering
                ? "Create Account"
                : isForgotPassword
                  ? "Forgot Password"
                  : "Welcome Back"}
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              {isRegistering
                ? "Register your new company account to begin"
                : isForgotPassword
                  ? "Enter your email to receive a password reset link"
                  : "Enter your email and password to access your account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isRegistering ? (
              !isForgotPassword ? (
                <form onSubmit={handleSubmit} className={`space-y-5 text-left transition-all duration-300 ${isAnimating ? 'opacity-0 -translate-x-4' : 'opacity-100 translate-x-0'}`}>
                  {error && (
                    <div className="p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-2xl">
                      <p className="text-sm font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
                        {error}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-12 pl-10 border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-12 pl-10 pr-10 border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => handleViewChange(() => {
                          setIsForgotPassword(true)
                          setForgotEmail(email)
                        })}
                        className="text-sm text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={loading} className="h-12 px-8 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all hover:scale-[1.02] cursor-pointer">
                      {loading ? (
                        <div className="flex items-center gap-3">
                          <Spinner className="h-5 w-5" />
                          <span>Signing in...</span>
                        </div>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </div>
                  <div className="text-center pt-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Don't have an account?{" "}
                      <button
                        type="button"
                        onClick={() => handleViewChange(() => setIsRegistering(true))}
                        className="text-primary font-semibold hover:text-primary/80 transition-colors cursor-pointer"
                      >
                        Get started
                      </button>
                    </p>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleForgotPassword} className={`space-y-5 text-left transition-all duration-300 ${isAnimating ? 'opacity-0 -translate-x-4' : 'opacity-100 translate-x-0'}`}>
                  {forgotError && (
                    <div className="p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-2xl">
                      <p className="text-sm font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
                        {forgotError}
                      </p>
                    </div>
                  )}

                  {forgotSuccess ? (
                    <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl text-center">
                      <Mail className="h-12 w-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
                      <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 mb-2">Check your email</p>
                      <p className="text-emerald-600/70 dark:text-emerald-400/70 text-sm">
                        We've sent a password reset link to <span className="font-semibold">{forgotEmail}</span>
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="forgot-email" className="text-sm font-semibold">Email Address</Label>
                        <div className="relative group">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                          <Input
                            id="forgot-email"
                            type="email"
                            placeholder="Enter your email"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            required
                            className="h-12 pl-10 border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary/20 transition-all"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={forgotLoading} className="h-12 px-8 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all hover:scale-[1.02] cursor-pointer">
                          {forgotLoading ? (
                            <div className="flex items-center gap-3">
                              <Spinner className="h-5 w-5" />
                              <span>Sending...</span>
                            </div>
                          ) : (
                            "Send Reset Link"
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                  <div className="text-center pt-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Remember your password?{" "}
                      <button
                        type="button"
                        onClick={() => handleViewChange(() => setIsForgotPassword(false))}
                        className="text-primary font-semibold hover:text-primary/80 transition-colors cursor-pointer"
                      >
                        Back to Sign In
                      </button>
                    </p>
                  </div>
                </form>
              )
            ) : (
              <form onSubmit={handleRegister} className={`space-y-4 text-left transition-all duration-300 ${isAnimating ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}>
                {registerError && (
                  <div className="p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-2xl">
                    <p className="text-sm font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
                      {registerError}
                    </p>
                  </div>
                )}

                {registerSuccess && (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl">
                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Account provisioned successfully! Redirecting to sign in...
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="company-name" className="text-sm font-semibold">Company Name</Label>
                  <div className="relative group">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="company-name"
                      type="text"
                      placeholder="Enter company name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                      className="h-12 pl-10 border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business-category" className="text-sm font-semibold">Business Category</Label>
                  <Select
                    value={businessCategory}
                    onChange={setBusinessCategory}
                    options={businessCategories}
                    placeholder="Select business category"
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        minHeight: '48px',
                        borderRadius: '8px',
                        border: '1px solid rgb(226 232 240)',
                        '&:hover': { borderColor: 'rgb(59 130 246)' },
                        backgroundColor: state.isFocused ? 'rgb(255 255 255)' : 'rgb(255 255 255)',
                        boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
                      }),
                      menu: (base) => ({
                        ...base,
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected ? 'rgb(59 130 246)' : state.isFocused ? 'rgb(243 244 246)' : 'white',
                        color: state.isSelected ? 'white' : 'rgb(15 23 42)',
                      }),
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name" className="text-sm font-semibold">First Name</Label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <Input
                        id="first-name"
                        type="text"
                        placeholder="First name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        className="h-12 pl-10 border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last-name" className="text-sm font-semibold">Last Name</Label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <Input
                        id="last-name"
                        type="text"
                        placeholder="Last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        className="h-12 pl-10 border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone-number" className="text-sm font-semibold">Phone Number</Label>
                  <div className="relative group">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="phone-number"
                      type="text"
                      placeholder="Enter phone number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      className="h-12 pl-10 border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-sm font-semibold">Email Address</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="Enter your email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                      className="h-12 pl-10 border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-sm font-semibold">Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="register-password"
                      type={showRegisterPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                      className="h-12 pl-10 pr-10 border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    >
                      {showRegisterPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={registerLoading || registerSuccess} className="h-12 px-8 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all hover:scale-[1.02] cursor-pointer">
                    {registerLoading ? (
                      <div className="flex items-center gap-3">
                        <Spinner className="h-5 w-5" />
                        <span>Creating Account...</span>
                      </div>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </div>

                <div className="text-center pt-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => handleViewChange(() => setIsRegistering(false))}
                      className="text-primary font-semibold hover:text-primary/80 transition-colors cursor-pointer"
                    >
                      Sign In
                    </button>
                  </p>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      <EmailVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        email={email}
      />
    </div>
  )
}
