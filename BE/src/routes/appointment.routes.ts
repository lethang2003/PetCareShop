import express from 'express';
import {
  createAppointment,
  getAppointmentsByCustomer,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  cancelAppointment,
  checkAppointmentAvailability,
} from '../controllers/appointment.controller';
import { isAuthenticated, authorizeRoles } from '../middlewares/auth.middlewares';

const router = express.Router();

router.post('/create-appointment', isAuthenticated, authorizeRoles('customer'), createAppointment);
router.get('/view-appointment', isAuthenticated, authorizeRoles('manager', 'doctor','customer'), getAppointmentsByCustomer);
router.get('/view-detail-appointment/:appointmentId', isAuthenticated, getAppointmentById);
router.put('/update-appointment/:appointmentId', isAuthenticated, updateAppointment);
router.delete('/delete-appointment/:appointmentId', isAuthenticated, deleteAppointment);
router.put('/cancel-appointment/:appointmentId', isAuthenticated, cancelAppointment);
router.post('/check-appointment-availability', isAuthenticated, checkAppointmentAvailability);



export default router;
