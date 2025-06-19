import express from "express";
import {
  createWorkSchedule,
  getAllWorkSchedules,
  getWorkScheduleById,
  updateWorkSchedule,
  deleteWorkSchedule,
  registerWorkSchedule,
  getAvailableSchedulesDoctor,
  getMyScheduleDoctor,
  getSwappableSchedules,
} from "../controllers/workSchedules.controller";
import {
  isAuthenticated,
  authorizeRoles,
} from "../middlewares/auth.middlewares";
const router = express.Router();

router.get("/getall", getAllWorkSchedules);
router.get("/available-schedules", isAuthenticated, getAvailableSchedulesDoctor);
router.get("/my-schedule-doctor", isAuthenticated, getMyScheduleDoctor);
router.post("/create-schedule", createWorkSchedule);
router.post("/register-schedule", isAuthenticated, registerWorkSchedule);
router.get("/get-schedule-detail/:id", getWorkScheduleById);
router.put("/update-schedule/:id", updateWorkSchedule);
router.delete("/delete-schedule/:id", deleteWorkSchedule);
router.get("/swappable-schedules/:currentScheduleId", isAuthenticated, getSwappableSchedules);

export default router;