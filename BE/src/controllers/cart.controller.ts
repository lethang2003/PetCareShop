import { Response } from "express";
import mongoose from "mongoose";
import Cart from "../models/cart.model";
import CartItem from "../models/cartItem.model";
import Product from "../models/product.model";
import { AuthRequest } from "../middlewares/auth.middlewares";

// GET /api/cart/:clinicId
// GET /api/cart
export const cartList = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.id;
    const role = req.user?.role;

    if (!customerId || role !== "customer") {
      res.status(403).json({ success: false, message: "Only customers can view cart" });
      return;
    }

    // Tìm giỏ hàng của customer (bất kể thuộc clinic nào)
    const cart = await Cart.findOne({ customerId });

    if (!cart) {
      res.status(200).json({ success: true, message: "Không có giỏ hàng", data: [] });
      return;
    }

    // Populate các sản phẩm trong giỏ
    const cartItems = await CartItem.find({ cartId: cart._id }).populate("productId");

    const result = cartItems.map((item) => {
      const product = item.productId as any;
      return {
        _id: item._id,
        productId: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: item.quantity,
        stockQuantity: product.stockQuantity,
      };
    });

    res.status(200).json({ success: true, message:"giỏ hàng của bạn nè", data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi khi lấy giỏ hàng", error });
  }
};



export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.id;
    // const { clinicId } = req.params;
    const { productId, clinicId, quantity = 1 } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400).json({ success: false, message: "Product ID không hợp lệ" });
      return;
    }
    if (!customerId) {
      res.status(403).json({ success: false, message: "Chỉ khách hàng mới có thể thêm sản phẩm vào giỏ hàng" });
      return;
    }

    const product = await Product.findById(productId);
    if (!product || product.stockQuantity < quantity) {
      res.status(400).json({ message: "Sản phẩm không đủ tồn kho", success: false });
      return;
    }
    if (quantity < 1) {
      res.status(400).json({ success: false, message: "Số lượng phải lớn hơn 0" });
      return;
    }

    let cart = await Cart.findOne({ customerId, status: "cart" });
    if (!cart) {
      cart = await Cart.create({
        customerId,
        clinicId, // giữ lại để biết sản phẩm thuộc phòng khám nào
        status: "cart",
        totalAmount: 0,
        paymentMethod: "unpaid",
      });
    }

    let item = await CartItem.findOne({ cartId: cart._id, productId });
    if (item) {
      const newQuantity = item.quantity + quantity;
      if (newQuantity > product.stockQuantity) {
        res.status(400).json({ success: false, message: "Số lượng vượt quá tồn kho" });
        return;
      }
      item.quantity = newQuantity;
    } else {
      item = new CartItem({
        cartId: cart._id,
        productId,
        quantity,
        price: product.price,
      });
    }
    await item.save();

    if (!cart.cartItem.includes(item._id as mongoose.Types.ObjectId)) {
      cart.cartItem.push(item._id as mongoose.Types.ObjectId);
      await cart.save();
    }

    const allItems = await CartItem.find({ cartId: cart._id });
    cart.totalAmount = allItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    await cart.save();

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};


export const updateCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.id;
    const role = req.user?.role;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!customerId || role !== "customer") {
      res.status(403).json({ success: false, message: "Only customers can update cart items" });
      return;
    }

    const cartItem = await CartItem.findById(itemId);
    if (!cartItem) {
      res.status(404).json({ success: false, message: "Cart item not found" });
      return;
    }

    const product = await Product.findById(cartItem.productId);
    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }

    if (quantity > product.stockQuantity) {
      res.status(400).json({
        success: false,
        message: `Số lượng vượt quá tồn kho (còn ${product.stockQuantity})`,
      });
      return;
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    const cart = await Cart.findById(cartItem.cartId);
    if (cart) {
      const allItems = await CartItem.find({ cartId: cart._id });
      cart.totalAmount = allItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      await cart.save();
    }

    res.status(200).json({ success: true, message: "Cart item updated", data: cartItem });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating cart item",
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const deleteCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.id;
    const role = req.user?.role;
    const { itemId } = req.params;

    if (!customerId || role !== "customer") {
      res.status(403).json({ success: false, message: "Only customers can delete cart items" });
      return;
    }

    const cartItem = await CartItem.findById(itemId);
    if (!cartItem) {
      res.status(404).json({ success: false, message: "Cart item not found" });
      return;
    }

    const cartId = cartItem.cartId;
    await cartItem.deleteOne();

    const cart = await Cart.findById(cartId);
    if (cart) {
      // ❗ Xoá cartItem id khỏi array
      cart.cartItem = cart.cartItem.filter(
        (id) => id.toString() !== itemId
      );

      // Cập nhật lại tổng tiền
      const items = await CartItem.find({ cartId });
      cart.totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: "Cart item deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting cart item",
      error: error instanceof Error ? error.message : error,
    });
  }
};




//check lai stock truoc khi thanh toan
export const checkoutCart = async (req: AuthRequest, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const customerId = req.user?.id;
    const role = req.user?.role;

    if (!customerId || role !== "customer") {
      res.status(403).json({ success: false, message: "Only customers can checkout" });
      return;
    }

    const cart = await Cart.findOne({ customerId, status: "cart" });
    if (!cart) {
      res.status(404).json({ success: false, message: "Cart not found" });
      return;
    }

    const cartItems = await CartItem.find({ cartId: cart._id }).populate("productId");

    const insufficientStock = [];

    for (const item of cartItems) {
      const product = item.productId as any;
      if (item.quantity > product.stockQuantity) {
        insufficientStock.push({
          productId: product._id,
          name: product.name,
          requested: item.quantity,
          available: product.stockQuantity,
        });
      }
    }

    if (insufficientStock.length > 0) {
      res.status(400).json({
        success: false,
        message: "Một số sản phẩm không đủ hàng trong kho",
        insufficientStock,
      });
      await session.abortTransaction();
      return;
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, message: "Tồn kho hợp lệ. Có thể tiếp tục tạo đơn hàng." });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({
      success: false,
      message: "Lỗi khi kiểm tra tồn kho",
      error: error instanceof Error ? error.message : error,
    });
  }
};
