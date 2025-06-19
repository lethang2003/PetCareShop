import mongoose, { Schema, Document } from "mongoose";

export interface IService extends Document {
  clinicId: mongoose.Types.ObjectId;
  name: string;
  category: string;
  description: string;
  price: number;
  imageUrl: string;
}

const ServiceSchema: Schema = new Schema({
  clinicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Clinic",
    required: true,
  },
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  imageUrl: {
    type: String,
    default: "",
  },
});

export default mongoose.model<IService>("Service", ServiceSchema);
