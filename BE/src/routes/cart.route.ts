import express from "express";
import { isAuthenticated } from "../middlewares/auth.middlewares";
import {
  cartList,
  addToCart,
  updateCartItem,
  deleteCartItem,
  checkoutCart
} from "../controllers/cart.controller";
const router = express.Router();

router.get("/cart-list", isAuthenticated, cartList);
router.post("/add-to-cart", isAuthenticated, addToCart);
router.put(
  "/update-cart-item/:itemId",
  isAuthenticated,
  updateCartItem
);
router.delete(
  "/delete-cart-item/:itemId",
  isAuthenticated,
  deleteCartItem
);

router.post(
  "/checkout-cart",
  isAuthenticated,
  checkoutCart
);

export default router;
