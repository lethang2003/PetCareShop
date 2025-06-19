import express from 'express';
import {
  createDiscountCode,
  getAllDiscountCodes,
  getDiscountCodeById,
  updateDiscountCode,
  deleteDiscountCode,
  applyDiscount
} from '../controllers/discountCode.controller';
import { validateDiscountCode } from '../middlewares/discountCode.middlewares';
import { authorizeRoles, isAuthenticated } from '../middlewares/auth.middlewares';

const router = express.Router();

router.post('/create-discount',isAuthenticated, authorizeRoles('manager'), createDiscountCode);
router.get('/view-discount',isAuthenticated, getAllDiscountCodes);
router.get('/view-detail-discount/:discountId',isAuthenticated, getDiscountCodeById);
router.put('/update-discount/:discountId', isAuthenticated, authorizeRoles('manager'),updateDiscountCode);
router.delete('/delete-discount/:discountId', isAuthenticated, authorizeRoles('manager'),deleteDiscountCode);
router.post('/apply-discount',isAuthenticated, validateDiscountCode, applyDiscount);

export default router;
