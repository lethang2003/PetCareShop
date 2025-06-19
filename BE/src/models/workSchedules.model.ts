import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkSchedule extends Document {
  doctorId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  swappedWith: mongoose.Types.ObjectId | null;
  work_Date: Date;
  start_time: Date;
  end_time: Date;
  status: 'opening' | 'closing';
}

const WorkScheduleSchema: Schema = new Schema(
  {
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
    swappedWith: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkSchedule', default: null },
    work_Date: { type: Date, required: true },
    start_time: { type: Date, required: true },
    end_time: { type: Date, required: true },
    status: {
      type: String,
      enum: ['opening', 'closing'],
      default: 'opening',
    },
  },
  {
    timestamps: true,
  }
);

// Tự tính status dựa vào giờ bắt đầu và kết thúc
WorkScheduleSchema.pre<IWorkSchedule>('save', function (next) {
  const startHour = this.start_time.getHours();
  const endHour = this.end_time.getHours();

  if (startHour >= 7 && endHour <= 21) {
    this.status = 'opening';
  } else {
    this.status = 'closing';
  }

  next();
});

export default mongoose.model<IWorkSchedule>('WorkSchedule', WorkScheduleSchema);