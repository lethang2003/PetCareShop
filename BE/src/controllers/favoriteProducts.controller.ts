import { Request, Response } from "express";
import FavoriteProduct from "../models/favoriteProducts.model";
import Product from "../models/product.model";
import { error } from "console";

// Thêm sản phẩm vào wishlist
export const addToWishlist = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { customerId, productId } = req.body;

    const exists = await FavoriteProduct.findOne({ customerId, productId });
    if (exists) {
      res.status(400).json({
        message: "Product already in wishlist",
        success: false,
        error: false,
      });
      return;
    }

    const favorite = new FavoriteProduct({ customerId, productId });
    await favorite.save();

    res.status(201).json({
      message: "Added to wishlist successfully",
      success: true,
      error: false,
      data: favorite,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add to wishlist",
      success: false,
      error: true,
    });
  }
};

// Lấy wishlist theo user (toàn bộ clinic)
export const getWishlistByUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { customerId } = req.params;
    const wishlist = await FavoriteProduct.find({ customerId }).populate(
      "productId"
    );

    res.status(200).json({
      message: "Fetched wishlist successfully",
      success: true,
      data: wishlist,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get wishlist",
      success: false,
      error,
    });
  }
};

// Lấy wishlist theo user trong 1 clinic
export const getWishlistByUserAndClinic = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { customerId, clinicId } = req.params;

    const wishlist = await FavoriteProduct.find({ customerId }).populate({
      path: "productId",
      match: { clinicId },
    });

    const filtered = wishlist.filter((item) => item.productId !== null);

    res.status(200).json({
      message: "Fetched wishlist for clinic successfully",
      success: true,
      error: false,
      data: filtered,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get wishlist",
      success: false,
      error,
    });
  }
};

// Xóa khỏi wishlist
export const removeFromWishlist = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { customerId, productId } = req.params;
    const removed = await FavoriteProduct.findOneAndDelete({
      customerId,
      productId,
    });

    if (!removed) {
      res.status(404).json({
        message: "Product not found in wishlist",
        success: false,
        error: true,
      });
      return;
    }

    res.status(200).json({
      message: "Removed from wishlist successfully",
      success: true,
      error: false,
      data: removed,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to remove from wishlist",
      success: false,
      error,
    });
  }
};
