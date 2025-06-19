
import { useEffect, useState } from "react"
import { blockUnblockUser, fetchAllUsers } from "@utils/UsersAPI"
import { useSelector } from "react-redux"
import type { RootState } from "@store/store"
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DownloadIcon from '@mui/icons-material/Download';
import FilterListAltIcon from '@mui/icons-material/FilterListAlt';
import AddIcon from '@mui/icons-material/Add';
import CreateUserAccount from "./CreateUserAccount";

type User = {
    _id: string
    fullName: string
    phone: string
    email: string
    status: string
    avatar: string
    isBlock: boolean
    role: string
    isActive: boolean
    isVerified: boolean
}

const Users: React.FC = () => {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [selectedRole, setSelectedRole] = useState<string>("customer")
    const [currentPage, setCurrentPage] = useState<number>(1)
    const usersPerPage = 10
    const [showForm, setShowForm] = useState<boolean>(false)

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true)
            try {
                const data = await fetchAllUsers()
                console.log(data)
                setUsers(data)
            } catch (error) {
                console.error("Error fetching users:", error)
                setUsers([])
            } finally {
                setLoading(false)
            }
        }

        fetchUsers()
    }, [])

    const handleRoleChange = (role: string) => {
        setSelectedRole(role)
        setCurrentPage(1)
    }
    const currentUserRole = useSelector((state: RootState) => state.user.role.toLowerCase());

    const viewableRolesByRole: Record<string, string[]> = {
        admin: ["customer", "staff", "manager", "doctor"],
        manager: ["customer", "staff", "doctor"],
        staff: ["customer"],
    };

    const filteredUsers = users.filter((user) => {
        const userRole = user.role.toLowerCase();
        const selected = selectedRole.toLowerCase();
        const allowedRoles = viewableRolesByRole[currentUserRole] || [];
        return userRole === selected && allowedRoles.includes(userRole);
    });

    const roleTabs: string[] = ["customer", "staff", "manager", "doctor"];
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage)
    const currentUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage)
    const handlePageChange = (page: number) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page)
        }
    }
    const getPageNumbers = () => {
        const pageNumbers = []
        const maxPagesToShow = 5

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i)
            }
        } else {
            pageNumbers.push(1)
            let startPage = Math.max(2, currentPage - 1)
            let endPage = Math.min(totalPages - 1, currentPage + 1)
            if (currentPage <= 2) {
                endPage = 4
            } else if (currentPage >= totalPages - 1) {
                startPage = totalPages - 3
            }
            if (startPage > 2) {
                pageNumbers.push("...")
            }
            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i)
            }
            if (endPage < totalPages - 1) {
                pageNumbers.push("...")
            }
            if (totalPages > 1) {
                pageNumbers.push(totalPages)
            }
        }

        return pageNumbers
    }

    const userToken = useSelector((state: RootState) => state.user.token)


    const handleBanUnban = async (userId: string, isBlock: boolean) => {
        try {
            const result = await blockUnblockUser(userId, !isBlock, userToken)
            if (result.success) {
                setUsers((prevUsers) => prevUsers.map((user) => (user._id === userId ? { ...user, isBlock: !isBlock } : user)))
            }
        } catch (error) {
            console.error("Error during ban/unban:", error)
        }
    }

    return (

        <div className="min-h-screen-full mt-6 bg-gray-50">
            {/* Header with Stats */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex space-x-8">
                    <div className="flex bg-white rounded-lg p-1 shadow-sm text-sm">
                        {roleTabs
                            .filter((role) => viewableRolesByRole[currentUserRole]?.includes(role)) // ✅ Chỉ giữ các role được xem
                            .map((role) => (
                                <button
                                    key={role}
                                    className={`px-4 py-2 ${selectedRole === role ? "bg-gray-200 text-gray-900" : "text-gray-600 hover:text-gray-900"
                                        } rounded-md`}
                                    onClick={() => handleRoleChange(role)}
                                >
                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                </button>
                            ))}

                    </div>

                </div>



                <div className="flex space-x-3">
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center text-xs"
                    >
                        <span className="mr-2"><AddIcon /></span>
                        Add new
                    </button>

                    <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center text-xs">
                        <span className="mr-2"><FileUploadIcon /></span>
                        Import members
                    </button>
                    <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center text-xs">
                        <span className="mr-2"><DownloadIcon /></span>
                        Export members (Excel)
                    </button>
                    <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center text-xs">
                        <span className="mr-2"><FilterListAltIcon /></span>
                        Filter
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Avatar</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Member name</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Phone</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                                    <th className="text-center py-3 px-4 font-medium text-gray-700">Status</th>
                                    <th className="text-center py-3 px-4 font-medium text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentUsers.length > 0 ? (
                                    currentUsers.map((user, index) => (
                                        <tr
                                            key={user._id}
                                            className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                                        >
                                            <td className="py-3 px-4">
                                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                                    {user.avatar ? (
                                                        <img
                                                            src={user.avatar || "/placeholder.svg"}
                                                            alt={user.fullName}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement
                                                                target.style.display = "none"
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-medium">
                                                            {user.fullName
                                                                .split(" ")
                                                                .map((n) => n[0])
                                                                .join("")}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="py-3 px-4 font-medium text-gray-900">{user.fullName}</td>
                                            <td className="py-3 px-4 text-gray-700">{user.phone || "-"}</td>
                                            <td className="py-3 px-4 text-gray-700 max-w-[200px] truncate">{user.email}</td>
                                            <td className="py-3 px-4 text-center">
                                                <div className="flex justify-center">
                                                    <span
                                                        className={`inline-flex items-center justify-center w-16 h-6 px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isVerified ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
                                                            }`}
                                                    >
                                                        {user.isVerified ? "Active" : "Unactive"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <div className="flex justify-center">
                                                    <button
                                                        onClick={() => handleBanUnban(user._id, user.isBlock)} // Call handleBanUnban on click
                                                        className={`inline-flex items-center justify-center w-16 h-6 px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-300 ${user.isBlock ? "bg-red-200 text-red-800" : "bg-green-200 text-green-800"}`}
                                                        title={user.isBlock ? "Unban" : "Ban"}
                                                    >
                                                        {/* Display Ban or Unban based on user block status */}
                                                        {user.isBlock ? "Unban" : "Ban"}
                                                    </button>
                                                </div>
                                            </td>


                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-gray-500">
                                            No users found for this role.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {!loading && filteredUsers.length > 0 && (
                <div className="flex justify-between items-center mt-6">
                    <button
                        className={`flex items-center px-3 py-2 ${currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:text-gray-900"
                            }`}
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <span className="mr-1">←</span>
                        Previous
                    </button>

                    <div className="flex space-x-2">
                        {getPageNumbers().map((page, index) =>
                            page === "..." ? (
                                <span key={`ellipsis-${index}`} className="flex items-center px-2">
                                    ...
                                </span>
                            ) : (
                                <button
                                    key={`page-${page}`}
                                    className={`w-8 h-8 rounded ${currentPage === page ? "bg-purple-600 text-white" : "text-gray-600 hover:bg-gray-100"
                                        }`}
                                    onClick={() => handlePageChange(page as number)}
                                >
                                    {String(page).padStart(2,)}
                                </button>
                            ),
                        )}
                    </div>

                    <button
                        className={`flex items-center px-3 py-2 ${currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:text-gray-900"
                            }`}
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Next
                        <span className="ml-1">→</span>
                    </button>
                </div>
            )}
            {showForm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
                    <div className="rounded-lg max-w-3xl w-full ">
                        <CreateUserAccount onClose={() => setShowForm(false)} />
                    </div>
                </div>
            )}
        </div>
    )
}

export default Users