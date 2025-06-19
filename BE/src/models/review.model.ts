import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
    customerId: mongoose.Types.ObjectId;
    appointmentId: mongoose.Types.ObjectId;
    reviewType: 'clinic' | 'doctor' | 'service';
    clinicId?: mongoose.Types.ObjectId;
    doctorId?: mongoose.Types.ObjectId;
    serviceId?: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
}

const ReviewSchema: Schema = new Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
            required: true,
        },
        reviewType: {
            type: String,
            enum: ['clinic', 'doctor', 'service'],
            required: true,
        },
        clinicId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Clinic",
            required: false,
        },
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },
        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service",
            required: false,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IReview>("Review", ReviewSchema);
