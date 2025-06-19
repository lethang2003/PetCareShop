import express from 'express';
import { createAppointmentPayment, vnpayReturnAppointment, payCashAndCreateOrder,
    createPaymentUrlForCart, vnpayReturnCart

 } from '../controllers/payment.controller';
import { isAuthenticated } from '../middlewares/auth.middlewares';

const router = express.Router();

// Tạo link thanh toán cho lịch hẹn
router.get('/appointment/:appointmentId', isAuthenticated, createAppointmentPayment);

// Xử lý callback từ VNPAY
router.get('/vnpay-return-appointment', vnpayReturnAppointment);
router.post('/vnpay-return-appointment', vnpayReturnAppointment);


//payment cart order by cash
router.post("/pay-cash", isAuthenticated, payCashAndCreateOrder);

// 1. Tạo link thanh toán VNPAY từ giỏ hàng
// POST /api/payment/create-vnpay-url
router.post("/create-vnpay-url", isAuthenticated, createPaymentUrlForCart);

// 2. Xử lý khi VNPAY trả về (sau khi thanh toán)
// GET /api/payment/vnpay-return
router.get("/vnpay-return", vnpayReturnCart);

// 3. Tạo đơn hàng sau khi thanh toán (nếu muốn tách riêng flow)
// POST /api/payment/checkout
// router.post("/checkout", isAuthenticated, checkoutCartAndCreateOrder);

export default router;