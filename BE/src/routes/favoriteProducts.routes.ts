import express from "express";
import {
  addToWishlist,
  getWishlistByUser,
  getWishlistByUserAndClinic,
  removeFromWishlist,
} from "../controllers/favoriteProducts.controller";

const router = express.Router();

// Thêm sản phẩm vào wishlist
router.post("/add-wishlist", addToWishlist);

// Lấy tất cả wishlist của một user (toàn bộ clinic)
router.get("/:customerId", getWishlistByUser);

// Lấy wishlist của một user trong 1 clinic cụ thể
router.get("/:customerId/:clinicId", getWishlistByUserAndClinic);

// Xoá sản phẩm khỏi wishlist
router.delete("/:customerId/:productId", removeFromWishlist);

export default router;
