import * as React from "react";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import SummaryApi from "../common/SummarryAPI";
import Axios from "../utils/Axios";
import toast, { Toaster } from "react-hot-toast";
import { setAppointments } from "../store/appointmentSlice";

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

interface AppointmentFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface Pet {
  _id: string;
  petName: string;
  speciesId: {
    speciesName: string;
  };
  gender: string;
  age: string | number;
}

interface Clinic {
  _id: string;
  name: string;
}

interface Service {
  _id: string;
  name: string;
  price: number;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user);
  const [pets, setPets] = useState<Pet[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [form, setForm] = useState({
    petId: "",
    clinicId: "",
    serviceId: "",
    date: "",
    time: "",
    depositAmount: "",
    symptoms: "",
    fullName: user.fullName || "",
    email: user.email || "",
    phone: user.phone || "",
    paymentMethod: "",
    deposit: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [vnpayOption, setVnpayOption] = useState<"deposit" | "total">(
    "deposit"
  );

  const fetchServicesByClinic = async (clinicId: string) => {
    try {
      const response = await Axios(SummaryApi.getServicesByClinic(clinicId));
      setServices(response.data.data || []);

      setForm((prev) => ({ ...prev, serviceId: "" }));
    } catch (error) {
      setServices([]);
    }
  };

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setForm((f) => ({
      ...f,
      fullName: user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
    }));
    if (user.userId) {
      Axios(SummaryApi.getAllPetsCustomer).then((res) =>
        setPets(res.data.data || [])
      );
    }

    Axios.get("/api/v1/clinic/getall").then((res) =>
      setClinics(res.data.data || [])
    );
  }, [open, user.userId, user.fullName, user.email, user.phone]);

  useEffect(() => {
    if (form.clinicId) {
      fetchServicesByClinic(form.clinicId);
    } else {
      setServices([]);
    }
  }, [form.clinicId]);

  useEffect(() => {
    if (step === 2 && !form.depositAmount) {
      setForm((f) => ({ ...f, depositAmount: "100.000" }));
    }
  }, [step]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const checkTimeAvailability = async (
    date: string,
    time: string,
    clinicId: string
  ) => {
    try {
      const appointmentDateTime = `${date}T${time}:00+07:00`;
      const response = await Axios.post(
        SummaryApi.checkAppointmentAvailability.url,
        {
          appointment_date: appointmentDateTime,
          clinicId: clinicId,
        }
      );

      if (!response.data.success) {
        toast.error(
          response.data.message ||
          "This time slot is already fully booked (maximum 2 appointments per time slot)."
        );
        return false;
      }
      return true;
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to check time availability"
      );
      return false;
    }
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.petId) {
      toast.error("Please select a pet!");
      return;
    }
    if (!form.clinicId) {
      toast.error("Please select a clinic!");
      return;
    }
    if (!form.serviceId) {
      toast.error("Please select a service!");
      return;
    }
    if (!form.date) {
      toast.error("Please select a date!");
      return;
    }
    if (!form.time) {
      toast.error("Please select a time!");
      return;
    }

    setCheckingAvailability(true);
    try {
      const isAvailable = await checkTimeAvailability(
        form.date,
        form.time,
        form.clinicId
      );
      if (!isAvailable) {
        return;
      }
      setStep(2);
    } catch (error) {
      toast.error("Failed to check time availability. Please try again.");
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleCancel = () => {
    setForm({
      petId: "",
      clinicId: "",
      serviceId: "",
      date: "",
      time: "",
      depositAmount: "",
      symptoms: "",
      fullName: user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
      paymentMethod: "",
      deposit: "",
    });
    setStep(1);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Kiểm tra Payment Method
    if (!form.paymentMethod) {
      toast.error("Please select a payment method!");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const appointmentDateTime =
        form.date && form.time
          ? `${form.date}T${form.time}:00+07:00`
          : form.date;
      let depositAmount: string | undefined = "100000";
      let isDepositPaid = false;
      let totalServicePrice = undefined;
      let isServicePaid = false;
      if (form.paymentMethod === "VNPay") {
        isDepositPaid = true;
        if (vnpayOption === "total" && selectedService) {
          depositAmount = undefined;
          totalServicePrice = selectedService.price;
          isServicePaid = true;
        }
      }
      if (form.paymentMethod !== "Cash" && form.paymentMethod !== "VNPay") {
        depositAmount = "100000";
        isDepositPaid = true;
      }
      if (form.paymentMethod === "Cash") {
        depositAmount = "0";
        isDepositPaid = false;
      }
      const payload = {
        petId: form.petId,
        clinicId: form.clinicId,
        serviceId: form.serviceId,
        appointment_date: appointmentDateTime,
        symptoms: form.symptoms,
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        paymentMethod: form.paymentMethod,
        customerId: user.userId,
        ...(depositAmount !== undefined && { depositAmount }),
        isDepositPaid,
        ...(totalServicePrice !== undefined && { totalServicePrice }),
        ...(isServicePaid && { isServicePaid }),
      };

      // Tạo lịch hẹn trước
      const appointmentResponse = await Axios.post(
        SummaryApi.createAppointment.url,
        payload
      );

      if (!appointmentResponse.data.success) {
        throw new Error(appointmentResponse.data.message || "Failed to create appointment");
      }

      const appointmentId = appointmentResponse.data.data._id;

      // Nếu thanh toán qua VNPay
      if (form.paymentMethod === "VNPay") {
        const paymentType = vnpayOption === "total" ? "full" : "deposit";

        // Gọi API tạo link thanh toán VNPay
        const paymentResponse = await Axios.get(`/api/v1/payment/appointment/${appointmentId}?paymentType=${paymentType}`);

        if (paymentResponse.data.success) {
          // Chuyển hướng đến trang thanh toán VNPay
          window.location.href = paymentResponse.data.data.paymentUrl;
          return;
        } else {
          toast.error(paymentResponse.data.message || "Failed to create payment");
          return;
        }
      }

      // Nếu thanh toán tiền mặt hoặc phương thức khác
      // Sau khi tạo lịch hẹn thành công, cập nhật lại danh sách
      const appointmentsResponse = await Axios(SummaryApi.viewAppointments);
      const formattedAppointments = (appointmentsResponse.data.data || []).map(
        (item: any) => ({
          _id: item._id,
          petName: item.petId?.petName || "",
          serviceName: item.serviceId?.name || "",
          date: formatDate(item.appointment_date),
          time: formatTime(item.appointment_date),
          clinicName: item.clinicId?.name || "",
          status: item.status || "Pending",
          appointment_date: item.appointment_date,
        })
      );
      dispatch(setAppointments(formattedAppointments));

      toast.success("Booking appointment successfully!");
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "An error occurred!");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const selectedPet = pets.find((p) => p._id === form.petId);
  const selectedClinic = clinics.find((c) => c._id === form.clinicId);
  const selectedService = services.find((s) => s._id === form.serviceId);

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4 transition-all duration-300 ease-in-out animate-fadeIn">
        <form
          onSubmit={step === 1 ? handleNext : handleSubmit}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-8 relative border border-orange-100 transform transition-all duration-300 ease-in-out animate-slideUp"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-black text-2xl"
            aria-label="Đóng"
          >
            ×
          </button>
          {/* Stepper */}
          <div className="flex items-center justify-center mb-8 gap-8">
            {/* Step 1 */}
            <div className="flex flex-col items-center w-32">
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full text-lg font-bold transition-all duration-200
                ${step === 1
                    ? "bg-gradient-to-b from-orange-500 to-orange-600 text-white shadow-lg"
                    : step > 1
                      ? "bg-gradient-to-b from-orange-500 to-orange-600 text-white shadow-lg"
                      : "bg-white border-2 border-gray-300 text-gray-400"
                  }
              `}
              >
                {step > 1 ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 10.5L9 14.5L15 7.5"
                      stroke="white"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  1
                )}
              </div>
              <span
                className={`mt-2 text-sm font-medium text-center ${step >= 1 ? "text-orange-600" : "text-gray-400"
                  }`}
              >
                Appointment
                <br />
                Information
              </span>
            </div>
            {/* Line */}
            <div className="relative flex items-center w-24 h-1">
              <div
                className={`absolute left-0 top-0 h-1 rounded-full w-full bg-gray-200 transition-all duration-500`}
              ></div>
              <div
                className={`absolute left-0 top-0 h-1 rounded-full transition-all duration-700
                  ${step > 1
                    ? "w-full bg-gradient-to-r from-orange-500 to-orange-600"
                    : "w-0 bg-gradient-to-r from-orange-500 to-orange-600"
                  }`}
              ></div>
            </div>
            {/* Step 2 */}
            <div className="flex flex-col items-center w-32">
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full text-lg font-bold transition-all duration-200
                ${step === 2
                    ? "bg-gradient-to-b from-orange-500 to-orange-600 text-white shadow-lg"
                    : "bg-white border-2 border-gray-300 text-gray-400"
                  }
              `}
              >
                2
              </div>
              <span
                className={`mt-2 text-sm font-medium text-center ${step === 2 ? "text-orange-600" : "text-gray-400"
                  }`}
              >
                Confirmation
                <br />& Payment
              </span>
            </div>
          </div>
          {step === 1 && (
            <h2 className="text-2xl font-bold mb-6 text-center text-orange-800 tracking-wide">
              New Appointment
            </h2>
          )}
          {step === 1 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-1 font-semibold text-gray-700">
                    Pet *
                  </label>
                  <select
                    name="petId"
                    value={form.petId}
                    onChange={handleChange}
                    className="w-full border border-orange-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 focus:outline-none bg-gray-50"
                  >
                    <option value="">Select a pet</option>
                    {pets.map((pet) => (
                      <option key={pet._id} value={pet._id}>
                        {pet.speciesId.speciesName} - {pet.petName} -{" "}
                        {pet.gender}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-gray-700">
                    Clinic *
                  </label>
                  <select
                    name="clinicId"
                    value={form.clinicId}
                    onChange={handleChange}
                    className="w-full border border-orange-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 focus:outline-none bg-gray-50"
                  >
                    <option value="">Select a clinic</option>
                    {clinics.map((clinic) => (
                      <option key={clinic._id} value={clinic._id}>
                        {clinic.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-1 font-semibold text-gray-700">
                    Service *
                  </label>
                  <select
                    name="serviceId"
                    value={form.serviceId}
                    onChange={handleChange}
                    className="w-full border border-orange-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 focus:outline-none bg-gray-50"
                  >
                    <option value="">Select a service</option>
                    {services.map((service) => (
                      <option key={service._id} value={service._id}>
                        {service.name} - {service.price.toLocaleString("vi-VN")}{" "}
                        VND
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-gray-700">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    className="w-full border border-orange-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 focus:outline-none bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-gray-700">
                    Time *
                  </label>
                  <select
                    name="time"
                    value={form.time}
                    onChange={handleChange}
                    className="w-full border border-orange-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-orange-400 focus:outline-none bg-gray-50"
                  >
                    <option value="">Select time</option>
                    <option value="07:00">07:00</option>
                    <option value="08:00">08:00</option>
                    <option value="09:00">09:00</option>
                    <option value="10:00">10:00</option>
                    <option value="11:00">11:00</option>
                    <option value="13:00">13:00</option>
                    <option value="14:00">14:00</option>
                    <option value="15:00">15:00</option>
                    <option value="16:00">16:00</option>
                    <option value="17:00">17:00</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-1 font-semibold text-gray-700">
                    Symptoms / Notes
                  </label>
                  <textarea
                    name="symptoms"
                    value={form.symptoms}
                    onChange={handleChange}
                    className="w-full border border-orange-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 focus:outline-none bg-gray-50"
                    placeholder="Describe symptoms or reason for visit..."
                    rows={2}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={checkingAvailability}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 rounded-lg font-semibold text-lg shadow hover:from-orange-600 hover:to-orange-700 transition disabled:opacity-50"
                >
                  {checkingAvailability
                    ? "Checking availability..."
                    : "Continue"}
                </button>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <div className="mb-4">
                <label className="block mb-1 font-semibold text-gray-700">
                  Payment Method *
                </label>
                <select
                  name="paymentMethod"
                  value={form.paymentMethod}
                  onChange={(e) => {
                    handleChange(e);
                    if (e.target.value !== "VNPay") setVnpayOption("deposit");
                  }}
                  className="w-full border border-orange-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 focus:outline-none bg-gray-50"
                >
                  <option value="">Select payment method</option>
                  <option value="Cash">Cash</option>
                  <option value="VNPay">VNPay</option>
                </select>
              </div>
              {/* VNPay Option */}
              {form.paymentMethod === "VNPay" && (
                <div className="mb-4 flex gap-6 items-center">
                  <label className="font-semibold text-gray-700">
                    Choose payment:
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="vnpayOption"
                      value="deposit"
                      checked={vnpayOption === "deposit"}
                      onChange={() => setVnpayOption("deposit")}
                      className="accent-orange-500"
                    />
                    <span>Deposit fee (100.000 VND)</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="vnpayOption"
                      value="total"
                      checked={vnpayOption === "total"}
                      onChange={() => setVnpayOption("total")}
                      className="accent-orange-500"
                    />
                    <span>Total service price</span>
                  </label>
                </div>
              )}
              {/* Selected Information Box */}
              <div className="mb-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="font-semibold mb-1 text-orange-700">
                  Selected Information:
                </div>
                <div>
                  <b>Name:</b> {form.fullName}
                </div>
                <div>
                  <b>Phone:</b> {form.phone}
                </div>
                <div>
                  <b>Pet:</b>{" "}
                  {selectedPet
                    ? `${selectedPet.speciesId.speciesName} - ${selectedPet.petName} - ${selectedPet.gender}`
                    : ""}
                </div>
                <div>
                  <b>Clinic:</b> {selectedClinic ? selectedClinic.name : ""}
                </div>
                <div>
                  <b>Service:</b>{" "}
                  {selectedService
                    ? `${selectedService.name
                    } - ${selectedService.price?.toLocaleString("vi-VN")} VND`
                    : ""}
                </div>
                <div>
                  <b>Payment Method:</b> {form.paymentMethod || "-"}
                </div>
                <div>
                  <b>Date:</b> {form.date}
                </div>
                <div>
                  <b>Time:</b> {form.time}
                </div>
                <div>
                  <b>Symptoms/Notes:</b> {form.symptoms}
                </div>
              </div>
              {/* Payment Info Box */}
              {form.paymentMethod && (
                <div className="mb-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="font-semibold mb-1 text-orange-700">
                    Payment Information:
                  </div>
                  {form.paymentMethod === "VNPay" &&
                    vnpayOption === "deposit" && (
                      <>
                        <div className="flex justify-between items-center mt-2">
                          <span className="font-bold text-lg">
                            Total amount:
                          </span>
                          <span className="font-bold text-lg">100.000 VND</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          Deposit fee will be deducted from the total service
                          price after the service is completed.
                        </div>
                      </>
                    )}
                  {form.paymentMethod === "VNPay" &&
                    vnpayOption === "total" && (
                      <>
                        <div className="flex justify-between items-center mt-2">
                          <span>Total service price:</span>
                          <span className="text-orange-600 font-semibold">
                            {selectedService
                              ? `${selectedService.price?.toLocaleString(
                                "vi-VN"
                              )} VND`
                              : "-"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="font-bold text-lg">
                            Total amount:
                          </span>
                          <span className="font-bold text-lg">
                            {selectedService
                              ? `${selectedService.price?.toLocaleString(
                                "vi-VN"
                              )} VND`
                              : "-"}
                          </span>
                        </div>
                      </>
                    )}
                  {form.paymentMethod !== "VNPay" &&
                    form.paymentMethod !== "Cash" && (
                      <>
                        <div className="flex justify-between items-center mt-2">
                          <span>Deposit fee (pay now):</span>
                          <span className="text-orange-600 font-semibold">
                            100.000 VND
                          </span>
                        </div>
                        <hr className="my-3 border-orange-200" />
                        <div className="flex justify-between items-center mt-2">
                          <span className="font-bold text-lg">
                            Total amount:
                          </span>
                          <span className="font-bold text-lg">
                            {selectedService
                              ? `${(
                                selectedService.price - 100000
                              ).toLocaleString("vi-VN")} VND`
                              : "-"}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          * The remaining amount will be paid after the service
                          is completed
                        </div>
                      </>
                    )}
                  {form.paymentMethod === "Cash" && (
                    <div className="flex justify-between items-center mt-2">
                      <span>Total service price:</span>
                      <span>
                        {selectedService
                          ? `${selectedService.price?.toLocaleString(
                            "vi-VN"
                          )} VND`
                          : "-"}
                      </span>
                    </div>
                  )}
                </div>
              )}
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 bg-white border border-orange-400 text-orange-600 py-2 rounded-lg font-semibold hover:bg-orange-50 transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 rounded-lg font-semibold text-lg shadow hover:from-orange-600 hover:to-orange-700 transition"
                >
                  {loading ? "Booking..." : "Book Now"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </>
  );
};

export default AppointmentForm;
