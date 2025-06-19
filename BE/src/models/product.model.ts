import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  clinicId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  category: string;
  active: boolean;
  image : string
}

const ProductSchema: Schema = new Schema(
  {
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stockQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    image:{
      type: String,
      required: true,
    },

  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IProduct>("Product", ProductSchema);
