import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  email: string;
  password: string;
  fullName: string;
  phone: number;
  role: 'guest' | 'customer' | 'doctor' | 'staff' | 'manager' | 'admin';
  avatar: string;
  address: string;
  isActive: boolean;
  isBlock: boolean;
  isClinic: boolean;
  specialization?: string;
  isVerified: boolean;
  emailToken: string
  comparePassword(candidatePassword: string): Promise<boolean>;
  resetOtp: string;
  otpExpires: Date;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  phone: { type: Number },
  role: {
    type: String,
    enum: ['guest', 'customer', 'doctor', 'staff', 'manager', 'admin'],
    default: 'customer'
  },
  avatar: { type: String },
  address: { type: String },

  specialization: { type: String },
  favoriteClinicIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' }],
  favoriteProductIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  isActive: { type: Boolean, default: true },
  isBlock: { type: Boolean, default: false },
  isClinic: { type: Boolean, default: false },
  isVerified: {
    type: Boolean,
    default: false,
  },
  emailToken: {
    type: String,
    required: false,
  },
  resetOtp: { type: String },
  otpExpires: { type: Date },
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);