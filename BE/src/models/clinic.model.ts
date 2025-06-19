import mongoose, { Schema, Document } from 'mongoose';


export interface IClinic extends Document {
  name: string;
  address: string;
  city: string;
  phone: number;
  email: string;
  description: string;
  images: string[];
  licenseNumber: string;
  licenseImage: string;
  isVerified: boolean;
  managerId: mongoose.Types.ObjectId;
  workingHours: mongoose.Schema.Types.ObjectId;
  rating: number;
  reviewCount: number;
  doctorIds: mongoose.Types.ObjectId[];
  staffIds: mongoose.Types.ObjectId[];
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  createdAt: Date;
  updatedAt: Date;
}

const ClinicSchema: Schema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  phone: { type: Number, required: true },
  email: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String }],
  licenseNumber: { type: String, required: true },
  licenseImage: { type: String, required: true },
  isVerified: { type: Boolean, default: true },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workingHours: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkSchedules' },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  doctorIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  staffIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  location: {
  type: {
    type: String,
    enum: ['Point'],
    required: true,
    default: 'Point',
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true,
  }
},

}, {
  timestamps: true
});
ClinicSchema.index({ location: '2dsphere' });


// Tạo index để tìm kiếm
ClinicSchema.index({ name: 'text', address: 'text', city: 'text' });

export default mongoose.model<IClinic>('Clinic', ClinicSchema);