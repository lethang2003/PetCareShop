import express from "express";
import {
  createPetCustomer,
  getPetById,
  createPetDoctor,
  viewAllPetsByCustomer,
  DeletePetByCustomer,
  updatePetByCustomer,
  viewAllPetsByDoctor,
  updatePetByDoctor,
} from "../controllers/pet.controller";
import {
  isAuthenticated,
  authorizeRoles,
} from "../middlewares/auth.middlewares";
import upload from "../middlewares/upload.middleware";
const router = express.Router();

router.post(
  "/create-pet-customer",
  isAuthenticated,
  upload.single("image"),
  createPetCustomer
);
router.post(
  "/create-pet-doctor",
  upload.single("image"),
  isAuthenticated,
  createPetDoctor
);
router.get("/view-all-pet-customer", isAuthenticated, viewAllPetsByCustomer);
router.get(
  "/view-all-pet-doctor",
  isAuthenticated,
  authorizeRoles("doctor"),
  viewAllPetsByDoctor
);
router.get("/pet-detail/:id", getPetById);
router.put(
  "/update-pet-customer/:id",
  upload.single("image"),
  isAuthenticated,
  updatePetByCustomer
);
router.put(
  "/update-pet-doctor/:id",
  isAuthenticated,
  upload.single("image"),
  updatePetByDoctor
);

router.put("/delete-pet/:id", isAuthenticated, DeletePetByCustomer);
export default router;
