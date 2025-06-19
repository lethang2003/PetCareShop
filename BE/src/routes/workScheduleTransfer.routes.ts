import express from 'express';
import {
  createTransferRequest,
  acceptTransferRequest,
  rejectTransferRequest,
  getMyTransferRequests
} from '../controllers/workScheduleTransfer.controller';
import { isAuthenticated } from '../middlewares/auth.middlewares';
import { getSwappableSchedules } from '../controllers/workSchedules.controller';

const router = express.Router();

router.post('/create-transfer', isAuthenticated, createTransferRequest);               // Gửi yêu cầu đổi lịch
router.put('/:id/accept-transfer', isAuthenticated, acceptTransferRequest);     // Chấp nhận yêu cầu
router.put('/:id/reject-transfer', isAuthenticated, rejectTransferRequest);     // Từ chối yêu cầu
router.get('/my-transfer', isAuthenticated, getMyTransferRequests);             // Lấy yêu cầu của tôi

export default router;
