
import { useState, useEffect } from "react";
import { ArrowDownToLine, Calendar, Clock, Home, RefreshCcw, Repeat, User, X } from "lucide-react";
import { DateTime } from "luxon";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "../components/Footer";
import {
  fetchAvailableScheduleDoctor,
  fetchMyScheduleDoctor,
  fetchSwappableSchedules,
  registerScheduleDoctor,
} from "../utils/workSchedules";
import workScheduleTransferAPI from "../utils/workScheduleTransfer";

const WorkSchedulesDoctor = () => {
  const [tab, setTab] = useState<"available" | "mine" | "swap">("available");
  const [schedules, setSchedules] = useState([]);
  const [mySchedules, setMySchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [availableForSwap, setAvailableForSwap] = useState([]);
  const [selectedMySchedule, setSelectedMySchedule] = useState(null);
  const [selectedSwapTargetId, setSelectedSwapTargetId] = useState(null);
  const [swapRequests, setSwapRequests] = useState([]);

  const userRaw = localStorage.getItem("persist:root");

  let currentUserId = null;
  if (userRaw) {
    const parsedRoot = JSON.parse(userRaw);
    const userObj = JSON.parse(parsedRoot.user);
    currentUserId = userObj.userId;
  }

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      if (tab === "available") {
        const response = await fetchAvailableScheduleDoctor();
        setSchedules(response);
      } else if (tab === "mine") {
        const response = await fetchMyScheduleDoctor();
        setMySchedules(response);
      } else if (tab === "swap") {
        const response = await workScheduleTransferAPI.getMyTransferRequests();
        setSwapRequests(response.data.data || []);
      }
    } catch (err: any) {
      setError("Error fetching schedules: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };  

  useEffect(() => {
    fetchSchedules();
  }, [tab]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const formatTime = (timeString) => {
    return DateTime.fromISO(timeString, { zone: "utc" })
      .setZone("Asia/Ho_Chi_Minh")
      .toFormat("HH:mm");
  };

  const safeFormatDate = (value?: string) =>
    value ? formatDate(value) : "N/A";
  
  const safeFormatTime = (value?: string) =>
    value ? formatTime(value) : "N/A";  

  return (
    <div className="bg-white min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow bg-[#fff9f5]">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="mb-6 flex gap-4">
              <button
                onClick={() => setTab("available")}
                className={`px-4 py-2 rounded ${tab === "available" ? "bg-orange-200 font-bold" : "bg-gray-100"}`}
              >
                Available Schedules
              </button>
              <button
                onClick={() => setTab("mine")}
                className={`px-4 py-2 rounded ${tab === "mine" ? "bg-orange-200 font-bold" : "bg-gray-100"}`}
              >
                Registered Schedules
              </button>
              <button
                onClick={() => setTab("swap")}
                className={`px-4 py-2 rounded ${tab === "swap" ? "bg-orange-200 font-bold" : "bg-gray-100"}`}
              >
                Swap Requests
              </button>
              <button
                onClick={() => fetchSchedules()}
                className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#f8d7b6] text-[#663300] hover:bg-[#f5c79a] transition-all"
              >
                <RefreshCcw size={16} />
                Refresh Schedules
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg border-l-4 border-red-500 shadow-sm flex justify-between items-center">
                <div>{error}</div>
                <button onClick={() => setError(null)} className="ml-2 p-1.5 rounded-full hover:bg-red-200">
                  <X size={16} />
                </button>
              </div>
            )}

            {loading ? (
              <div className="flex flex-col justify-center items-center h-64 gap-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e67e22]"></div>
                <p className="text-[#996633] font-medium">Loading schedules...</p>
              </div>
            ) : tab === "available" ? (
              schedules.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-8 text-center border border-amber-100">
                  <Calendar size={48} className="mx-auto text-[#e67e22]/60 mb-4" />
                  <p className="text-lg text-gray-600 mb-2">No schedules available</p>
                  <p className="text-gray-500 mb-4">Check back later for new schedules</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {schedules.map((schedule) => (
                    <div key={schedule._id} className="bg-white rounded-lg shadow-md border-l-4 border-[#e67e22] hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <div className="p-5">
                        <div className="mb-3 flex justify-between items-start">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">Opening</span>
                        </div>
                        <div className="bg-[#f8f8f8] p-3 rounded-lg mb-3">
                          <p className="text-[#996633] flex items-center">
                            <Home size={16} className="mr-2 text-[#e67e22]" />
                            <span className="font-medium">Store:</span>{" "}
                            <span className="ml-1">{schedule.storeId?.name || "PetCare Clinic"}</span>
                          </p>
                          <p className="text-[#996633] flex items-center mt-2">
                            <User size={16} className="mr-2 text-[#e67e22]" />
                            <span className="font-medium">Doctor:</span>
                            <span className="ml-1">{schedule.doctorId?.fullName || "Unassigned"}</span>
                          </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                          <div className="flex items-center bg-[#f8f8f8] p-3 rounded-lg text-gray-600">
                            <Calendar size={16} className="mr-2 text-[#e67e22]" />
                            {formatDate(schedule.work_Date)}
                          </div>
                          <div className="flex items-center bg-[#f8f8f8] p-3 rounded-lg text-gray-600">
                            <Clock size={16} className="mr-2 text-[#e67e22]" />
                            {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                          </div>
                        </div>
                      </div>
                      <div className="bg-[#f8f0e9] px-5 py-3 flex justify-end border-t border-[#f5e9dc]">
                        <button
                          onClick={() => {
                            setSelectedScheduleId(schedule._id);
                            setIsConfirmOpen(true);
                          }}
                          className="px-4 py-2 rounded-lg bg-[#e67e22] text-white hover:bg-[#d35400]"
                        >
                          Register Schedule
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : tab === "swap" ? (
              swapRequests.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-8 text-center border border-amber-100 w-full">
                  <Calendar size={48} className="mx-auto text-[#e67e22]/60 mb-4" />
                  <p className="text-lg text-gray-600 mb-2">No incoming swap requests.</p>
                </div>
              ) : (
                <div className="space-y-6 mb-8">
                  {swapRequests.map((req) => {
                    const isSender =
                    req.doctorId &&
                    String(
                      typeof req.doctorId === "object" ? req.doctorId._id : req.doctorId
                    ) === String(currentUserId);                                    

                    return (
                      <div key={req._id} className="bg-white rounded-lg shadow-md border-l-4 border-[#e67e22] p-5">
                        <p className="text-[#663300] font-semibold mb-2">
                          Requested by: {req.doctorId?.fullName}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Swap FROM */}
                          <div className="bg-[#fef6e4] p-4 rounded shadow-sm">
                            <p className="font-bold text-[#e67e22] mb-2 flex items-center">
                              <Repeat size={16} className="mr-2" />
                              Swap FROM:
                            </p>
                            <p className="flex items-center text-[#663300]">
                              <Calendar size={16} className="mr-2 text-[#e67e22]" />
                              {safeFormatDate(req.workScheduleId?.work_Date)}
                            </p>
                            <p className="flex items-center text-[#663300]">
                              <Clock size={16} className="mr-2 text-[#e67e22]" />
                              {safeFormatTime(req.workScheduleId?.start_time)} - {safeFormatTime(req.workScheduleId?.end_time)}
                            </p>
                            <p className="flex items-center text-[#663300]">
                              <Home size={16} className="mr-2 text-[#e67e22]" />
                              {req.workScheduleId?.storeId?.name || "No Store"}
                            </p>
                            <p className="flex items-center text-[#663300]">
                              <User size={16} className="mr-2 text-[#e67e22]" />
                              {req.workScheduleId?.doctorId?.fullName || "Unknown Doctor"}
                            </p>
                          </div>

                          {/* Your current schedule */}
                          <div className="bg-[#eef8f6] p-4 rounded shadow-sm">
                            <p className="font-bold text-[#1b998b] mb-2 flex items-center">
                              <ArrowDownToLine size={16} className="mr-2" />
                              Your Schedule:
                            </p>
                            <p className="flex items-center text-[#663300]">
                              <Calendar size={16} className="mr-2 text-[#e67e22]" />
                              {safeFormatDate(req.targetScheduleId?.work_Date)}
                            </p>
                            <p className="flex items-center text-[#663300]">
                              <Clock size={16} className="mr-2 text-[#e67e22]" />
                              {safeFormatTime(req.targetScheduleId?.start_time)} - {safeFormatTime(req.targetScheduleId?.end_time)}
                            </p>
                            <p className="flex items-center text-[#663300]">
                              <Home size={16} className="mr-2 text-[#e67e22]" />
                              {req.targetScheduleId?.storeId?.name || "No Store"}
                            </p>
                            <p className="flex items-center text-[#663300]">
                              <User size={16} className="mr-2 text-[#e67e22]" />
                              {req.targetScheduleId?.doctorId?.fullName || "Unknown Doctor"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex justify-end items-center">
                          {isSender ? (
                            <p className="text-sm text-gray-500 italic">You sent this request</p>
                          ) : (
                            <div className="flex gap-3">
                              <button
                                onClick={async () => {
                                  await workScheduleTransferAPI.acceptTransfer(req._id);
                                  toast.success("Accepted swap request");
                                  setSwapRequests(swapRequests.filter((r) => r._id !== req._id));
                                }}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                              >
                                Accept
                              </button>
                              <button
                                onClick={async () => {
                                  await workScheduleTransferAPI.rejectTransfer(req._id);
                                  toast.info("Rejected swap request");
                                  setSwapRequests(swapRequests.filter((r) => r._id !== req._id));
                                }}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              mySchedules.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-8 text-center border border-amber-100 w-full">
                  <Calendar size={48} className="mx-auto text-[#e67e22]/60 mb-4" />
                  <p className="text-lg text-gray-600 mb-2">You have not registered any schedule yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {mySchedules.map((schedule) => (
                    <div key={schedule._id} className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-[#e67e22] hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">Registered</span>
                        </div>
                        <div className="bg-[#f8f8f8] p-3 rounded-lg mb-3">
                          <p className="text-[#996633] flex items-center">
                            <Home size={16} className="mr-2 text-[#e67e22]" />
                            <span className="font-medium">Store:</span>{" "}
                            <span className="ml-1">{schedule.storeId?.name || "PetCare Clinic"}</span>
                          </p>
                          <p className="text-[#996633] flex items-center mt-2">
                            <User size={16} className="mr-2 text-[#e67e22]" />
                            <span className="font-medium">Doctor:</span>
                            <span className="ml-1">{schedule.doctorId?.fullName || "Unassigned"}</span>
                          </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                          <div className="flex items-center text-gray-600 bg-[#f8f8f8] p-3 rounded-lg">
                            <Calendar size={16} className="mr-2 text-[#e67e22]" />
                            <span>{formatDate(schedule.work_Date)}</span>
                          </div>
                          <div className="flex items-center text-gray-600 bg-[#f8f8f8] p-3 rounded-lg">
                            <Clock size={16} className="mr-2 text-[#e67e22]" />
                            <span>{formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-[#f8f0e9] px-5 py-3 flex justify-end border-t border-[#f5e9dc]">
                        <button
                          onClick={async () => {
                            setSelectedMySchedule(schedule);
                            const res = await fetchSwappableSchedules(schedule._id);
                            setAvailableForSwap(res);
                            setIsSwapModalOpen(true);
                          }}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#e67e22] text-white hover:bg-[#e67e22] transition-colors"
                        >
                          Request a reschedule
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )              
            )}
          </div>
        </main>
        {isConfirmOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-[#663300]">Confirm registration</h3>
              </div>
              <div className="p-6 text-[#663300] text-sm">Are you sure you want to register to this schedule?</div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => setIsConfirmOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setIsConfirmOpen(false);
                    if (selectedScheduleId) {
                      const response = await registerScheduleDoctor(selectedScheduleId);
                      if (response) {
                        toast.success("Schedule registration successful!");
                        fetchSchedules();
                      } else {
                        toast.error("Registration failed. Please try again.");
                      }
                    }
                  }}
                  className="px-4 py-2 bg-[#e67e22] text-white rounded-md hover:bg-[#d35400]"
                >
                  Register
                </button>
              </div>
            </div>
          </div>
        )}
        {isSwapModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-[#663300]">
                  Select a schedule to swap with
                </h2>
              </div>
              <div className="p-6 max-h-[400px] overflow-y-auto space-y-3">
                {availableForSwap.length === 0 ? (
                  <p className="text-gray-600">No available schedules found.</p>
                ) : (
                  availableForSwap.map((schedule) => (
                    <div
                      key={schedule._id}
                      onClick={() => setSelectedSwapTargetId(schedule._id)}
                      className={`cursor-pointer p-4 rounded border ${
                        selectedSwapTargetId === schedule._id
                          ? "border-[#e67e22] bg-[#fff6ed]"
                          : "border-gray-300"
                      }`}
                    >
                      <div className="space-y-2 text-[#663300]">
                        <p className="flex items-center">
                          <Calendar size={16} className="mr-2 text-[#e67e22]" />
                          {formatDate(schedule.work_Date)}
                        </p>
                        <p className="flex items-center">
                          <Clock size={16} className="mr-2 text-[#e67e22]" />
                          {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                        </p>
                        <p className="flex items-center">
                          <Home size={16} className="mr-2 text-[#e67e22]" />
                          {schedule.storeId?.name || "No store"}
                        </p>
                        <p className="flex items-center">
                          <User size={16} className="mr-2 text-[#e67e22]" />
                          {schedule.doctorId?.fullName || "Unassigned"}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
                <button
                  onClick={() => setIsSwapModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!selectedMySchedule || !selectedSwapTargetId) return;
                    try {
                      const res = await workScheduleTransferAPI.createTransferRequest(
                        selectedMySchedule._id,
                        selectedSwapTargetId
                      );
                      if (res.data.success) {
                        toast.success("Swap request sent successfully!");
                        setIsSwapModalOpen(false);
                        fetchSchedules(); // refresh schedule view
                      } else {
                        toast.error(res.data.message || "Failed to request swap.");
                      }
                    } catch {
                      toast.error("Error sending swap request.");
                    }
                  }}
                  className="px-4 py-2 bg-[#e67e22] text-white rounded-md hover:bg-[#d35400]"
                >
                  Confirm Swap
                </button>
              </div>
            </div>
          </div>
        )}
        <footer className="mt-auto bg-[#fff5eb] border-t border-amber-100">
          <Footer />
        </footer>
      </div>
    </div>
  );
};

export default WorkSchedulesDoctor;