import express from "express";
import {
  createProductByClinic,
  getProductsByClinic,
  getProductByIdForClinic,
  updateProductByClinic,
  deleteProductByClinic,
  getProductsByCustomer,
  getProductsByClinicbyID,
  changeProductStatus,
} from "../controllers/product.controller";
import {
  authorizeRoles,
  isAuthenticated,
} from "../middlewares/auth.middlewares";
import upload from "../middlewares/upload.middleware";

const router = express.Router(); // ✅ PHẢI dùng .Router()

router.post(
  "/create-product",
  isAuthenticated,
  authorizeRoles("staff"),
  upload.single("image"),
  createProductByClinic
);
router.get(
  "/view-product",
  isAuthenticated,
  authorizeRoles("staff"),
  getProductsByClinic
);

router.get(
  "/view-product/:id",
  // isAuthenticated,
  // authorizeRoles("staff"),
  getProductsByClinicbyID
);

router.get(
  "/view-product/guest/:nameProduct",
  getProductsByCustomer
);
router.get(
  "/:clinicId/:productId",
  isAuthenticated,
  authorizeRoles("staff"),
  getProductByIdForClinic
);
router.put(
  "/:productId",
  isAuthenticated,
  authorizeRoles("staff"),
  upload.single("image"),
  updateProductByClinic
);
router.delete(
  "/:productId",
  isAuthenticated,
  authorizeRoles("staff"),
  deleteProductByClinic
);

//thay doi status thang product
router.patch("/:productId/status", isAuthenticated, authorizeRoles("staff"), changeProductStatus);

export default router;
