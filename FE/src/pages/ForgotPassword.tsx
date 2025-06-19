import SummaryApi from "@common/SummarryAPI";
import Axios from "@utils/Axios";
import { useState } from "react";
import logo from "@assets/logo.jpg";
import login_image from "@assets/login_image.jpg";
import { ArrowLeft, Shield, Lock } from "@mui/icons-material";
import { toast, ToastContainer } from 'react-toastify';
import { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
const ForgotPassword = () => {
    const [email, setEmail] = useState<string>("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [newPassword, setNewPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [currentStep, setCurrentStep] = useState(1);
    const navigation = useNavigate();
    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await Axios({
                ...SummaryApi.forgotPassword,
                headers: {
                    "Content-Type": "application/json",
                },
                data: { email },
            });

            if (response.status === 200) {
                toast.success("A verification code has been sent to your email.");
                setCurrentStep(2);
            }
        } catch (error: any) {
            if (error.response && error.response.data) {
                toast.error(error.response.data.message || "An unexpected error occurred.");
            } else {
                toast.error("Something went wrong. Please try again.");
            }
        }
        setLoading(false);
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length <= 1) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            if (value && index < 5) {
                const nextInput = document.getElementById(`otp-${index + 1}`);
                nextInput?.focus();
            }
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await Axios.post("http://localhost:5001/api/v1/auth/verify-otp", {
                email,
                otp: otp.join(""),
            });

            if (response.status === 200) {
                toast.success("OTP Verified successfully!");
                setCurrentStep(3);
            }
        } catch (error) {
            toast.error("OTP Verification failed. Please try again.");
        }
        setLoading(false);
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("Passwords don't match!");
            return;
        }

        if (!newPassword || !confirmPassword) {
            toast.error("Please enter your new password.");
            return;
        }

        setLoading(true);

        setLoading(true);

        try {
            const response = await Axios.post("http://localhost:5001/api/v1/auth/reset-password", {
                email,
                otp: otp.join(""),
                newPassword,
            });

            if (response.status === 200) {
                toast.success("Password reset successfully!");
                setTimeout(() => {
                    navigation('/auth/login');
                }, 2000);
            }
        } catch (error: any) {
            console.error("Error resetting password:", error);
            if (error.response && error.response.data) {
                toast.error(error.response.data.message || "Error resetting password. Please try again.");
            } else {
                toast.error("Network or server error. Please try again later.");
            }
        }
        setLoading(false);
    };

    const renderStep1 = () => (
        <div className="w-full max-w-md space-y-8">
            <div className="text-center">
                <a
                    href="/auth/login"
                    className="inline-flex items-center gap-2 mb-8 text-gray-600 hover:text-gray-800"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="text-sm">Back to Login</span>
                </a>
                <div className="flex items-center justify-center gap-2 mb-6">
                    <img
                        src={logo}
                        alt="PetWell Logo"
                        width={40}
                        height={40}
                        className="rounded-full bg-orange-500"
                    />
                    <span className="text-2xl font-bold text-orange-600">PetWell</span>
                </div>
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Shield className="h-8 w-8 text-orange-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Forgot Password?</h1>
                <p className="text-gray-600 mt-2">
                    No worries! Enter your email address and we'll send you a verification code to reset your password.
                </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-gray-600">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md"
                        placeholder="Enter your email address"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <p className="text-sm text-gray-500 mt-1">We'll send a 6-digit verification code to this email</p>
                </div>

                <button
                    type="submit"
                    className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600"
                    disabled={loading}
                >
                    {loading ? "Sending..." : "Send Verification Code"}
                </button>
            </form>

            {message && <p className="mt-4 text-center text-gray-600">{message}</p>}

            <div className="text-center mt-4">
                <a href="/auth/login" className="text-sm text-gray-600 hover:text-orange-500">Remember your password? Sign in</a>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="w-full max-w-md space-y-8">
            <div className="text-center">
                <a
                    onClick={() => setCurrentStep(1)}
                    className="inline-flex items-center gap-2 mb-8 text-gray-600 hover:text-gray-800 cursor-pointer"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="text-sm">Back</span>
                </a>
                <div className="flex items-center justify-center gap-2 mb-6">
                    <img
                        src={logo}
                        alt="PetWell Logo"
                        width={40}
                        height={40}
                        className="rounded-full bg-orange-500"
                    />
                    <span className="text-2xl font-bold text-orange-600">PetWell</span>
                </div>
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Enter Verification Code</h1>
                <p className="text-gray-600 mt-2">
                    We've sent a 6-digit verification code to <span className="font-medium">{email}</span>
                </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                    <label className="block text-gray-600">Verification Code</label>
                    <div className="flex gap-2 mt-2 justify-center">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                id={`otp-${index}`}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-md"
                            />
                        ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2 justify-center">Enter the 6-digit code sent to your email</p>
                </div>

                <button
                    type="submit"
                    className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600"
                    disabled={loading || otp.some((digit) => !digit)}
                >
                    {loading ? "Verifying..." : "Verify Code"}
                </button>
            </form >

            <div className="text-center">
                <p className="text-sm text-gray-600">
                    Didn't receive the code?{" "}
                    <button
                        onClick={() => setCurrentStep(1)}
                        className="text-orange-600 hover:text-orange-500 font-medium"
                    >
                        Resend code
                    </button>
                </p>
            </div>
        </div >
    );

    const renderStep3 = () => (
        <div className="w-full max-w-md space-y-8">
            <div className="text-center">
                <a
                    onClick={() => setCurrentStep(2)}
                    className="inline-flex items-center gap-2 mb-8 text-gray-600 hover:text-gray-800 cursor-pointer"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="text-sm">Back</span>
                </a>
                <div className="flex items-center justify-center gap-2 mb-6">
                    <img
                        src={logo}
                        alt="PetWell Logo"
                        width={40}
                        height={40}
                        className="rounded-full bg-orange-500"
                    />
                    <span className="text-2xl font-bold text-orange-600">PetWell</span>
                </div>
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lock className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Create New Password</h1>
                <p className="text-gray-600 mt-2">
                    Your identity has been verified. Please create a new password for your account.
                </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                    <label htmlFor="newPassword" className="block text-gray-600">New Password</label>
                    <input
                        type="password"
                        id="newPassword"
                        className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md"
                        placeholder="Enter your new password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <p className="text-sm text-gray-500 mt-1">Password must be at least 8 characters long</p>
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block text-gray-600">Confirm New Password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md"
                        placeholder="Confirm your new password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600"
                    disabled={loading || newPassword !== confirmPassword}
                >
                    {loading ? "Updating Password..." : "Update Password"}
                </button>
            </form>
        </div>
    );

    return (
        <div className="min-h-screen flex">
            <ToastContainer position="top-center" />


            {/* Left Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
            </div>

            {/* Right Side - Image */}
            <div className="hidden lg:block lg:flex-1 relative">
                <img
                    src={login_image}
                    alt="Pet care"
                    className="object-cover w-full h-full"
                />
                <div className="absolute inset-0" />
                <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="text-center text-white">
                        {currentStep === 1 && (
                            <>
                                <h2 className="text-4xl font-bold mb-4">We're Here to Help</h2>
                                <p className="text-xl">Get back to caring for your pets in no time</p>
                            </>
                        )}
                        {currentStep === 2 && (
                            <>
                                <h2 className="text-4xl font-bold mb-4">Verify Your Identity</h2>
                                <p className="text-xl">We've sent a secure code to your email</p>
                            </>
                        )}
                        {currentStep === 3 && (
                            <>
                                <h2 className="text-4xl font-bold mb-4">Almost Done!</h2>
                                <p className="text-xl">Create a strong password to secure your account</p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
