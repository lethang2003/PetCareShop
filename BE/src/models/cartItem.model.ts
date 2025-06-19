// models/cartItem.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface CartItemDocument extends Document {
  cartId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
}

const CartItemSchema = new Schema<CartItemDocument>(
  {
    cartId: { type: Schema.Types.ObjectId, ref: "Cart", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<CartItemDocument>("CartItem", CartItemSchema);
