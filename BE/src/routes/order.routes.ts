import express from "express";
import {
  createOrder,
  getOrdersByClinic,
  getOrderByClinic,
  updateOrderByClinic,
  deleteOrderByClinic,
  getOrder,
  getOrderDetail,
  cancelOrder,
  confirmOrder,
} from "../controllers/order.controller";
import { isAuthenticated } from "../middlewares/auth.middlewares";
// import { isAuthenticated } from "../middlewares/auth.middlewares";
// import {
//   cartList,
//   addToCart,
//   updateCartItem,
//   deleteCartItem,
// } from "../controllers/cart.controller";
const router = express.Router();

// router.get("/cart-list", isAuthenticated, cartList);
// router.post("/add-to-cart/:clinicId", isAuthenticated, addToCart);
// router.put(
//   "/update-cart-item/:clinicId/:itemId",
//   isAuthenticated,
//   updateCartItem
// );
// router.delete(
//   "/delete-cart-item/:clinicId/:itemId",
//   isAuthenticated,
//   deleteCartItem
// );

//customer and staff routes
// Lấy danh sách đơn hàng của cus or staff
router.get("/order-list", isAuthenticated, getOrder);
// Lấy chi tiết đơn hàng
router.get("/order-detail/:orderId", isAuthenticated, getOrderDetail);
// Hủy đơn hàng cho cus
router.patch("/cancel-order/:orderId", isAuthenticated, cancelOrder);
//confirm order cho staff
router.patch("/confirm-order/:orderId", isAuthenticated, confirmOrder);

//cua ai tu dien
router.post("/create-order/:clinicId", createOrder);
router.get("/:clinicId", getOrdersByClinic);
router.get("/:clinicId/:orderId", getOrderByClinic);
router.put("/:clinicId/:orderId", updateOrderByClinic);
router.delete("/:clinicId/:orderId", deleteOrderByClinic);

export default router;
