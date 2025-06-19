import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  clinicId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // ⬅️ Thêm dòng này để bật tự động cập nhật createdAt & updatedAt
  }
);

export default mongoose.model<IOrder>("Order", OrderSchema);
