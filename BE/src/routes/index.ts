import { Router } from "express";
import userRoutes from "./user.routes";
import forumPostRoutes from "./forumPost.routes";
import authRoutes from "./auth.routes";
import petRoutes from "./pet.routes";
import clinicRoutes from "./clinic.routes";
import discountCodeRoutes from "./discountCode.routes";
import workSchedulesRoutes from "./workSchedules.routes";
import productRoutes from "./product.routes";
import prescriptionRoutes from "./prescription.routes";
import orderItemRoutes from "./orderItem.routes";
import orderRoutes from "./order.routes";
import favoriteProductRoutes from "./favoriteProducts.routes";
import appointmentRoutes from "./appointment.routes";
import favoriteClinicRoutes from "./favoriteClinic.routes";
import workScheduleTransferRoutes from "./workScheduleTransfer.routes";
import reviewRoutes from "./review.routes";
import serviceRoutes from "./service.routes";
import upload from "./upload.routes";
import comment from "./comment.routes";
import payment from "./payment.routes";
import cart from "./cart.route";
const router = Router();

router.use("/forum-posts", forumPostRoutes);
router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/pets", petRoutes);
router.use("/clinic", clinicRoutes);
router.use("/discountCode", discountCodeRoutes);
router.use("/schedules", workSchedulesRoutes);
router.use("/products", productRoutes);
router.use("/orderItem", orderItemRoutes);
router.use("/orders", orderRoutes);
router.use("/favoriteProducts", favoriteProductRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/favorite-clinic", favoriteClinicRoutes);
router.use("/schedule-transfer", workScheduleTransferRoutes);
router.use("/review", reviewRoutes);
router.use("/service", serviceRoutes);
router.use("/prescriptions", prescriptionRoutes);
router.use("/upload", upload);
router.use("/comment", comment);
router.use("/payment", payment);
router.use("/carts", cart);

export default router;
