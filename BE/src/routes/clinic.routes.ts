import express from 'express';
import {
  createClinic,
  getAllClinic,
  getClinicById,
  updateClinic,
  banClinic,
  unbanClinic,
  searchClinics,
  getDoctorsInClinic,
  addDoctorToClinic,
  removeDoctorFromClinic,
  findNearbyClinics,
} from '../controllers/clinic.controller';

const router = express.Router();

router.get('/search-clinic', searchClinics);
router.get('/getall', getAllClinic);
router.post('/create-clinic', createClinic);
router.get('/get-clinic-detail/:id', getClinicById);
router.put('/update-clinic/:id', updateClinic);
router.delete('/ban-clinic/:id', banClinic);
router.patch('/unban-clinic/:id', unbanClinic);

// Routes cho quản lý bác sĩ trong phòng khám
router.get('/:clinicId/doctors', getDoctorsInClinic);
router.post('/add-doctor', addDoctorToClinic);
router.delete('/remove-doctor', removeDoctorFromClinic);
router.get('/nearby', findNearbyClinics);
export default router;
