import express from "express";
import { isAuthenticated } from "../middlewares/auth.middlewares";
import {
    createReview,
    deleteReview,
    getAllReviews,
    getReviewsByClinic,
    getReviewsByDoctor,
    getReviewsByService
} from "../controllers/review.controller";

const router = express.Router();

// Tạo review mới
router.post("/", isAuthenticated, createReview);

// Lấy tất cả review
router.get("/", getAllReviews);

// Lấy review theo phòng khám
router.get("/clinic/:clinicId", getReviewsByClinic);

// Lấy review theo bác sĩ
router.get("/doctor/:doctorId", getReviewsByDoctor);

// Lấy review theo dịch vụ
router.get("/service/:serviceId", getReviewsByService);

// Xóa review
router.delete("/:reviewId", isAuthenticated, deleteReview);

export default router;

