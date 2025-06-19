import { Routes, Route, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "@store/store"
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import GroupIcon from '@mui/icons-material/Group';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PaidIcon from '@mui/icons-material/Paid';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ScheduleIcon from '@mui/icons-material/Schedule';
import LogoutIcon from '@mui/icons-material/Logout';

import Users from "@pages/Users"
import { logout } from "@store/userSlice"
import ClinicManagement from "@pages/admin/ClinicManagement";
import CreateClinic from "@pages/admin/CreateClinic";
import UpdateClinic from "@pages/admin/UpdateClinic";
import WorkSchedulesStaff from "@pages/WorkSchedulesStaff";

interface DashboardManageProps {
    role: 'admin' | 'manager' | 'staff';
}

const DashboardManage: React.FC<DashboardManageProps> = ({ role }) => {
    const userFullName = useSelector((state: RootState) => state.user.fullName)
    const userAvatar = useSelector((state: RootState) => state.user.avatar)
    const userRole = useSelector((state: RootState) => state.user.role)
    const dispatch = useDispatch();
    const navigate = useNavigate()

    const sidebarItemsByRole: Record<string, any[]> = {
        admin: [
            { icon: <GroupIcon />, label: "Users", path: "/dashboardmanage/admin/user" },
            { icon: <LocalHospitalIcon />, label: "Clinic", path: "/dashboardmanage/admin/clinic" },
            { icon: <PaidIcon />, label: "Revenue", path: "/dashboardmanage/admin/revenue" },
        ],
        manager: [
            { icon: <AccountCircleIcon />, label: "Profile", path: "/dashboardmanage/manager/profile" },
            { icon: <GroupIcon />, label: "Users", path: "/dashboardmanage/manager/user" },
            { icon: <PaidIcon />, label: "Revenue", path: "/dashboardmanage/manager/revenue" },
            { icon: <LocalOfferIcon />, label: "Discount", path: "/dashboardmanage/manager/discount" },
        ],
        staff: [
            { icon: <AccountCircleIcon />, label: "Profile", path: "/dashboardmanage/staff/profile" },
            { icon: <EventAvailableIcon />, label: "Appointment", path: "/dashboardmanage/staff/appointment" },
            { icon: <Inventory2Icon />, label: "Product", path: "/dashboardmanage/staff/product" },
            { icon: <ScheduleIcon />, label: "Work Schedule", path: "/dashboardmanage/staff/work-schedule" },
        ],
    };

    const sidebarItems = [
        ...sidebarItemsByRole[role],
        { icon: <LogoutIcon />, label: "Logout", path: "#", isLogout: true },
    ];

    const handleLogout = () => {
        localStorage.removeItem("accesstoken")
        localStorage.removeItem("userId")
        dispatch(logout())
        navigate("/")
    }

    return (
<div className="flex h-screen bg-gray-50">
            <div className="w-64 h-full bg-gradient-to-b from-orange-500 to-red-500 text-white flex flex-col">
                <div className="p-6 flex-shrink-0">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                            <div className="w-4 h-4 bg-orange-500 rounded"></div>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">{(userRole || "role").toUpperCase()}</h1>
                            <p className="text-sm opacity-80">Dashboard</p>
                        </div>
                    </div>
                </div>
                <nav className="mt-8 flex-1 overflow-y-auto">
                    {sidebarItems.map((item, index) => (
                        <a
                            key={index}
                            href={item.path}
                            className={`flex items-center space-x-3 px-6 py-3 text-sm hover:bg-white/10 transition-colors`}
                            onClick={(e) => {
                                if (item.isLogout) {
                                    e.preventDefault()
                                    handleLogout()
                                }
                            }}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </a>
                    ))}
                </nav>
            </div>
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <header className="bg-white border-b px-6 py-4 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <input type="text" placeholder="Search..." className="border rounded-lg p-2 w-64 pl-10" />
                            </div>
                        </div>

                        <div className="relative">
                            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-200 rounded-lg">
                                <img src={userAvatar || "/placeholder.svg"} alt="User Avatar" className="w-8 h-8 rounded-full" />
                                <span>{userFullName || "User"}</span>
                            </button>
                        </div>
                    </div>
                </header>
                <div className="flex-1 p-4 overflow-y-auto">
                    <Routes>
                        <Route path="/user" element={<Users />} />
                        <Route path="/clinic" element={<ClinicManagement />} />
                        <Route path="/clinic/create" element={<CreateClinic />} />
                        <Route path="/clinic/update/:id" element={<UpdateClinic />} />
                        {/* <Route path="/campaigns" element={<Campaigns />} />
                        <Route path="/projects" element={<Projects />} /> */}
                        {/* Add additional routes as needed */}
                        <Route path="/work-schedule" element={<WorkSchedulesStaff />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default DashboardManage;