import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkScheduleTransfer extends Document {
  doctorId: mongoose.Types.ObjectId; // người gửi yêu cầu
  workScheduleId: mongoose.Types.ObjectId; // lịch của bác sĩ A
  targetScheduleId: mongoose.Types.ObjectId; // lịch của bác sĩ B
  status: 'pending' | 'accepted' | 'rejected';
  requestedAt: Date;
  respondedAt?: Date;
}

const WorkScheduleTransferSchema: Schema = new Schema(
  {
    doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    workScheduleId: { type: Schema.Types.ObjectId, ref: 'WorkSchedule', required: true },
    targetScheduleId: { type: Schema.Types.ObjectId, ref: 'WorkSchedule', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    requestedAt: { type: Date, default: Date.now },
    respondedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IWorkScheduleTransfer>('WorkScheduleTransfer', WorkScheduleTransferSchema);