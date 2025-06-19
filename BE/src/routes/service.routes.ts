import express from 'express';
import {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  getServiceByClinic
} from '../controllers/service.controller';
import { authorizeRoles, isAuthenticated } from '../middlewares/auth.middlewares';

const router = express.Router();

router.post('/create-service', isAuthenticated, authorizeRoles('manager'), createService);
router.get('/view-service', getAllServices);
router.get('/view-detail-service/:serviceId', getServiceById);
router.put('/update-service/:serviceId', isAuthenticated, authorizeRoles('manager'), updateService);
router.delete('/delete-service/:serviceId', isAuthenticated, authorizeRoles('manager'), deleteService);
router.get('/view-service-by-clinic/:clinicId', getServiceByClinic);

export default router;