import express from 'express';
import {
  createPrescription,
  getAllPrescriptions,
  getPrescriptionById,
  deletePrescription,
  downloadPrescriptionPdf,
} from '../controllers/prescription.controller';
import { authorizeRoles, isAuthenticated } from '../middlewares/auth.middlewares';

const router = express.Router();

router.post('/create-prescription',isAuthenticated,authorizeRoles('doctor'), createPrescription);
router.get('/view-prescription',isAuthenticated,authorizeRoles('doctor'), getAllPrescriptions);
router.get('/view-detail-prescription/:prescriptionid',isAuthenticated,authorizeRoles('doctor'), getPrescriptionById);
router.delete('/delete-prescription/:prescriptionid',isAuthenticated,authorizeRoles('doctor'), deletePrescription);
router.get('/download-prescription/:prescriptionid',isAuthenticated,authorizeRoles('doctor'), downloadPrescriptionPdf);
export default router;
