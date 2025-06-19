import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { logout } from "../store/userSlice"
import { useDispatch } from "react-redux"
import { useSelector } from "react-redux"
import { RootState } from "@store/store"
import PersonIcon from '@mui/icons-material/Person';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LogoutIcon from '@mui/icons-material/Logout';
const AccountMenu = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const userFullName = useSelector((state: RootState) => state.user.fullName)
    const userAvatar = useSelector((state: RootState) => state.user.avatar)
    useEffect(() => {
        const token = localStorage.getItem("accesstoken")
        setIsLoggedIn(!!token)

    }, [])

    const handleLogout = () => {
        localStorage.removeItem("accesstoken")
        localStorage.removeItem("userData")
        dispatch(logout())
        setIsLoggedIn(false)
        setShowDropdown(false)
        navigate("/")
    }

    if (!isLoggedIn) {
        return (
            <div className="flex items-center gap-3">

                <Link
                    to="/auth/login"
                    className="flex items-center gap-1 text-gray-700 hover:text-orange-500 transition-colors"
                >
                    <PersonIcon />
                    Login
                </Link>

            </div>
        )
    }

    return (

        <div className="relative">
            <div className="flex items-center gap-3">

                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 text-gray-700 hover:text-orange-500 transition-colors"
                >
                    {userAvatar ? (
                        <img
                            src={userAvatar}
                            alt="User Avatar"
                            className="w-8 h-8 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">
                            {userFullName?.trim().split(" ").slice(-1)[0]?.charAt(0).toUpperCase() || "U"}
                        </div>
                    )}
                    <span>{userFullName || "User"}</span>

                    <svg
                        className={`w-4 h-4 transition-transform ${showDropdown ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {showDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                        <Link
                            to="/dashboard/profile"
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-200 transition-colors"
                            onClick={() => setShowDropdown(false)}
                        >
                            <PersonOutlineIcon />
                            Profile
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-200 transition-colors w-full text-left"
                        >
                            <LogoutIcon />
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AccountMenu
