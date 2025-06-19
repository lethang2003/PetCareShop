import mongoose, { Schema, Document } from "mongoose";

export interface IPet extends Document {
  petName: string;
  customerId: mongoose.Types.ObjectId;
  createBy: mongoose.Schema.Types.ObjectId;
  speciesId: mongoose.Types.ObjectId;
  gender: string;
  age: number;
  imageUrl: string;
  medicalHistory: string;
  weight: number;
  isDeleted: boolean; 
}

const PetSchema: Schema = new Schema(
  {
    petName: {
      type: String,
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    speciesId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Species",
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
      min: 0,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    medicalHistory: {
      type: String,
      default: "",
    },
    weight: {
      type: Number,
      required: true,
      min: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },

  {
    timestamps: true,
  }
);

export default mongoose.model<IPet>("Pet", PetSchema);