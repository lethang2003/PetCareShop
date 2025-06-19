import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bgPattern from '@assets/bg-login.png';
import Axios from '@utils/Axios';
import SummaryApi from '@common/SummarryAPI';
import toast, { Toaster } from 'react-hot-toast';
import AxiosToastError from '@utils/AxiosToastError';
import logo from "@assets/logo.jpg";
import login_image from "@assets/login_image.jpg";
import { ArrowLeft } from "@mui/icons-material";

const Register = () => {
    const navigate = useNavigate();
    const [data, setData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setData((prev) => ({ ...prev, [name]: value }));
    };

    const isValid = Object.values(data).every((v) => v.trim() !== '');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (data.password !== data.confirmPassword) {
            toast.error('Password confirmation does not match!');
            return;
        }

        try {
            const response = await Axios({
                ...SummaryApi.register,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    fullName: data.fullName,
                    email: data.email,
                    phone: data.phone,
                    password: data.password
                }
            });
            if (response.data.success) {
                toast.success(response.data.message || 'Registration successful! Please sign in.');
                setTimeout(() => {
                    navigate('/auth/login');
                }, 2000)
            }
            if (!response.data.success) {
                toast.error(response.data.message || 'Registration failed.');
                return;
            }
        } catch (err) {
            AxiosToastError(err);
        }
    };

    return (
        <div className="h-screen w-screen flex overflow-hidden">
            <Toaster position="top-center" reverseOrder={false} />
            {/* Left Side - Image & Welcome */}
            <div className="hidden lg:flex lg:flex-1 relative items-center justify-center">
                <img
                    src={login_image}
                    alt="Pet care"
                    className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="text-center text-white">
                        <h2 className="text-3xl font-bold mb-2">Join PetWell Family</h2>
                        <p className="text-base">Start your pet's healthcare journey with us</p>
                    </div>
                </div>
            </div>
            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-0 bg-white">
                <div className="w-full max-w-sm space-y-6">
                    <div className="flex flex-col items-center mb-2">
                        <img
                            src={logo}
                            alt="PetWell Logo"
                            width={40}
                            height={40}
                            className="rounded-full bg-orange-500 mb-2"
                        />
                        <span className="text-xl font-bold text-orange-600 mb-1">PetWell</span>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">Register Account</h1>
                        <p className="text-gray-600 text-sm text-center">Join us to provide the best care for your pets</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-600 text-sm">Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                value={data.fullName}
                                onChange={handleChange}
                                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:border-orange-500 text-sm"
                                placeholder="Enter your full name"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-600 text-sm">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={data.email}
                                onChange={handleChange}
                                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:border-orange-500 text-sm"
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-600 text-sm">Phone Number</label>
                            <input
                                type="text"
                                name="phone"
                                value={data.phone}
                                onChange={handleChange}
                                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:border-orange-500 text-sm"
                                placeholder="Enter your phone number"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-600 text-sm">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={data.password}
                                onChange={handleChange}
                                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:border-orange-500 text-sm"
                                placeholder="Create a strong password"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-600 text-sm">Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={data.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:border-orange-500 text-sm"
                                placeholder="Confirm your password"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!isValid}
                            className={`w-full py-2 rounded text-white font-semibold transition text-sm ${isValid
                                ? 'bg-orange-500 hover:bg-orange-600'
                                : 'bg-gray-400 cursor-not-allowed'
                                }`}
                        >
                            Create Account
                        </button>
                    </form>
                    <p className="text-center text-sm text-gray-600">
                        Already have an account?
                        <a href="/auth/login" className="text-orange-500 hover:underline ml-1">
                            Sign in
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
