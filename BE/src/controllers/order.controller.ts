// src/controllers/order.controller.ts
import { Request, Response } from "express";
import Order from "../models/orders.model";
import Product from "../models/product.model";
import { AuthRequest } from "../middlewares/auth.middlewares";
import mongoose from "mongoose";
import OrderItem from "../models/orderItem.model";

// Tạo đơn hàng mới cho một clinic
export const createOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const clinicId = req.params.clinicId;
    const newOrder = new Order({ ...req.body, clinicId });
    await newOrder.save();

    res.status(201).json({
      message: "Order created successfully",
      success: true,
      data: newOrder,
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to create order", success: false, error });
  }
};

// Lấy tất cả đơn hàng theo clinic
export const getOrdersByClinic = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const clinicId = req.params.clinicId;
    const orders = await Order.find({ clinicId });

    res.status(200).json({
      message: "Orders fetched successfully",
      success: true,
      data: orders,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch orders", success: false, error });
  }
};

// Lấy chi tiết 1 đơn hàng theo clinic
export const getOrderByClinic = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { clinicId, orderId } = req.params;
    const order = await Order.findOne({ _id: orderId, clinicId });

    if (!order) {
      res.status(404).json({ message: "Order not found", success: false });
      return;
    }

    res
      .status(200)
      .json({ message: "Order found", success: true, data: order });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch order", success: false, error });
  }
};

// Cập nhật đơn hàng theo clinic
export const updateOrderByClinic = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { clinicId, orderId } = req.params;
    const updated = await Order.findOneAndUpdate(
      { _id: orderId, clinicId },
      req.body,
      { new: true }
    );

    if (!updated) {
      res
        .status(404)
        .json({ message: "Order not found or unauthorized", success: false });
      return;
    }

    res.status(200).json({
      message: "Order updated successfully",
      success: true,
      data: updated,
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to update order", success: false, error });
  }
};

// Xoá đơn hàng theo clinic
export const deleteOrderByClinic = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { clinicId, orderId } = req.params;
    const deleted = await Order.findOneAndDelete({ _id: orderId, clinicId });

    if (!deleted) {
      res
        .status(404)
        .json({ message: "Order not found or unauthorized", success: false });
      return;
    }

    res
      .status(200)
      .json({ message: "Order deleted successfully", success: true });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete order", success: false, error });
  }
};

// Lấy danh sách đơn hàng của cus hoac staff
export const getOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId || !role) {
      res.status(403).json({ success: false, message: "Không xác định được người dùng" });
      return;
    }

    let orders;

    if (role === "customer") {
      orders = await Order.find({ customerId: userId });
    } else if (role === "staff") {
      orders = await Order.find(); // staff thấy tất cả
    } else {
      res.status(403).json({ success: false, message: "Bạn không có quyền xem đơn hàng" });
      return;
    }

    res.status(200).json({
      message: "Lấy danh sách đơn hàng thành công",
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      message: "Không thể lấy đơn hàng",
      success: false,
      error: error instanceof Error ? error.message : error,
    });
  }
};

// Lấy chi tiết đơn hàng
export const getOrderDetail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      res.status(400).json({ success: false, message: "Order ID không hợp lệ" });
      return;
    }

    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
      return;
    }

    if (role === "customer" && order.customerId.toString() !== userId) {
      res.status(403).json({ success: false, message: "Không có quyền xem đơn hàng này" });
      return;
    }

   

   
    const orderItems = await OrderItem.find({ orderId })
      .populate("productId", "name image price stockQuantity") 
      .exec();

    res.status(200).json({
      success: true,
      message: "Lấy chi tiết đơn hàng thành công",
      data: {
        order,
        items: orderItems, //la la
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy chi tiết đơn hàng",
      error: error instanceof Error ? error.message : error,
    });
  }
};

// Huỷ đơn hàng
export const cancelOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.id;
    const role = req.user?.role;
    const { orderId } = req.params;

    if (!customerId || role !== "customer") {
      res.status(403).json({ success: false, message: "Chỉ khách hàng mới có quyền huỷ đơn hàng" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      res.status(400).json({ success: false, message: "Order ID không hợp lệ" });
      return;
    }

    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
      return;
    }

    if (order.customerId.toString() !== customerId) {
      res.status(403).json({ success: false, message: "Bạn không có quyền huỷ đơn hàng này" });
      return;
    }

    if (order.status !== "pending") {
      res.status(400).json({ success: false, message: "Chỉ được huỷ đơn hàng khi đang chờ xử lý" });
      return;
    }

    order.status = "cancelled";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Đơn hàng đã được huỷ",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi huỷ đơn hàng",
      error: error instanceof Error ? error.message : error,
    });
  }
};

// confirm đơn hàng cho staff
export const confirmOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const staffId = req.user?.id;
    const role = req.user?.role;
    const { orderId } = req.params;

    if (!staffId || role !== "staff") {
      res.status(403).json({ success: false, message: "Chỉ nhân viên mới có quyền xác nhận đơn hàng" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      res.status(400).json({ success: false, message: "Order ID không hợp lệ" });
      return;
    }

    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
      return;
    }

    // if (order.customerId.toString() !== staffId) {
    //   res.status(403).json({ success: false, message: "Bạn không có quyền xác nhận đơn hàng này" });
    //   return;
    // }

    if (order.status !== "pending") {
      res.status(400).json({ success: false, message: "Chỉ được xác nhận đơn hàng khi đang chờ xử lý" });
      return;
    }

    order.status = "success";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Đơn hàng đã được xác nhận",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi xác nhận đơn hàng",
      error: error instanceof Error ? error.message : error,
    });
  }
};