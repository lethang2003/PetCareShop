import mongoose, { Schema, Document } from 'mongoose';

export interface IAdditionalServices extends Document {
  serviceId: mongoose.Types.ObjectId; // ID dịch vụ phụ
  appointmentId: mongoose.Types.ObjectId; // ID lịch hẹn
  name: string; // Tên dịch vụ phụ
  price: number; // Giá dịch vụ phụ
  createdAt: Date; // Ngày tạo
  updatedAt: Date; // Ngày cập nhật cuối
}

const AdditionalServicesSchema: Schema = new Schema(
  {
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true }, // ID dịch vụ phụ
    appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true }, // ID lịch hẹn
    name: { type: String, required: true }, // Tên dịch vụ phụ
    price: { type: Number, required: true }, // Giá dịch vụ phụ
    createdAt: { type: Date, default: Date.now }, // Ngày tạo
    updatedAt: { type: Date, default: Date.now } // Ngày cập nhật cuối
  },
  { timestamps: true }
);

export default mongoose.model<IAdditionalServices>('AdditionalServices', AdditionalServicesSchema); 