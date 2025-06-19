import mongoose, { Schema, Document } from "mongoose";

export interface ISpecies extends Document {
  speciesName: string;
  isDeleted: boolean;
}

const SpeciesSchema: Schema = new Schema(
  {
    speciesName: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
export default mongoose.model<ISpecies>("Species", SpeciesSchema);
