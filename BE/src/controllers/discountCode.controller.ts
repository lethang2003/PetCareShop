import { Request, Response } from 'express';
import { validateDiscountCodeInput } from '../utils/validateDiscountCode';
import DiscountCode from '../models/discountCode.model';
import { AuthRequest } from '../middlewares/auth.middlewares';
export const createDiscountCode = async (req: AuthRequest, res: Response) => {
  try {
    if (!validateDiscountCodeInput(req, res)) {
      return;
    }
    const userId = req.user?.id;
    const {
      code,
      discountType,
      discountValue,
      maxDiscountAmount,
      maxUse,
      clinicId,
      startDate,
      endDate,
    } = req.body;

    // const { userId: createdBy } = req.user as { userId: string }; 

    const existingDiscount = await DiscountCode.findOne({ code });
    if (existingDiscount) {
      res.status(400).json({ message: 'Discount code already exists.', success: false, error: true });
      return;
    }

    const newDiscount = await DiscountCode.create({
      code,
      discountType,
      discountValue,
      maxDiscountAmount: discountType === 'percentage' ? maxDiscountAmount : undefined,
      maxUse,
      clinicId,
      createdBy:userId,
      startDate,
      endDate,
    });

    res.status(201).json({
      message: 'Discount code created successfully.',
      success: true,
      error: false,
      data: newDiscount,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error.',
      success: false,
      error: true,
    });
  }
};

export const getAllDiscountCodes = async (_req: Request, res: Response) => {
  try {
    const discounts = await DiscountCode.find();
    res.status(200).json({
      message: 'Fetched all discount codes successfully.',
      success: true,
      error: false,
      data: discounts,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch discount codes.',
      success: false,
      error: true,
    });
  }
};


export const getDiscountCodeById = async (req: Request, res: Response) => {
  try {
    const discount = await DiscountCode.findById(req.params.id);
    if (!discount) {
      res.status(404).json({ message: 'Discount code not found.' });
      return;
    }

    res.status(200).json({
      message: 'Discount code retrieved successfully.',
      success: true,
      error: false,
      data: discount,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error occurred while retrieving the discount code.',
      error: true,
      success: false,
    });
  }
};

export const updateDiscountCode = async (req: Request, res: Response) => {
  try {
    const updated = await DiscountCode.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      res.status(404).json({ message: 'Discount code not found for update.' });
      return;
    }

    if (req.body.discountType === 'percentage' && req.body.discountValue > 100) {
      res.status(400).json({ message: 'Percentage discount cannot exceed 100%.' });
      return;
    }

    if (
      req.body.discountType === 'percentage' &&
      (!req.body.maxDiscountAmount || req.body.maxDiscountAmount <= 0)
    ) {
      res.status(400).json({
        message: 'Maximum discount amount must be specified for percentage discount codes.',
      });
      return;
    }

    res.json({
      message: 'Discount code updated successfully.',
      success: true,
      error: false,
      data: updated,
    });
  } catch (error) {
    res.status(400).json({
      message: 'Failed to update discount code.',
      error: true,
      success: false,
    });
  }
};

export const deleteDiscountCode = async (req: Request, res: Response) => {
  try {
    const deleted = await DiscountCode.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: 'Discount code not found for deletion.' });
      return;
    }

    res.status(200).json({
      message: 'Discount code deleted successfully.',
      success: true,
      error: false,
      data: deleted,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete discount code.',
      error: true,
      success: false,
    });
  }
};


export const applyDiscount = async (req: AuthRequest, res: Response) => {
  try {
    const discount = (req as any).discount;
    const { totalAmount } = req.body;
    const userId = req.user?.id;
    if (!totalAmount || totalAmount <= 0) {
       res.status(400).json({ message: 'Invalid total amount.' });
      return;
    }

    let finalDiscount = 0;
    if (discount.discountType === 'percentage') {
      const rawDiscount = totalAmount * (discount.discountValue / 100);
      finalDiscount = discount.maxDiscountAmount
        ? Math.min(rawDiscount, discount.maxDiscountAmount)
        : rawDiscount;
    } else if (discount.discountType === 'fixed') {
      finalDiscount = discount.discountValue;
    }

    const finalAmount = totalAmount - finalDiscount;
    if (finalAmount < 0) {
       res.status(400).json({ message: 'Discount exceeds total amount.' });
      return;
    }

    discount.usedBy.push(userId);
    discount.usedCount += 1;
  
    if (discount.usedCount >= discount.maxUse) {
      discount.isActive = false;
    }

    await discount.save();

     res.status(200).json({
      message: 'Discount applied successfully.',
      success: true,
      error: false,
      data: {
        totalAmount,
        finalAmount,
        discountCode: discount.code,
        discountType: discount.discountType,
        discountValue: discount.discountValue,
        actualDiscount: finalDiscount,
      },
    });
  } catch (error) {
     res.status(500).json({ message: 'Error applying discount.', error: true, success: false });
  }
};
