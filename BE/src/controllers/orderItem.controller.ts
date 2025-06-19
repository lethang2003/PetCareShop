// src/controllers/orderItem.controller.ts
import { Request, Response } from "express";
import OrderItem from "../models/orderItem.model";

// Tạo một item cho đơn hàng
export const createOrderItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const newItem = new OrderItem(req.body);
    await newItem.save();
    res.status(201).json({
      message: "Order item created successfully",
      success: true,
      data: newItem,
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to create order item", success: false, error });
  }
};

// Lấy tất cả item theo order
export const getItemsByOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const items = await OrderItem.find({ orderId }).populate("productId");
    res.status(200).json({
      message: "Order items fetched successfully",
      success: true,
      data: items,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch order items", success: false, error });
  }
};

// Cập nhật một item
export const updateOrderItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { itemId } = req.params;
    const updatedItem = await OrderItem.findByIdAndUpdate(itemId, req.body, {
      new: true,
    });
    if (!updatedItem) {
      res.status(404).json({ message: "Order item not found", success: false });
      return;
    }
    res.status(200).json({
      message: "Order item updated successfully",
      success: true,
      data: updatedItem,
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to update order item", success: false, error });
  }
};

// Xoá một item khỏi đơn hàng
export const deleteOrderItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { itemId } = req.params;
    const deleted = await OrderItem.findByIdAndDelete(itemId);
    if (!deleted) {
      res.status(404).json({ message: "Order item not found", success: false });
      return;
    }
    res
      .status(200)
      .json({ message: "Order item deleted successfully", success: true });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete order item", success: false, error });
  }
};
