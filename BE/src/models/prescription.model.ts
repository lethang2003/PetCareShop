import mongoose, { Document, Schema } from 'mongoose';

export interface IPrescription extends Document {
  appointmentId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  instructions: string;
  medications: string;
  createdAt: Date;
  pdfUrl?: string;
}

const PrescriptionSchema = new Schema<IPrescription>(
  {
    appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    instructions: { type: String, required: true },
    medications: { type: String, required: true },
    pdfUrl: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<IPrescription>('Prescription', PrescriptionSchema);
