import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middlewares"; // điều chỉnh path đúng nếu cần
import Review from "../models/review.model";
import Clinic from "../models/clinic.model";
import User from "../models/user.model";
import Appointment from "../models/appointment.model";
import Service from "../models/service.model";

// Tạo review
export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { appointmentId, rating, comment, reviewType } = req.body;
        const customerId = req.user?.id;

        if (!customerId) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        // Kiểm tra appointment tồn tại và đã hoàn thành
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            res.status(404).json({ message: "Appointment not found" });
            return;
        }

        if (appointment.status.toLowerCase() !== "completed") {
            res.status(400).json({ message: "Can only review after appointment is completed" });
            return;
        }

        if (appointment.customerId.toString() !== customerId) {
            res.status(403).json({ message: "You don't have permission to review this appointment" });
            return;
        }

        // Kiểm tra reviewType hợp lệ
        const validReviewTypes = ['clinic', 'doctor', 'service'];
        if (!validReviewTypes.includes(reviewType)) {
            res.status(400).json({ message: "Invalid review type" });
            return;
        }

        // Kiểm tra nếu đã review trước đó cho đối tượng này
        const existed = await Review.findOne({
            customerId,
            appointmentId,
            reviewType,
        });

        if (existed) {
            res.status(400).json({ message: `You have already reviewed this ${reviewType}` });
            return;
        }

        // Tạo review dựa trên reviewType
        const reviewData: any = {
            customerId,
            appointmentId,
            reviewType,
            rating,
            comment,
        };

        switch (reviewType) {
            case 'clinic':
                reviewData.clinicId = appointment.clinicId;
                break;
            case 'doctor':
                if (!appointment.doctorId) {
                    res.status(400).json({ message: "This appointment has no doctor" });
                    return;
                }
                reviewData.doctorId = appointment.doctorId;
                break;
            case 'service':
                if (!appointment.serviceId) {
                    res.status(400).json({ message: "This appointment has no service" });
                    return;
                }
                reviewData.serviceId = appointment.serviceId;
                break;
        }

        const review = await Review.create(reviewData);

        // Populate thông tin chi tiết cho review vừa tạo
        const populatedReview = await Review.findById(review._id)
            .populate("customerId", "fullName avatar")
            .populate("clinicId", "name address phone email")
            .populate("doctorId", "fullName avatar email phone")
            .populate("serviceId", "name price description");

        res.status(201).json({
            message: `Successfully reviewed ${reviewType}`,
            review: populatedReview
        });
    } catch (err) {
        console.error("Review error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// Lấy tất cả review
export const getAllReviews = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        const reviews = await Review.find()
            .populate("customerId", "fullName avatar")
            .populate("clinicId", "name address phone email")
            .populate("doctorId", "fullName avatar email phone")
            .populate("serviceId", "name price description");

        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// Lấy review theo phòng khám
export const getReviewsByClinic = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const clinicId = req.params.clinicId;

        const reviews = await Review.find({
            clinicId,
            reviewType: 'clinic'
        })
            .populate("customerId", "fullName avatar")
            .populate("clinicId", "name address phone email")
            .populate("doctorId", "fullName avatar email phone")
            .populate("serviceId", "name price description");

        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// Lấy review theo bác sĩ
export const getReviewsByDoctor = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const doctorId = req.params.doctorId;

        const reviews = await Review.find({
            doctorId,
            reviewType: 'doctor'
        })
            .populate("customerId", "fullName avatar")
            .populate("clinicId", "name address phone email")
            .populate("doctorId", "fullName avatar email phone")
            .populate("serviceId", "name price description");

        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// Lấy review theo dịch vụ
export const getReviewsByService = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const serviceId = req.params.serviceId;

        const reviews = await Review.find({
            serviceId,
            reviewType: 'service'
        })
            .populate("customerId", "fullName avatar")
            .populate("clinicId", "name address phone email")
            .populate("doctorId", "fullName avatar email phone")
            .populate("serviceId", "name price description");

        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// Xoá review
export const deleteReview = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const reviewId = req.params.reviewId;
        const customerId = req.user?.id;

        const review = await Review.findById(reviewId);

        if (!review) {
            res.status(404).json({ message: "Review not found" });
            return;
        }

        if (review.customerId.toString() !== customerId) {
            res.status(403).json({ message: "You don't have permission to delete this review" });
            return;
        }

        await Review.findByIdAndDelete(reviewId);
        res.json({ message: "Review deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};
