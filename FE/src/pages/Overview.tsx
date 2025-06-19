import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@store/store";
import {
  FaCalendarAlt,
  FaPlus,
  FaFileMedical,
  FaDownload,
  FaEdit,
  FaTimes,
  FaEye,
  FaLock,
  FaEyeSlash,
} from "react-icons/fa";
import Axios from "@utils/Axios";
import SummaryApi from "@common/SummarryAPI";
import toast from "react-hot-toast";
import { setUserDetails } from "@store/userSlice";
import AppointmentForm from "@components/AppointmentForm";

const mockActivities = [
  {
    icon: (
      <span className="text-green-400">
        <FaFileMedical />
      </span>
    ),
    text: "Max's dental cleaning completed",
    date: "January 15, 2024",
  },
  {
    icon: (
      <span className="text-blue-400">
        <FaCalendarAlt />
      </span>
    ),
    text: "Appointment scheduled for Luna",
    date: "March 15, 2024",
  },
  {
    icon: (
      <span className="text-purple-400">
        <FaFileMedical />
      </span>
    ),
    text: "Vaccination reminder sent",
    date: "January 10, 2024",
  },
];

const mockAppointments = [
  {
    title: "General Check-up",
    pet: "Max",
    doctor: "Dr. Sarah Smith",
    date: "2/20/2024 at 10:00 AM",
  },
  {
    title: "Vaccination",
    pet: "Luna",
    doctor: "Dr. Michael Johnson",
    date: "3/15/2024 at 2:30 PM",
  },
];

const Overview = () => {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user.fullName || "",
    email: user.email || "",
    phone: user.phone || "",
    address: user.address || "",
  });
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [openAppointmentForm, setOpenAppointmentForm] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await Axios({
        ...SummaryApi.updateProfile(user.userId),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        data: formData,
      });

      if (response.data.success) {
        toast.success("Profile updated successfully!");
        dispatch(
          setUserDetails({
            ...response.data.data,
            token: user.token,
            userId: user.userId,
          })
        );
        setEditMode(false);
      } else {
        toast.error(response.data.message || "Update failed.");
      }
    } catch (error) {
      toast.error("Error updating profile.");
    }

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      toast.error("Please fill in all fields!");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const response = await Axios({
        ...SummaryApi.changePassword(),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        data: {
          userId: user.userId,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
      });

      if (response.data.success) {
        toast.success("Password changed successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(response.data.message || "Failed to change password");
      }
    } catch (err: any) {
      toast.error("Current password is incorrect!");
    }

    setLoading(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 mt-6">
      {/* Left: Personal Info & Appointments */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-xl p-6 shadow border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Personal Information</h2>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-1 text-orange-500 hover:underline"
              >
                <FaEdit /> Edit
              </button>
            )}
          </div>
          {editMode ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  className="bg-orange-500 text-white px-4 py-2 rounded flex items-center gap-2"
                >
                  <FaEdit /> Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="border px-4 py-2 rounded flex items-center gap-2"
                >
                  <FaTimes /> Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-2">
              <div>
                <span className="font-medium">Full Name:</span> {user.fullName}
              </div>
              <div>
                <span className="font-medium">Email:</span> {user.email}
              </div>
              <div>
                <span className="font-medium">Phone:</span> {user.phone}
              </div>
              <div>
                <span className="font-medium">Address:</span> {user.address}
              </div>
            </div>
          )}
        </div>
        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl p-6 shadow border">
          <h2 className="text-xl font-bold mb-4">Upcoming Appointments</h2>
          <div className="flex flex-col gap-4">
            {mockAppointments.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col md:flex-row md:items-center justify-between bg-gray-50 rounded-lg p-4 border"
              >
                <div className="flex items-center gap-3">
                  <FaCalendarAlt className="text-orange-500 text-2xl" />
                  <div>
                    <div className="font-semibold">{item.title}</div>
                    <div className="text-sm text-gray-500">
                      {item.pet} • {item.doctor}
                    </div>
                    <div className="text-xs text-gray-400">{item.date}</div>
                  </div>
                </div>
                <div className="flex gap-2 mt-2 md:mt-0">
                  <button className="border px-3 py-1 rounded flex items-center gap-1 text-gray-600">
                    <FaEdit /> Reschedule
                  </button>
                  <button className="border px-3 py-1 rounded flex items-center gap-1 text-gray-600">
                    <FaEye /> View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Right: Quick Actions & Recent Activity */}
      <div className="w-full lg:w-[340px] flex flex-col gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow border flex flex-col gap-3">
          <h2 className="text-lg font-bold mb-2">Quick Actions</h2>
          <button
            onClick={() => setOpenAppointmentForm(true)}
            className="bg-orange-500 text-white w-full py-2 rounded flex items-center justify-center gap-2 font-semibold"
          >
            <FaCalendarAlt /> Book Appointment
          </button>
          <button className="border w-full py-2 rounded flex items-center justify-center gap-2 font-semibold">
            <FaPlus /> Add New Pet
          </button>
          <button className="border w-full py-2 rounded flex items-center justify-center gap-2 font-semibold">
            <FaFileMedical /> View Medical Records
          </button>
          <button className="border w-full py-2 rounded flex items-center justify-center gap-2 font-semibold">
            <FaDownload /> Download Reports
          </button>
        </div>
        {openAppointmentForm && (
          <AppointmentForm
            open={openAppointmentForm}
            onClose={() => setOpenAppointmentForm(false)}
          />
        )}
        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow border">
          <h2 className="text-lg font-bold mb-2">Change Password</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Changing Password..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Overview;
