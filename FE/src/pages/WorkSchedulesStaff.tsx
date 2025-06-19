import React, { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  Home,
  ArrowLeftRight,
  X,
  Edit,
  Trash2,
  Plus,
  Save,
  RefreshCcw,
} from "lucide-react";
import { DateTime } from "luxon";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  fetchAllSchedules,
  createSchedule,
  deleteSchedule,
  updateSchedule,
  WorkSchedule,
} from "../utils/workSchedules";
// Main component
const WorkSchedules = () => {
  const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState<WorkSchedule | null>(
    null
  );
  const [formData, setFormData] = useState({
    storeId: "",
    work_Date: "",
    start_time: "",
    end_time: "",
    status: "opening",
  });
  const [stores, setStores] = useState([]);
  const [originalDate, setOriginalDate] = useState("");
  const [originalStartTime, setOriginalStartTime] = useState("");
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0]; // yyyy-mm-dd
  const nowStr = today.toTimeString().slice(0, 5); // HH:mm

  // Fetch all schedules
  const fetchSchedules = async () => {
    setLoading(true);
    try {
      // This would be replaced with your actual API call
      const response = await fetchAllSchedules();

      if (response) {
        setSchedules(response);
      } else {
        setError("Failed to fetch schedules");
      }
    } catch (err) {
      setError("Error fetching schedules: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchClinic = async () => {
    setLoading(true);
    try {
      // This would be replaced with your actual API call
      const response = await fetch(
        "http://localhost:5001/api/v1/clinic/getall"
      );
      const result = await response.json();
      console.log(result);

      if (result.success) {
        setStores(result.data);
      } else {
        setError(result.message || "Failed to fetch schedules");
      }
    } catch (err) {
      setError("Error fetching schedules: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Mock doctors and stores for demo purposes
  useEffect(() => {
    fetchSchedules();
    fetchClinic();
    // For demo, we'll use the provided JSON data
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    return DateTime.fromISO(timeString, { zone: "utc" }) // dữ liệu lưu là UTC
      .setZone("Asia/Ho_Chi_Minh") // ép về giờ VN
      .toFormat("HH:mm");
  };

  // Format date for input
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
    }); // đúng chuẩn YYYY-MM-DD
  };

  // Format time for input
  const formatTimeForInput = (timeString: string) => {
    return DateTime.fromISO(timeString, { zone: "utc" })
      .setZone("Asia/Ho_Chi_Minh")
      .toFormat("HH:mm");
  };

  // Validate for add
  const validateForm = (data) => {
    if (!data.work_Date) {
      toast.error("Please select a work date!");
      return false;
    }
    if (!data.start_time) {
      toast.error("Please select a start time!");
      return false;
    }
    if (!data.end_time) {
      toast.error("Please select an end time!");
      return false;
    }
    if (data.work_Date < todayStr) {
      toast.error("Cannot select a date in the past!");
      return false;
    }
    if (data.work_Date === todayStr && data.start_time < nowStr) {
      toast.error(`Start time must be ${nowStr} or later.`);
      return false;
    }
    if (data.end_time <= data.start_time) {
      toast.error("End time must be after start time!");
      return false;
    }
    return true;
  };

  // Validate for edit
  const validateFormEdit = (data) => {
    if (!data.work_Date) {
      toast.error("Please select a work date!");
      return false;
    }
    if (!data.start_time) {
      toast.error("Please select a start time!");
      return false;
    }
    if (!data.end_time) {
      toast.error("Please select an end time!");
      return false;
    }
    // Only check past if user changed date or start_time
    if (
      (data.work_Date !== originalDate || data.start_time !== originalStartTime) &&
      data.work_Date === todayStr &&
      data.start_time < nowStr
    ) {
      toast.error(`Start time must be ${nowStr} or later.`);
      return false;
    }
    if (data.end_time <= data.start_time) {
      toast.error("End time must be after start time!");
      return false;
    }
    return true;
  };

  // Add new schedule
  const handleAddSchedule = async (e) => {
    e.preventDefault();
    if (!validateForm(formData)) return;

    try {
      // Get the date and time inputs from the form
      const workDate = formData.work_Date; // This is in YYYY-MM-DD format
      const startTimeInput = formData.start_time; // This is in HH:MM format
      const endTimeInput = formData.end_time; // This is in HH:MM format

      // When combining date and time, specify that it's in Vietnam timezone
      const startDateTime = DateTime.fromFormat(
        `${workDate} ${startTimeInput}`,
        "yyyy-MM-dd HH:mm",
        { zone: "Asia/Ho_Chi_Minh" }
      );

      const endDateTime = DateTime.fromFormat(
        `${workDate} ${endTimeInput}`,
        "yyyy-MM-dd HH:mm",
        { zone: "Asia/Ho_Chi_Minh" }
      );

      // Convert to UTC for storage in database
      const start_time = startDateTime.toISO();
      const end_time = endDateTime.toISO();

      const newSchedule = {
        storeId: stores.find((s) => s._id === formData.storeId),
        work_Date: formData.work_Date,
        start_time: start_time,
        end_time: end_time,
        status: formData.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const response = await createSchedule(newSchedule);
      if (response) {
        fetchSchedules(); // Refresh schedules after adding
        toast.success("Create schedule successful!");
      } else {
        toast.error("Failed to create schedule");
      }
      setIsAddModalOpen(false);
      setFormData({
        storeId: "",
        work_Date: "",
        start_time: "",
        end_time: "",
        status: "opening",
      });
    } catch (err) {
      toast.error("Error adding schedule: " + err.message);
    }
  };

  // Edit schedule
  const handleEditSchedule = async (e) => {
    e.preventDefault();
    if (!validateFormEdit(formData)) return;
    try {
      const workDate =
        formData.work_Date || formatDateForInput(currentSchedule.work_Date);
      const startTime =
        formData.start_time || formatTimeForInput(currentSchedule.start_time);
      const endTime =
        formData.end_time || formatTimeForInput(currentSchedule.end_time);
      const startDateTime = DateTime.fromFormat(
        `${workDate} ${startTime}`,
        "yyyy-MM-dd HH:mm",
        { zone: "Asia/Ho_Chi_Minh" }
      );
      const endDateTime = DateTime.fromFormat(
        `${workDate} ${endTime}`,
        "yyyy-MM-dd HH:mm",
        { zone: "Asia/Ho_Chi_Minh" }
      );

      const start_time = startDateTime.toISO();
      const end_time = endDateTime.toISO();
      const updatedSchedule = {
        ...currentSchedule,
        storeId:
          stores.find((s) => s._id === formData.storeId) ||
          currentSchedule?.storeId,
        work_Date: workDate,
        start_time: start_time,
        end_time: end_time,
        status: formData.status || currentSchedule.status,
        updatedAt: new Date().toISOString(),
      };
      // This would be replaced with your actual API call
      const response = await updateSchedule(
        currentSchedule._id,
        updatedSchedule
      );
      if (response) {
        fetchSchedules(); // Refresh schedules after adding
        toast.success("Update schedule successful!");
      } else {
        toast.error("Failed to update schedule");
      }

      setIsEditModalOpen(false);
      setCurrentSchedule(null);
      setFormData({
        storeId: "",
        work_Date: "",
        start_time: "",
        end_time: "",
        status: "opening",
      });
    } catch (err) {
      toast.error("Error updating schedule: " + err.message);
    }
  };

  // Delete schedule
  const handleDeleteSchedule = async () => {
    try {
      //   This would be replaced with your actual API call
      const response = await deleteSchedule(currentSchedule._id);
      if (response) {
        toast.success("Delete schedule successful!");
        fetchSchedules(); // Refresh schedules after adding
      } else {
        toast.error("Failed to delete schedule");
      }
      // For demo purposes
      setIsDeleteModalOpen(false);
      setCurrentSchedule(null);
    } catch (err) {
      setError("Error deleting schedule: " + err.message);
    }
  };

  // Open edit modal with current schedule data
  const openEditModal = (schedule: WorkSchedule) => {
    setCurrentSchedule(schedule);
    setFormData({
      id: schedule._id,
      storeId: schedule.storeId._id,
      work_Date: formatDateForInput(schedule.work_Date),
      start_time: formatTimeForInput(schedule.start_time),
      end_time: formatTimeForInput(schedule.end_time),
      status: schedule.status,
    });
    setOriginalDate(formatDateForInput(schedule.work_Date));
    setOriginalStartTime(formatTimeForInput(schedule.start_time));
    setIsEditModalOpen(true);
  };

  // Open delete confirmation modal
  const openDeleteModal = (schedule: WorkSchedule) => {
    setCurrentSchedule(schedule);
    setIsDeleteModalOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white min-h-screen">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="min-h-screen flex flex-col">
        {/* Main content - flex-grow-1 sẽ chiếm hết không gian còn lại */}
        <main className="flex-grow bg-[#fff9f5]">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-[#663300] relative inline-block after:content-[''] after:absolute after:w-1/2 after:h-1 after:bg-[#e67e22]/30 after:bottom-0 after:left-0 after:-mb-1">
                  Work Schedules
                </h1>
                <p className="text-[#996633] mt-2 font-medium">
                  Manage doctor schedules across all stores
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => fetchSchedules()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#f8d7b6] text-[#663300] hover:bg-[#f5c79a] transition-all duration-300 shadow-sm hover:-translate-y-0.5"
                >
                  <RefreshCcw size={16} />
                  Refresh
                </button>

                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#e67e22] text-white hover:bg-[#d35400] transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  <Plus size={16} />
                  Add Schedule
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg border-l-4 border-red-500 shadow-sm flex justify-between items-center">
                <div>{error}</div>
                <button
                  className="ml-2 p-1.5 rounded-full text-red-600 hover:text-red-800 hover:bg-red-200"
                  onClick={() => setError(null)}
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Schedules list */}
            {loading ? (
              <div className="flex flex-col justify-center items-center h-64 gap-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e67e22]"></div>
                <p className="text-[#996633] font-medium">
                  Loading schedules...
                </p>
              </div>
            ) : schedules.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-8 text-center border border-amber-100">
                <Calendar
                  size={48}
                  className="mx-auto text-[#e67e22]/60 mb-4"
                />
                <p className="text-lg text-gray-600 mb-2">No schedules found</p>
                <p className="text-gray-500 mb-4">
                  Add your first schedule to get started
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-2 px-5 py-2.5 bg-[#e67e22] text-white rounded-lg hover:bg-[#d35400] transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <Plus size={18} className="inline mr-2" />
                  Add Your First Schedule
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {schedules.map((schedule) => (
                  <div
                    key={schedule._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-[#e67e22] hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="p-5">
                      {schedule.doctorId ? (
                        <div className="text-[#663300] mb-2">
                          👨‍⚕️ <span className="font-semibold">Doctor:</span>{" "}
                          {schedule.doctorId.fullName}
                        </div>
                      ) : (
                        <div className="text-gray-500 mb-2 italic">
                          👨‍⚕️ No doctors registered yet!
                        </div>
                      )}

                      <div className="flex justify-between items-start mb-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            schedule.status === "opening"
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : schedule.status === "closed"
                              ? "bg-red-100 text-red-800 border border-red-200"
                              : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                          }`}
                        >
                          {schedule.status === "opening"
                            ? "Opening"
                            : schedule.status === "closed"
                            ? "Closed"
                            : schedule.status.charAt(0).toUpperCase() +
                              schedule.status.slice(1)}
                        </span>
                      </div>

                      <div className="bg-[#f8f8f8] p-3 rounded-lg mb-3">
                        <p className="text-[#996633] flex items-center">
                          <Home size={16} className="mr-2 text-[#e67e22]" />
                          <span className="font-medium">Store:</span>{" "}
                          <span className="ml-1">
                            {schedule.storeId?.name || "PetCare 3"}
                          </span>
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                        <div className="flex items-center text-gray-600 bg-[#f8f8f8] p-3 rounded-lg">
                          <Calendar size={16} className="mr-2 text-[#e67e22]" />
                          <span>
                            {formatDate(schedule.work_Date) || "10/4/2025"}
                          </span>
                        </div>

                        <div className="flex items-center text-gray-600 bg-[#f8f8f8] p-3 rounded-lg">
                          <Clock size={16} className="mr-2 text-[#e67e22]" />
                          <span>
                            {formatTime(schedule.start_time) || "18:00"} -{" "}
                            {formatTime(schedule.end_time) || "20:00"}
                          </span>
                        </div>
                      </div>

                      {schedule.swappedWith && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm text-blue-700 flex items-center border border-blue-100">
                          <ArrowLeftRight size={16} className="mr-2" />
                          Swapped with another schedule
                        </div>
                      )}
                    </div>

                    <div className="bg-[#f8f0e9] px-5 py-3 flex justify-end gap-2 border-t border-[#f5e9dc]">
                      <button
                        onClick={() => openEditModal(schedule)}
                        className="p-2 rounded-lg text-[#e67e22] hover:bg-[#f5c79a] transition-colors"
                        title="Edit schedule"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(schedule)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete schedule"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add Schedule Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-[#663300]">
                Add New Schedule
              </h3>
            </div>

            <form onSubmit={handleAddSchedule}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Store
                  </label>
                  <select
                    name="storeId"
                    value={formData.storeId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e67e22]"
                  >
                    <option value="">Select Store</option>
                    {stores.map((store) => (
                      <option key={store._id} value={store._id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Work Date
                  </label>
                  <input
                    type="date"
                    name="work_Date"
                    value={formData.work_Date}
                    onChange={handleInputChange}
                    min={todayStr}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e67e22]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      name="start_time"
                      value={formData.start_time}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e67e22]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      name="end_time"
                      value={formData.end_time}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e67e22]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e67e22]"
                  >
                    <option value="opening">Opening</option>
                    <option value="closing">Closing</option>
                  </select>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#e67e22] text-white rounded-md hover:bg-[#d35400]"
                >
                  <Save size={16} className="inline mr-1" />
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Schedule Modal */}
      {isEditModalOpen && currentSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-[#663300]">
                Edit Schedule
              </h3>
            </div>

            <form onSubmit={handleEditSchedule}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Store
                  </label>
                  <select
                    name="storeId"
                    value={formData.storeId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e67e22]"
                  >
                    {stores.map((store) => (
                      <option key={store._id} value={store._id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Work Date
                  </label>
                  <input
                    type="date"
                    name="work_Date"
                    value={formData.work_Date}
                    onChange={handleInputChange}
                    min={todayStr}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e67e22]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      name="start_time"
                      value={formData.start_time}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e67e22]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      name="end_time"
                      value={formData.end_time}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e67e22]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e67e22]"
                  >
                    <option value="opening">Opening</option>
                    <option value="closing">Closing</option>
                  </select>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setCurrentSchedule(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#e67e22] text-white rounded-md hover:bg-[#d35400]"
                >
                  <Save size={16} className="inline mr-1" />
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && currentSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-red-600">
                Confirm Delete
              </h3>
            </div>

            <div className="p-6">
              <p className="text-gray-700">
                Are you sure you want to delete the schedule for ?
              </p>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setCurrentSchedule(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSchedule}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                <Trash2 size={16} className="inline mr-1" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkSchedules;