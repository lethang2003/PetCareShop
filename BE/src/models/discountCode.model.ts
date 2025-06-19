import mongoose, { Schema, Document } from 'mongoose';

export interface IDiscountCode extends Document {
  clinicId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscountAmount?: number;
  maxUse: number;
  usedCount: number;
  usedBy: mongoose.Types.ObjectId[];
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DiscountCodeSchema: Schema = new Schema(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    code: { type: String, required: true, unique: true },
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    discountValue: { type: Number, required: true },
    maxDiscountAmount: { type: Number },
    maxUse: { type: Number, required: true },
    usedCount: { type: Number, default: 0 },
    usedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }], 
    isActive: { type: Boolean, default: true }, 
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IDiscountCode>('DiscountCode', DiscountCodeSchema);