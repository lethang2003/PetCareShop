import { Request, Response } from 'express';

export const validateDiscountCodeInput = (req: Request, res: Response): boolean => {
  const {
    code,
    discountType,
    discountValue,
    maxDiscountAmount,
    maxUse,
    clinicId,
    createdBy,
    startDate,
    endDate,
  } = req.body;

  if (!code || typeof code !== 'string') {
    res.status(400).json({ message: 'Invalid or missing discount code.' });
    return false;
  }

  if (!discountType || !['percentage', 'fixed'].includes(discountType)) {
    res.status(400).json({ message: 'Invalid discount code type.' });
    return false;
  }

  if (!discountValue || typeof discountValue !== 'number' || discountValue <= 0) {
    res.status(400).json({ message: 'Discount value must be a number greater than 0.' });
    return false;
  }

  if (discountType === 'percentage' && discountValue > 100) {
    res.status(400).json({ message: 'Discount percentage cannot exceed 100%.' });
    return false;
  }

  if (discountType === 'percentage' && (!maxDiscountAmount || maxDiscountAmount <= 0)) {
    res.status(400).json({ message: 'Maximum discount amount must be specified for percentage-based discounts.' });
    return false;
  }

  if (!maxUse || typeof maxUse !== 'number' || maxUse <= 0) {
    res.status(400).json({ message: 'Max usage must be a number greater than 0.' });
    return false;
  }


  if (!clinicId || typeof clinicId !== 'string') {
    res.status(400).json({ message: 'Invalid or missing clinicId.' });
    return false;
  }

  if (!createdBy || typeof createdBy !== 'string') {
    res.status(400).json({ message: 'Invalid or missing createdBy.' });
    return false;
  }

  if (!startDate || !endDate || isNaN(new Date(startDate).getTime()) || isNaN(new Date(endDate).getTime())) {
    res.status(400).json({ message: 'Invalid start or end date.' });
    return false;
  }

  if (new Date(startDate) >= new Date(endDate)) {
    res.status(400).json({ message: 'Start date must be before end date.' });
    return false;
  }

  return true;
};
