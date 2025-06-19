// models/cart.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface CartDocument extends Document {
  clinicId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  cartItem: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CartSchema = new Schema<CartDocument>(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    totalAmount: { type: Number, default: 0 },
    status: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    cartItem: [{ type: Schema.Types.ObjectId, ref: "CartItem" }],
  },
  { timestamps: true }
);

export default mongoose.model<CartDocument>("Cart", CartSchema);
