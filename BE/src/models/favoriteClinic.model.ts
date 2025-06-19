import mongoose, { Schema, Document } from 'mongoose';

export interface IFavoriteClinic extends Document {
  customerId: mongoose.Types.ObjectId;
  clinicId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FavoriteClinicSchema: Schema = new Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Ràng buộc một customer không thể thêm cùng một clinic 2 lần
FavoriteClinicSchema.index({ customerId: 1, clinicId: 1 }, { unique: true });

export default mongoose.model<IFavoriteClinic>('FavoriteClinic', FavoriteClinicSchema);
