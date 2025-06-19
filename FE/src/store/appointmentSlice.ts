import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Appointment {
  _id: string;
  petName: string;
  speciesName: string;
  serviceName: string;
  gender: string;
  date: string;
  clinicName: string;
  status: "Pending" | "Completed" | "Cancelled" | "confirmed";
  time: string;
  appointment_date: string;
  symptoms?: string;
  cancelReason?: string;
  depositAmount?: number;
  isDepositPaid?: boolean;
  paymentMethod?: string;
  isServicePaid?: boolean;
  price: number;
  totalCost?: number;
  finalPaid?: boolean;
}

interface AppointmentState {
  appointments: Appointment[];
  loading: boolean;
}

const initialState: AppointmentState = {
  appointments: [],
  loading: false,
};

// Hàm sắp xếp appointments
const sortAppointments = (appointments: Appointment[]) => {
  return [...appointments].sort((a, b) => {
    // Nếu một trong hai lịch hẹn bị hủy, đưa nó xuống dưới
    if (a.status === "Cancelled" && b.status !== "Cancelled") return 1;
    if (a.status !== "Cancelled" && b.status === "Cancelled") return -1;

    // Nếu cả hai đều bị hủy hoặc không bị hủy, sắp xếp theo thời gian
    return new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime();
  });
};

const appointmentSlice = createSlice({
  name: "appointments",
  initialState,
  reducers: {
    setAppointments: (state, action: PayloadAction<Appointment[]>) => {
      state.appointments = sortAppointments(action.payload);
    },
    addAppointment: (state, action: PayloadAction<Appointment>) => {
      state.appointments = sortAppointments([...state.appointments, action.payload]);
    },
    updateAppointmentStatus: (state, action: PayloadAction<{ id: string; status: string }>) => {
      const appointment = state.appointments.find(app => app._id === action.payload.id);
      if (appointment) {
        appointment.status = action.payload.status as "Pending" | "Completed" | "Cancelled" | "confirmed";
        // Sắp xếp lại danh sách sau khi cập nhật trạng thái
        state.appointments = sortAppointments(state.appointments);
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setAppointments, addAppointment, updateAppointmentStatus, setLoading } = appointmentSlice.actions;
export default appointmentSlice.reducer; 