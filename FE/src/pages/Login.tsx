import { useState } from "react";
import bgPattern from "@assets/bg-login.png";
import SummaryApi from "@common/SummarryAPI";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { setUserDetails } from "@store/userSlice";
import { useDispatch } from "react-redux";
import Axios from "@utils/Axios";
import { GoogleLogin } from "@react-oauth/google";
import logo from "@assets/logo.jpg";
import login_image from "@assets/login_image.jpg";
import { ArrowLeft } from "@mui/icons-material";
import fetchUserDetails from "@utils/fetchUserDetails";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await Axios({
        ...SummaryApi.login,
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
      });
      if (response.data.data.user.isBlock === true) {
        toast.error('Your account has been banned and cannot sign in.');
        return;
      }

      if (response.data.success) {
        toast.success("Welcome back! Login successful");
        const token = response.data.data.token;
        const userId = response.data.data.user.id;

        // Lưu token và userId vào localStorage
        localStorage.setItem("accesstoken", token);
        localStorage.setItem("userId", userId);

        try {
          // Gọi API lấy thông tin chi tiết user
          const userDetails = await fetchUserDetails(userId);

          // Cập nhật Redux với thông tin chi tiết
          dispatch(
            setUserDetails({
              userId: userId,
              fullName: userDetails.fullName || userDetails.name || "",
              email: userDetails.email || "",
              avatar: userDetails.avatar || "",
              role: userDetails.role || "",
              phone: userDetails.phone || "",
              address: userDetails.address || "",
              isVerified: userDetails.isVerified || false,
              token: token,
            })
          );
        } catch (error) {
          console.error("Error fetching user details:", error);
          // Fallback to basic user data if fetchUserDetails fails
          const userData = response.data.data.user;
          dispatch(
            setUserDetails({
              userId: userId,
              fullName: userData.fullName || userData.name || "",
              email: userData.email || "",
              avatar: userData.avatar || "",
              role: userData.role || "",
              phone: userData.phone || "",
              address: userData.address || "",
              isVerified: userData.isVerified || false,
              token: token,
            })
          );
        }

        // Xoá form
        setData({ email: "", password: "" });
        window.dispatchEvent(new Event("user-login"));

        // Chuyển hướng dựa trên role
        const role = response.data.data.user.role.toLowerCase();
        switch (role) {
          case "admin":
            navigate("/dashboardmanage/admin/user");
            break;
          case "manager":
            navigate("/dashboardmanage/manager/profile");
            break;
          case "staff":
            navigate("/dashboardmanage/staff/profile");
            break;
          default:
            navigate("/");
            break;
        }
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Login failed");
    }
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleGoogleLoginSuccess = async (credentialResponse: any) => {
    try {
      const idToken = credentialResponse?.credential;
      if (!idToken) {
        toast.error("Google ID token is missing!");
        console.error("credentialResponse:", credentialResponse);
        return;
      }
      const response = await Axios.post(SummaryApi.googleLogin.url, {
        idToken,
      }, {
        headers: {
          "Content-Type": "application/json",
        }
      });

      if (response.data.token) {
        const userId = response.data.user._id;
        const token = response.data.token;

        localStorage.setItem("userId", userId);
        localStorage.setItem("accesstoken", token);

        try {
          // Gọi API lấy thông tin chi tiết user
          const userDetails = await fetchUserDetails(userId);

          // Cập nhật Redux với thông tin chi tiết
          dispatch(
            setUserDetails({
              userId: userId,
              fullName: userDetails.fullName || userDetails.name || "",
              email: userDetails.email || "",
              avatar: userDetails.avatar || "",
              role: userDetails.role || "",
              phone: userDetails.phone || "",
              address: userDetails.address || "",
              isVerified: userDetails.isVerified || false,
              token: token,
            })
          );
        } catch (error) {
          console.error("Error fetching user details:", error);
          // Fallback to basic user data if fetchUserDetails fails
          const userData = response.data.user;
          dispatch(
            setUserDetails({
              userId: userId,
              fullName: userData.fullName || userData.name || "",
              email: userData.email || "",
              avatar: userData.avatar || "",
              role: userData.role || "",
              phone: userData.phone || "",
              address: userData.address || "",
              isVerified: userData.isVerified || false,
              token: token,
            })
          );
        }

        toast.success("Login with Google successful!");
        window.dispatchEvent(new Event("user-login"));
        navigate('/');
      } else {
        toast.error("Google login failed.");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Server error during Google login.");
    }
  };

  return (
    <div className="min-h-screen flex">
      <Toaster position="top-center" reverseOrder={false} />
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <a
              href="/"
              className="inline-flex items-center gap-2 mb-8 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to Home</span>
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
            <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-600 mt-2">
              Sign in to your account to continue
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-600">Email Address</label>
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={data.email}
                onChange={handleChange}
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:border-orange-500"
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label className="block text-gray-600">Password</label>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                value={data.password}
                onChange={handleChange}
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:border-orange-500"
                placeholder="Enter your password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 font-semibold transition"
            >
              Sign In
            </button>
            <div className="mt-4">
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={() => toast.error("Google login failed")}
              />
            </div>
          </form>
          <div className="flex justify-between items-center mt-2">
            <a href="/auth/forgot-password" className="text-orange-500 hover:underline text-sm">Forgot password?</a>
            <a href="/auth/register" className="text-orange-500 hover:underline text-sm">Register</a>
          </div>
        </div>
      </div>
      {/* Right Side - Image & Welcome */}
      <div className="hidden lg:block lg:flex-1 relative">
        <img
          src={login_image}
          alt="Pet care"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Welcome to PetWell</h2>
            <p className="text-xl">Your trusted partner in pet healthcare</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
