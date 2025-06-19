import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem extends Document {
  orderId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  stockQuantity: number;
  price: number;
}

const OrderItemSchema: Schema = new Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    stockQuantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IOrderItem>("OrderItem", OrderItemSchema);
