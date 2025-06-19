import { Request, Response } from 'express';
import { VNPay, HashAlgorithm } from 'vnpay';
import Appointment from '../models/appointment.model';
import mongoose from 'mongoose';
import { AuthRequest } from '../middlewares/auth.middlewares';
import Cart from '../models/cart.model';
import CartItem from '../models/cartItem.model';
import Order from '../models/orders.model';

const vnpay = new VNPay({
    tmnCode: process.env.VNP_TMNCODE!,
    secureSecret: process.env.VNP_HASH_SECRET!,
    vnpayHost: 'https://sandbox.vnpay.vn',
    hashAlgorithm: HashAlgorithm.SHA512,
    testMode: true,
});

export const createAppointmentPayment = async (req: Request, res: Response) => {
    try {
        const { appointmentId } = req.params;
        const { paymentType } = req.query; // 'deposit' or 'full'

        const appointment = await Appointment.findById(appointmentId).populate('serviceId');
        if (!appointment) {
            res.status(404).json({
                message: 'Appointment not found',
                success: false,
                error: true,
            });
        }

        let amount = 0;
        if (paymentType === 'deposit') {
            amount = 100000;
        } else if (paymentType === 'full') {
            amount = appointment!.totalServicePrice || 0; // Total service price
        } else {
            res.status(400).json({
                message: 'Invalid payment type',
                success: false,
                error: true,
            });
        }

        const paymentUrl = vnpay.buildPaymentUrl({
            vnp_Amount: amount, // Multiply by 100 as required by VNPAY
            vnp_OrderInfo: `Payment for ${paymentType === 'deposit' ? 'deposit' : 'full amount'} appointment #${appointmentId}`,
            vnp_ReturnUrl: `${process.env.CLIENT_URL}/payment/payment-result?appointmentId=${appointmentId}&paymentType=${paymentType}`,
            vnp_TxnRef: appointmentId.toString(),
            vnp_IpAddr: req.ip || '127.0.0.1'
        });

        res.status(200).json({
            message: 'Payment link created successfully',
            success: true,
            error: false,
            data: { paymentUrl },
        });

    } catch (error) {
        res.status(500).json({
            message: error || 'Server error',
            success: false,
            error: true,
        });
    }
};

export const vnpayReturnAppointment = async (req: Request, res: Response) => {
    try {
        const query = req.query;
        const paymentType = query.paymentType as string;

        // @ts-ignore - Ignore TypeScript check for VNPay query validation
        const isValidSignature = vnpay.verifyReturnUrl(query);
        if (!isValidSignature) {
            res.status(400).json({
                message: 'Invalid payment signature',
                success: false,
                error: true
            });
        }

        const appointmentId = query.vnp_TxnRef as string;
        const responseCode = query.vnp_ResponseCode as string;

        if (!appointmentId || !responseCode) {
            res.status(400).json({
                message: 'Missing payment information',
                success: false,
                error: true
            });
        }

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            res.status(404).json({
                message: 'Appointment not found',
                success: false,
                error: true
            });
        }
        let mount = 100000;
        if (responseCode === '00') {
            if (paymentType === 'deposit') {
                appointment!.isDepositPaid = true;
                appointment!.depositAmount = mount;
                appointment!.status = 'confirmed';
            } else if (paymentType === 'full') {
                appointment!.isServicePaid = true;
                appointment!.finalPaid = true;
                appointment!.status = 'confirmed';
            }
            appointment!.paymentMethod = 'vnpay';
            await appointment!.save();

            // Get the latest data
            const updatedAppointment = await Appointment.findById(appointmentId);

            res.status(200).json({
                message: 'Payment successful and appointment updated',
                success: true,
                error: false,
                data: updatedAppointment
            });
        } else {
            res.status(400).json({
                message: 'Payment failed',
                success: false,
                error: true,
                data: {
                    appointmentId,
                    paymentStatus: 'failed',
                    responseCode
                }
            });
        }

    } catch (error) {
        res.status(500).json({
            message: error || 'Server error during payment verification',
            success: false,
            error: true,
        });
    }
};

// //payment cart for order
// export const checkoutCartAndCreateOrder = async (
//   req: AuthRequest,
//   res: Response
// ): Promise<void> => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const customerId = req.user?.id;
//     const { paymentMethod } = req.body;

//     // 1. Lấy giỏ hàng
//     const cart = await Cart.findOne({ customerId });
//     if (!cart || cart.cartItem.length === 0) {
//       res.status(400).json({ success: false, message: "Giỏ hàng trống" });
//       return;
//     }

//     // 2. Lấy danh sách sản phẩm trong giỏ
//     const cartItems = await CartItem.find({ cartId: cart._id }).populate("productId");

//     // 3. Kiểm tra tồn kho & trừ tồn kho
//     for (const item of cartItems) {
//       const product = item.productId as any;

//       if (!product || item.quantity > product.stockQuantity) {
//         res.status(400).json({
//           success: false,
//           message: `Sản phẩm ${product?.name || "không xác định"} không đủ hàng`,
//         });
//         await session.abortTransaction();
//         return;
//       }

//       await product.updateOne(
//         { _id: product._id },
//         { $inc: { stockQuantity: -item.quantity } },
//         { session }
//       );
//     }

//     // 4. Chuẩn bị dữ liệu cho đơn hàng
//     const orderItems = cartItems.map((item) => {
//       const product = item.productId as any;
//       return {
//         productId: product._id,
//         price: item.price,
//         stockQuantity: item.quantity,
//       };
//     });

//     // 5. Tạo đơn hàng
//     const [newOrder] = await Order.create(
//       [
//         {
//           customerId,
//           clinicId: cart.clinicId,
//           orderItems,
//           totalAmount: cart.totalAmount,
//           status: "waiting_payment",
//           paymentMethod,
//         },
//       ],
//       { session }
//     );

//     // 6. Xoá giỏ hàng và cart item
//     await CartItem.deleteMany({ cartId: cart._id }, { session });
//     await Cart.findByIdAndDelete(cart._id, { session });

//     // 7. Kết thúc transaction
//     await session.commitTransaction();
//     session.endSession();

//     res.status(200).json({
//       success: true,
//       message: "Tạo đơn hàng thành công",
//       data: newOrder,
//     });
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     res.status(500).json({
//       success: false,
//       message: "Lỗi tạo đơn hàng",
//       error: error instanceof Error ? error.message : error,
//     });
//   }
// };


//payment bang tien mat
export const payCashAndCreateOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.id;

    const cart = await Cart.findOne({ customerId });
    if (!cart || cart.cartItem.length === 0) {
      res.status(400).json({ success: false, message: "Giỏ hàng trống" });
      return;
    }

    const cartItems = await CartItem.find({ cartId: cart._id });

    const orderItems = cartItems.map(item => ({
      productId: item.productId,
      price: item.price,
      stockQuantity: item.quantity,
    }));

    const order = await Order.create({
      customerId,
      clinicId: cart.clinicId,
      orderItems,
      totalAmount: cart.totalAmount,
      status: "pending", // nhân viên sẽ xác nhận sau
      paymentMethod: "cash",
    });

    await CartItem.deleteMany({ cartId: cart._id });
    await Cart.findByIdAndDelete(cart._id);

    res.status(200).json({ success: true, message: "Tạo đơn hàng thành công", data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi tạo đơn hàng", error });
  }
};


// ========== 1. Tạo URL thanh toán bằng VNPAY ==========
export const createPaymentUrlForCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.id;

    const cart = await Cart.findOne({ customerId });
    if (!cart || cart.cartItem.length === 0) {
      res.status(404).json({ success: false, message: 'Giỏ hàng trống hoặc không tồn tại' });
      return;
    }

    // Kiểm tra nếu đã có đơn hàng chưa thanh toán
const existingOrder = await Order.findOne({
  customerId,
  paymentMethod: 'vnpay',
  status: 'waiting_payment',
});

if (existingOrder) {
res.status(400).json({
    success: false,
    message: 'Bạn đã có đơn hàng đang chờ thanh toán. Vui lòng hoàn tất trước khi tạo đơn mới.',
}
);
return;
}


    const cartItems = await CartItem.find({ cartId: cart._id }).populate('productId');

    const orderItems = cartItems.map((item) => {
      const product = item.productId as any;
      return {
        productId: product._id,
        price: item.price,
        stockQuantity: item.quantity,
      };
    });

    // ✅ Tạo đơn hàng với trạng thái "waiting_payment"
    const order = await Order.create({
      customerId,
      clinicId: cart.clinicId,
      orderItems,
      totalAmount: cart.totalAmount,
      status: 'waiting_payment',
      paymentMethod: 'vnpay',
    });

    // ✅ Tạo link thanh toán
    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_Amount: cart.totalAmount * 100 / 100, // nhân 100 theo chuẩn VNPAY
      vnp_OrderInfo: `Thanh toán đơn hàng ${order._id}`,
      vnp_ReturnUrl: `${process.env.CLIENT_URL}/payment/result`,
      vnp_TxnRef: (order._id as any).toString(),
      vnp_IpAddr: req.ip || '127.0.0.1',
    });

    res.status(200).json({
      success: true,
      message: 'Tạo link thanh toán và đơn hàng thành công',
      data: { paymentUrl, orderId: order._id },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi tạo link và đơn hàng', error });
  }
};


// ========== 2. Thanh toán VNPay trả về ==========
export const vnpayReturnCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query as any;
    const isValidSignature = vnpay.verifyReturnUrl(query);

    if (!isValidSignature) {
      res.status(400).json({ success: false, message: 'Chữ ký không hợp lệ' });
      return;
    }

    const orderId = query.vnp_TxnRef;
    const responseCode = query.vnp_ResponseCode;

    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
      return;
    }

    if (responseCode === '00') {
      order.status = 'successfully';

      // ✅ Xoá giỏ hàng sau khi thanh toán thành công
      const customerId = order.customerId;
      const cart = await Cart.findOne({ customerId });

      if (cart) {
        await CartItem.deleteMany({ cartId: cart._id }); // Xóa cart item
        await Cart.findByIdAndDelete(cart._id); // Xóa cart
      }
    } else {
      order.status = 'cancelled';
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: `Thanh toán ${responseCode === '00' ? 'thành công' : 'thất bại'}, cập nhật đơn hàng`,
      data: order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi xử lý thanh toán', error });
  }
};




// ========== 3. Thanh toán qua VNPay và tạo đơn hàng ==========
// export const checkoutCartAndCreateOrder = async (req: AuthRequest, res: Response): Promise<void> => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const customerId = req.user?.id;
//     const { paymentMethod } = req.body;

//     const cart = await Cart.findOne({ customerId });
//     if (!cart || cart.cartItem.length === 0) {
//       res.status(400).json({ success: false, message: 'Giỏ hàng trống' });
//       return;
//     }

//     const cartItems = await CartItem.find({ cartId: cart._id }).populate('productId');

//     for (const item of cartItems) {
//       const product = item.productId as any;

//       if (!product || item.quantity > product.stockQuantity) {
//         res.status(400).json({
//           success: false,
//           message: `Sản phẩm ${product?.name || 'không xác định'} không đủ hàng`,
//         });
//         await session.abortTransaction();
//         return;
//       }

//       await product.updateOne(
//         { _id: product._id },
//         { $inc: { stockQuantity: -item.quantity } },
//         { session }
//       );
//     }

//     const orderItems = cartItems.map((item) => {
//       const product = item.productId as any;
//       return {
//         productId: product._id,
//         price: item.price,
//         stockQuantity: item.quantity,
//       };
//     });

//     const [newOrder] = await Order.create(
//       [
//         {
//           customerId,
//           clinicId: cart.clinicId,
//           orderItems,
//           totalAmount: cart.totalAmount,
//           status: 'waiting_payment',
//           paymentMethod,
//         },
//       ],
//       { session }
//     );

//     await CartItem.deleteMany({ cartId: cart._id }, { session });
//     await Cart.findByIdAndDelete(cart._id, { session });

//     await session.commitTransaction();
//     session.endSession();

//     res.status(200).json({
//       success: true,
//       message: 'Tạo đơn hàng thành công',
//       data: newOrder,
//     });
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     res.status(500).json({
//       success: false,
//       message: 'Lỗi tạo đơn hàng',
//       error: error instanceof Error ? error.message : error,
//     });
//   }
// };