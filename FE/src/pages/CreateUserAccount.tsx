import { useState } from "react"
import {
    Loader2,
    CheckCircle,
    AlertCircle,
    Users,
    Mail,
    Lock,
    User,
    Shield,
    X,
    Sparkles,
    Eye,
    EyeOff,
} from "lucide-react"

import { createUserAccount } from "@utils/UsersAPI"

interface FormData {
    email: string
    password: string
    fullName: string
    role: string
}

interface CreateUserFromProps {
    onClose?: () => void
}

export default function CreateUserAccount({ onClose }: CreateUserFromProps) {
    const [formData, setFormData] = useState<FormData>({
        email: "",
        password: "",
        fullName: "",
        role: "",
    })
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const adminToken = "mock-token"

    const validRoles = [
        {
            value: "customer",
            label: "Customer",
            icon: User,
            color: "bg-gradient-to-br from-blue-500 to-blue-600",
            description: "Regular user access",
        },
        {
            value: "doctor",
            label: "Doctor",
            icon: Shield,
            color: "bg-gradient-to-br from-emerald-500 to-emerald-600",
            description: "Medical professional",
        },
        {
            value: "staff",
            label: "Staff",
            icon: Users,
            color: "bg-gradient-to-br from-orange-500 to-orange-600",
            description: "Support team member",
        },
        {
            value: "manager",
            label: "Manager",
            icon: Sparkles,
            color: "bg-gradient-to-br from-purple-500 to-purple-600",
            description: "Administrative access",
        },
    ]

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        if (message) setMessage(null)
    }

    const validateForm = (): boolean => {
        if (!formData.email || !formData.password || !formData.fullName || !formData.role) {
            setMessage({ type: "error", text: "Please fill in all fields" })
            return false
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
            setMessage({ type: "error", text: "Please enter a valid email" })
            return false
        }

        if (formData.password.length < 6) {
            setMessage({ type: "error", text: "Password must be 6+ characters" })
            return false
        }

        if (formData.password !== confirmPassword) {
            setMessage({ type: "error", text: "Passwords do not match" })
            return false
        }

        return true
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsLoading(true)
        setMessage(null)

        try {
            const data = await createUserAccount(formData, adminToken)

            if (data.success) {
                setMessage({
                    type: "success",
                    text: `Account created successfully for ${formData.fullName}!`,
                })
                setFormData({
                    email: "",
                    password: "",
                    fullName: "",
                    role: "",
                })
                setConfirmPassword("")
            } else {
                // Handle specific API error messages
                setMessage({
                    type: "error",
                    text: data.message || data.error || "Failed to create account. Please try again.",
                })
            }
        } catch (error: any) {
            // Handle network errors or other exceptions
            let errorMessage = "An unexpected error occurred. Please try again."

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error
            } else if (error.message) {
                errorMessage = error.message
            }

            setMessage({ type: "error", text: errorMessage })
        } finally {
            setIsLoading(false)
        }
    }

    const handleReset = () => {
        setFormData({
            email: "",
            password: "",
            fullName: "",
            role: "",
        })
        setConfirmPassword("")
        setMessage(null)
    }

    return (
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4">
            <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-t-2xl px-6 py-4">
                <div className="absolute inset-0 bg-black/10 rounded-t-2xl"></div>
                <div className="relative flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <Users className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Create User Account</h1>
                            <p className="text-blue-100 text-sm">Add a new team member to your organization</p>
                        </div>
                    </div>
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg flex items-center justify-center transition-colors"
                            aria-label="Close"
                        >
                            <X className="h-4 w-4 text-white" />
                        </button>
                    )}
                </div>
            </div>
            <div className="p-6">
                {message && (
                    <div
                        className={`mb-4 px-3 py-2 rounded-xl flex items-center gap-3 ${message.type === "error"
                            ? "bg-red-50 border border-red-200 text-red-800"
                            : "bg-green-50 border border-green-200 text-green-800"
                            }`}
                        role="alert"
                    >
                        {message.type === "success" ? (
                            <CheckCircle className="h-5 w-5 flex-shrink-0" />
                        ) : (
                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        )}
                        <span className="font-medium">{message.text}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Personal Information */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    id="fullName"
                                    type="text"
                                    placeholder="Enter full name"
                                    value={formData.fullName}
                                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                                    disabled={isLoading}
                                    className="w-full h-10 pl-11 pr-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 transition-all duration-200"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="email@company.com"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange("email", e.target.value)}
                                    disabled={isLoading}
                                    className="w-full h-10 pl-11 pr-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 transition-all duration-200"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Password Fields */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Minimum 6 characters"
                                    value={formData.password}
                                    onChange={(e) => handleInputChange("password", e.target.value)}
                                    disabled={isLoading}
                                    className="w-full h-10 pl-11 pr-11 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 transition-all duration-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Re-enter password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={isLoading}
                                    className="w-full h-10 pl-11 pr-11 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 transition-all duration-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">Select Role</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {validRoles.map((role) => {
                                const IconComponent = role.icon
                                const isSelected = formData.role === role.value
                                return (
                                    <button
                                        key={role.value}
                                        type="button"
                                        onClick={() => handleInputChange("role", role.value)}
                                        disabled={isLoading}
                                        className={`p-3 rounded-xl border-2 transition-all duration-200 text-center group ${isSelected
                                            ? "border-blue-500 bg-blue-50 shadow-lg scale-105"
                                            : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                                            }`}
                                    >
                                        <div
                                            className={`w-10 h-10 rounded-xl ${role.color} flex items-center justify-center mx-auto mb-2 shadow-lg`}
                                        >
                                            <IconComponent className="h-5 w-5 text-white" />
                                        </div>
                                        <h4 className="text-sm font-semibold text-gray-900 mb-1">{role.label}</h4>
                                        <p className="text-xs text-gray-500">{role.description}</p>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={handleReset}
                            disabled={isLoading}
                            className="flex-1 h-10 px-6 border-2 border-gray-200 rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 transition-all duration-200 font-medium"
                        >
                            Reset Form
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 h-10 px-6 flex items-center justify-center rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    <Users className="mr-2 h-5 w-5" />
                                    Create Account
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Info Footer */}
                <div className="mt-6 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Mail className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-blue-900">Email Verification Required</p>
                            <p className="text-sm text-blue-700 mt-1">
                                A verification email will be sent to the user. They will need to set a new password on their first
                                login.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
