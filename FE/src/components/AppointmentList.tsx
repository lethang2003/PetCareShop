import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import {
  setAppointments,
  updateAppointmentStatus,
  setLoading,
  Appointment,
} from "../store/appointmentSlice";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummarryAPI";
import {
  FaCalendarAlt,
  FaEdit,
  FaTimes,
  FaEye,
  FaCalendarTimes,
  FaStar,
} from "react-icons/fa";
import toast from "react-hot-toast";
import AppointmentForm from "./AppointmentForm";

const statusColor: Record<string, string> = {
  Pending: "bg-blue-100 text-blue-700",
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-gray-100 text-gray-500",
  confirmed: "bg-blue-100 text-blue-700",
};

const formatDate = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  d.setMinutes(d.getMinutes() + offset);
  return d.toLocaleDateString("en-GB");
};

const formatTime = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  d.setMinutes(d.getMinutes() + offset);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
};

const isWithinOneHour = (appointmentDate: string) => {
  const appointmentTime = new Date(appointmentDate).getTime();
  const currentTime = new Date().getTime();
  const oneHourInMs = 60 * 60 * 1000;
  return currentTime - appointmentTime <= oneHourInMs;
};

const AppointmentList: React.FC = () => {
  const dispatch = useDispatch();
  const { appointments, loading } = useSelector(
    (state: RootState) => state.appointments
  );
  const { userId } = useSelector((state: RootState) => state.user);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [openAppointmentForm, setOpenAppointmentForm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "Pending" | "Completed" | "Cancelled"
  >("Pending");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: "",
    reviewType: "service" as "clinic" | "doctor" | "service",
  });

  // Filter appointments based on active filter
  const filteredAppointments = appointments.filter(
    (app) =>
      activeFilter === "Pending"
        ? app.status === "confirmed"
        : app.status === activeFilter
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAppointments = filteredAppointments.slice(startIndex, endIndex);

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  useEffect(() => {
    const fetchAppointments = async () => {
      dispatch(setLoading(true));
      try {
        const res = await Axios(SummaryApi.viewAppointments);
        const formattedAppointments = (res.data.data || []).map(
          (item: any) => ({
            _id: item._id,
            petName: item.petId?.petName || "",
            speciesName: item.petId?.speciesId?.speciesName || "",
            gender: item.petId?.gender || "",
            serviceName: item.serviceId?.name || "",
            price: item.serviceId?.price || item.totalServicePrice || 0,
            date: formatDate(item.appointment_date),
            time: formatTime(item.appointment_date),
            clinicName: item.clinicId?.name || "",
            status: item.status
              ? item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase()
              : "Pending",
            appointment_date: item.appointment_date,
            symptoms: item.symptoms,
            cancelReason: item.cancelReason,
            depositAmount: item.depositAmount,
            isDepositPaid: item.isDepositPaid,
            paymentMethod: item.paymentMethod,
            isServicePaid: item.isServicePaid,
            totalCost: item.totalCost,
            finalPaid: item.finalPaid,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          })
        );
        dispatch(setAppointments(formattedAppointments));
      } catch (err) {
        dispatch(setAppointments([]));
        toast.error("Failed to load appointments!");
      }
      dispatch(setLoading(false));
    };
    fetchAppointments();
  }, [userId, dispatch]);

  const handleCancel = (id: string, appointmentDate: string) => {
    setCancelId(id);
    setShowModal(true);
    const isWithinHour = isWithinOneHour(appointmentDate);
    if (!isWithinHour) {
      toast.error("You can only cancel the appointment within 1 hour!");
    }
  };

  const confirmCancel = async () => {
    if (!cancelId) return;
    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }
    try {
      const response = await Axios({
        ...SummaryApi.cancelAppointment(cancelId),
        data: { cancelReason },
      });

      if (response.data.success) {
        toast.success("Appointment cancelled successfully!");
        dispatch(
          updateAppointmentStatus({ id: cancelId, status: "Cancelled" })
        );
      } else {
        toast.error(response.data.message || "Failed to cancel appointment!");
      }
    } catch (err) {
      toast.error("Failed to cancel appointment!");
    }
    setShowModal(false);
    setCancelId(null);
    setCancelReason("");
  };

  const closeModal = () => {
    setShowModal(false);
    setCancelId(null);
    setCancelReason("");
  };

  const handleViewDetails = (appointment: Appointment) => {
    const appointmentWithPrice = {
      ...appointment,
    };
    setSelectedAppointment(appointmentWithPrice);
    setShowDetailModal(true);
  };

  const handleReview = async () => {
    if (!selectedAppointment) return;


    // Chỉ cho phép review khi đã hoàn thành
    if (selectedAppointment.status.toLowerCase() !== "completed") {
      setShowReviewModal(false);
      toast.error("You can only review after the appointment is completed.");
      return;
    }

    try {
      const response = await Axios({
        ...SummaryApi.review.create,
        data: {
          appointmentId: selectedAppointment._id,
          ...reviewData,
        },
      });


      if (response.status === 201) {
        toast.success("Your review has been submitted successfully!");
        setShowReviewModal(false);
        setReviewData({
          rating: 5,
          comment: "",
          reviewType: "service",
        });
      } else {
        toast.error(response.data?.message || "Failed to submit review!");
      }
    } catch (err: any) {

      // Show specific error if available from server
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("An error occurred while submitting your review!");
      }
    }
  };


  return (
    <div className="w-full max-w-6xl mx-auto mt-4">
      <div className="flex items-center justify-between mb-4">
        n{/* Filter Buttons */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveFilter("Pending")}
            className={`px-4 py-2 rounded-full font-medium transition-colors ${activeFilter === "Pending"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            Pending
          </button>
          <button
            onClick={() => setActiveFilter("Completed")}
            className={`px-4 py-2 rounded-full font-medium transition-colors ${activeFilter === "Completed"
              ? "bg-green-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            Completed
          </button>
          <button
            onClick={() => setActiveFilter("Cancelled")}
            className={`px-4 py-2 rounded-full font-medium transition-colors ${activeFilter === "Cancelled"
              ? "bg-red-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            Cancelled
          </button>
        </div>
        <button
          onClick={() => setOpenAppointmentForm(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded flex items-center gap-2 font-semibold"
        >
          + Book New Appointment
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <FaCalendarTimes className="text-6xl text-gray-400" />
              <p className="text-gray-500 text-lg font-medium">
                No {activeFilter.toLowerCase()} appointments found
              </p>
              {activeFilter === "Pending" && (
                <p className="text-gray-400 text-sm">
                  Book your first appointment to get started
                </p>
              )}
            </div>
          </div>
        ) : (
          <>
            {currentAppointments.map((item) => (
              <div
                key={item._id}
                className="flex flex-col md:flex-row md:items-center justify-between bg-white rounded-lg p-4 border gap-2"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`${item.status.toLocaleLowerCase() === "completed"
                      ? "bg-green-100"
                      : item.status === "Cancelled"
                        ? "bg-red-100"
                        : "bg-blue-100"
                      } rounded-lg p-3 flex items-center justify-center`}
                  >
                    <FaCalendarAlt
                      className={`${item.status.toLocaleLowerCase() === "completed"
                        ? "text-green-500"
                        : item.status === "Cancelled"
                          ? "text-red-500"
                          : "text-blue-500"
                        } text-4xl`}
                    />
                  </div>
                  <div>
                    <div className="font-bold text-base text-gray-900">
                      {item.serviceName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.speciesName} - {item.petName} - {item.gender}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.date} &nbsp;- {item.time} &nbsp;-&nbsp;{" "}
                      {item.clinicName}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-2 mt-2 md:mt-0">
                  <span
                    className={`px-5 py-2 rounded-full font-bold text-base ${item.status === "Completed"
                      ? "bg-green-100 text-green-700"
                      : item.status === "Cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                      }`}
                  >
                    {activeFilter === "Pending" && item.status === "confirmed"
                      ? "confirmed"
                      : item.status}
                  </span>
                  {item.status !== "Completed" &&
                    item.status !== "Cancelled" && (
                      <button
                        className={`border px-3 py-1 rounded flex items-center gap-1 text-gray-600 hover:bg-red-300 ${item.status === "Pending"
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-red-100 text-red-700 hover:bg-red-200"
                          }`}
                        onClick={() =>
                          handleCancel(item._id, item.appointment_date)
                        }
                      >
                        <FaTimes /> Cancel
                      </button>
                    )}
                  <button
                    className={`border px-3 py-1 rounded flex items-center gap-1 ${item.status === "Pending"
                      ? "bg-blue-100 text-blue-700 hover:bg-blue-300"
                      : item.status === "Completed"
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-red-100 text-red-700 hover:bg-red-200"
                      }`}
                    onClick={() => handleViewDetails(item)}
                  >
                    <FaEye /> Details
                  </button>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded ${currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  Previous
                </button>

                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`w-8 h-8 rounded ${currentPage === index + 1
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded ${currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
      {/* Modal xác nhận hủy */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out">
          <div className="bg-white rounded-xl shadow-lg p-6 min-w-[320px] max-w-xs transform transition-all duration-300 ease-in-out scale-100 opacity-100 animate-fadeIn">
            <div className="font-semibold text-lg mb-4 text-center">
              Cancel Appointment
            </div>
            <div className="text-xs italic text-red-500 mb-4 text-center">
              Note: If you cancel the appointment after 1 hour from booking, the
              deposit will not be refunded.
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for cancellation
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200"
                rows={3}
                placeholder="Please enter your reason for cancellation..."
              />
            </div>
            <div className="flex gap-4 justify-center mt-2">
              <button
                onClick={confirmCancel}
                className="bg-orange-500 text-white px-4 py-2 rounded font-semibold hover:bg-orange-600 transition-colors duration-200"
              >
                Confirm Cancel
              </button>
              <button
                onClick={closeModal}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded font-semibold hover:bg-gray-300 transition-colors duration-200"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Detail Modal */}
      {showDetailModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out">
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 w-[95vw] max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-2xl mx-auto transform transition-all duration-300 ease-in-out scale-100 opacity-100 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Appointment Details
              </h2>
              <div className="flex items-center gap-2">
                {selectedAppointment.status === "Completed" && (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="bg-orange-500 text-white px-4 py-2 rounded font-semibold hover:bg-orange-600 transition-colors duration-200 flex items-center gap-2"
                  >
                    <FaEdit /> Leave a Review
                  </button>
                )}
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold ml-2"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Thông tin cơ bản */}
              <div className="col-span-2 bg-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold text-orange-700 mb-2">
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Status:</span>
                    <span
                      className={`ml-2 px-2 py-1 rounded-full text-xs ${selectedAppointment.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : selectedAppointment.status === "Cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                        }`}
                    >
                      {selectedAppointment.status}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Date:</span>{" "}
                    {selectedAppointment.date}
                  </div>
                  <div>
                    <span className="font-medium">Time:</span>{" "}
                    {selectedAppointment.time}
                  </div>
                  <div>
                    <span className="font-medium">Clinic:</span>{" "}
                    {selectedAppointment.clinicName}
                  </div>
                </div>
              </div>

              {/* Thông tin thú cưng */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-700 mb-2">
                  Pet Information
                </h3>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="font-medium">Name:</span>{" "}
                    {selectedAppointment.petName}
                  </div>
                  <div>
                    <span className="font-medium">Species:</span>{" "}
                    {selectedAppointment.speciesName}
                  </div>
                  <div>
                    <span className="font-medium">Gender:</span>{" "}
                    {selectedAppointment.gender}
                  </div>
                </div>
              </div>

              {/* Thông tin dịch vụ */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-700 mb-2">
                  Service Information
                </h3>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="font-medium">Service:</span>{" "}
                    {selectedAppointment.serviceName}
                  </div>
                  <div>
                    <span className="font-medium">Price:</span>{" "}
                    {selectedAppointment.price?.toLocaleString("vi-VN")} VND
                  </div>
                  <div>
                    <span className="font-medium">Payment Status:</span>{" "}
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${selectedAppointment.isServicePaid
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}
                    >
                      {selectedAppointment.isServicePaid ? "Paid" : "Unpaid"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Thông tin thanh toán */}
              <div className="col-span-2 bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-700 mb-2">
                  Payment Information
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Payment Method:</span>{" "}
                    <span className="capitalize">
                      {selectedAppointment.paymentMethod?.toLowerCase() ||
                        "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Total Service Price:</span>{" "}
                    {selectedAppointment.depositAmount?.toLocaleString("vi-VN")}{" "}
                    VND
                  </div>
                  <div>
                    <span className="font-medium">Deposit Status:</span>{" "}
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${selectedAppointment.isDepositPaid
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}
                    >
                      {selectedAppointment.isDepositPaid ? "Paid" : "Unpaid"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Total Cost:</span>{" "}
                    {selectedAppointment.totalCost?.toLocaleString("vi-VN")} VND
                  </div>
                  <div>
                    <span className="font-medium">Final Payment Status:</span>{" "}
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${selectedAppointment.finalPaid
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}
                    >
                      {selectedAppointment.finalPaid ? "Paid" : "Unpaid"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Triệu chứng và ghi chú */}
              {selectedAppointment.symptoms && (
                <div className="col-span-2 bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Symptoms & Notes
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedAppointment.symptoms}
                  </p>
                </div>
              )}

              {/* Lý do hủy nếu có */}
              {selectedAppointment.cancelReason && (
                <div className="col-span-2 bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-700 mb-2">
                    Cancellation Reason
                  </h3>
                  <p className="text-sm text-red-600">
                    {selectedAppointment.cancelReason}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {openAppointmentForm && (
        <AppointmentForm
          open={openAppointmentForm}
          onClose={() => setOpenAppointmentForm(false)}
          onSuccess={() => setOpenAppointmentForm(false)}
        />
      )}
      {/* Review Modal */}
      {showReviewModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 min-w-[340px] max-w-md w-full animate-fadeIn">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold text-gray-800">Leave a Review</h2>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleReview(); }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Review Type
                </label>
                <select
                  value={reviewData.reviewType}
                  onChange={e => setReviewData({ ...reviewData, reviewType: e.target.value as "clinic" | "doctor" | "service" })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50"
                >
                  <option value="service">Service</option>
                  <option value="doctor">Doctor</option>
                  <option value="clinic">Clinic</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewData({ ...reviewData, rating: star })}
                      className="text-2xl focus:outline-none"
                      aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    >
                      <FaStar className={star <= reviewData.rating ? "text-yellow-400" : "text-gray-300"} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comment
                </label>
                <textarea
                  value={reviewData.comment}
                  onChange={e => setReviewData({ ...reviewData, comment: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50 resize-none"
                  rows={3}
                  placeholder="Write your feedback..."
                />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold transition"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentList;
