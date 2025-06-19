import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Axios from "../../utils/Axios";
import SummaryApi from "../../common/SummarryAPI";

const PaymentResult: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState<"pending" | "success" | "fail">("pending");
    const [message, setMessage] = useState("");
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const query = location.search;
        if (!query) {
            setStatus("fail");
            setMessage("Payment information not found.");
            return;
        }
        // Call backend API to verify payment result
        Axios({
            ...SummaryApi.payment.verifyVnpayReturn,
            url: SummaryApi.payment.verifyVnpayReturn.url + query
        })
            .then((res) => {
                if (res.data.success) {
                    setStatus("success");
                    setMessage("Payment successful! Your appointment has been confirmed.");
                } else {
                    setStatus("fail");
                    // Check for already paid or existing order error
                    if (res.data.message?.toLowerCase().includes("đã thanh toán") || res.data.message?.toLowerCase().includes("tồn tại")) {
                        setMessage(res.data.message + "\nYou will be redirected to the homepage in 5 seconds.");
                    } else {
                        setMessage((res.data.message || "Payment failed.") + "\nYou will be redirected to the homepage in 5 seconds.");
                    }
                }
            })
            .catch((err) => {
                setStatus("fail");
                setMessage(
                    (err?.response?.data?.message || "An error occurred while verifying payment.") + "\nYou will be redirected to the homepage in 5 seconds."
                );
            });
    }, [location.search]);

    // Countdown and auto-redirect if not pending
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (status !== "pending" && countdown > 0) {
            timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
        } else if (status !== "pending" && countdown === 0) {
            navigate("/");
        }
        return () => clearTimeout(timer);
    }, [status, countdown, navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-orange-200 animate-fadeIn">
                {status === "pending" && (
                    <>
                        <div className="flex flex-col items-center mb-4">
                            <svg width="64" height="64" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#f59e42" strokeWidth="2" fill="#fffbe6" /><path d="M12 8v4l2 2" stroke="#f59e42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </div>
                        <div className="text-lg font-semibold text-orange-600 mb-2">Verifying payment...</div>
                        <div className="text-gray-500">Please wait a moment.</div>
                    </>
                )}
                {status === "success" && (
                    <>
                        <div className="flex flex-col items-center mb-4">
                            <svg width="64" height="64" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#22c55e" strokeWidth="2" fill="#e7fbe7" /><path d="M8 12l3 3 5-5" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </div>
                        <div className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</div>
                        <div className="text-gray-700 mb-4">{message}</div>
                        <div className="text-sm text-gray-400 mb-2">Redirecting to homepage in <span className="font-semibold">{countdown}</span> seconds.</div>
                        <button
                            className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-orange-600 transition"
                            onClick={() => navigate("/")}
                        >
                            Go to Homepage Now
                        </button>
                    </>
                )}
                {status === "fail" && (
                    <>
                        <div className="flex flex-col items-center mb-4">
                            <svg width="64" height="64" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2" fill="#ffeaea" /><path d="M15 9l-6 6M9 9l6 6" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </div>
                        <div className="text-2xl font-bold text-red-600 mb-2">Payment Failed</div>
                        <div className="text-gray-700 whitespace-pre-line mb-4">{message}</div>
                        <div className="text-sm text-gray-400 mb-2">Redirecting to homepage in <span className="font-semibold">{countdown}</span> seconds.</div>
                        <button
                            className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-orange-600 transition"
                            onClick={() => navigate("/")}
                        >
                            Go to Homepage Now
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentResult; 