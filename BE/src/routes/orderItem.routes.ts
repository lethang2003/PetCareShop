import express from "express";
import {
  createOrderItem,
  getItemsByOrder,
  updateOrderItem,
  deleteOrderItem,
} from "../controllers/orderItem.controller";

const router = express.Router();

router.post("/create-orderItem", createOrderItem); // tạo item mới
router.get("/:orderId", getItemsByOrder); // lấy item theo orderId
router.put("/:orderItemId", updateOrderItem); // cập nhật item
router.delete("/:orderItemId", deleteOrderItem); // xoá item

export default router;
