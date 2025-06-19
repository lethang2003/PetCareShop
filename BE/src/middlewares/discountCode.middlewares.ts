import { Request, Response, NextFunction } from 'express';
import DiscountCode from '../models/discountCode.model';
import cron from 'node-cron';
export const validateDiscountCode = async (req: Request, res: Response, next: NextFunction) => {
  const { code, clinicId ,userId} = req.body;

  const discount = await DiscountCode.findOne({ code });

  if (!discount) {
   res.status(404).json({ message: 'Discount code does not exist.' });
   return;
 }
 
 if (discount.clinicId.toString() !== clinicId) {
   res.status(403).json({ message: 'Discount code is not applicable to this clinic.' });
   return;
 }
 
 if (discount.usedCount >= discount.maxUse) {
   res.status(400).json({ message: 'Discount code has reached its usage limit.' });
   return;
 }
 
 if (!discount.isActive) {
   res.status(400).json({ message: 'Discount code is no longer valid.' });
   return;
 }
 
 if (discount.usedBy.includes(userId)) {
   res.status(400).json({ message: 'You have already used this discount code.' });
   return;
 }
 
 const now = new Date();
 if (now <= discount.startDate || now > discount.endDate) {
   res.status(400).json({ message: 'Discount code is no longer valid.' });
   return;
 }
  (req as any).discount = discount;
  next();
};


// * * * * *	Mỗi phút
// 0 * * * *	Mỗi giờ
// 0 0 * * *	Mỗi ngày lúc 0h00
// 0 0 * * 0	Mỗi Chủ nhật
// */10 * * * *	Mỗi 10 phút

cron.schedule('0 0 * * *', async () => {
 
   const now = new Date();
 
   const result = await DiscountCode.updateMany(
     {
       $or: [
         { endDate: { $lt: now } },
         { $expr: { $gte: ['$usedCount', '$maxUse'] } }
       ],
       isActive: true
     },
     { $set: { isActive: false } }
   );

 });