import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  customerId: mongoose.Types.ObjectId; // ID khách hàng
  petId: mongoose.Types.ObjectId; // ID thú cưng
  doctorId: mongoose.Types.ObjectId; // ID bác sĩ
  clinicId: mongoose.Types.ObjectId; // ID phòng khám
  serviceId: mongoose.Types.ObjectId; // ID dịch vụ
  appointment_date: Date; // Ngày hẹn
  symptoms: string; // Triệu chứng
  status: string; // Trạng thái lịch hẹn
  cancelReason?: string; // Lý do hủy lịch
  reminderSent: boolean; // Đã gửi nhắc lịch chưa
  depositAmount: number; // Số tiền đặt cọc
  isDepositPaid: boolean; // Đã thanh toán đặt cọc chưa
  paymentMethod: string; // Phương thức thanh toán
  isServicePaid: boolean; // Đã thanh toán dịch vụ chưa
  totalServicePrice: number; // Tổng giá dịch vụ
  totalCost: number; // Tổng chi phí
  finalPaid: boolean; // Đã thanh toán toàn bộ chưa
  createdAt: Date; // Ngày tạo
  updatedAt: Date; // Ngày cập nhật cuối
}

const AppointmentSchema: Schema = new Schema(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // ID khách hàng
    petId: { type: Schema.Types.ObjectId, ref: 'Pet', required: true }, // ID thú cưng
    doctorId: { type: Schema.Types.ObjectId, ref: 'User' }, // ID bác sĩ
    clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', required: true }, // ID phòng khám
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', }, // ID dịch vụ
    appointment_date: { type: Date, required: true }, // Ngày hẹn
    symptoms: { type: String }, // Triệu chứng
    status: { type: String, enum: ['Pending', 'confirmed', 'completed', 'cancelled'], default: 'Pending' }, // Trạng thái lịch hẹn
    cancelReason: { type: String }, // Lý do hủy lịch
    reminderSent: { type: Boolean, default: false }, // Đã gửi nhắc lịch chưa
    depositAmount: { type: Number, default: 0 }, // Số tiền đặt cọc
    isDepositPaid: { type: Boolean, default: false }, // Đã thanh toán đặt cọc chưa
    paymentMethod: { type: String }, // Phương thức thanh toán
    isServicePaid: { type: Boolean, default: false }, // Đã thanh toán dịch vụ chưa
    totalServicePrice: { type: Number, default: 0 }, // Tổng giá dịch vụ
    totalCost: { type: Number, default: 0 }, // Tổng chi phí
    finalPaid: { type: Boolean, default: false }, // Đã thanh toán toàn bộ chưa
    createdAt: { type: Date, default: Date.now }, // Ngày tạo
    updatedAt: { type: Date, default: Date.now } // Ngày cập nhật cuối
  },
  { timestamps: true }
);

export default mongoose.model<IAppointment>('Appointment', AppointmentSchema);
