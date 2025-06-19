import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middlewares';
import WorkScheduleTransfer from '../models/workTransfer.model';
import WorkSchedule, { IWorkSchedule } from '../models/workSchedules.model';
import mongoose from 'mongoose';

// Gửi yêu cầu đổi lịch
export const createTransferRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { workScheduleId, targetScheduleId } = req.body;
    const userId = req.user?.id;

    const scheduleA = await WorkSchedule.findById(workScheduleId);
    const scheduleB = await WorkSchedule.findById(targetScheduleId);

    if (!scheduleA || !scheduleB) {
      res.status(404).json({
        message: 'Không tìm thấy một trong hai lịch làm việc',
        success: false,
        error: true,
        data: null
      });
      return;
    }

    if (String(scheduleA.doctorId) !== String(userId)) {
      res.status(403).json({
        message: 'Bạn không có quyền gửi yêu cầu đổi lịch này',
        success: false,
        error: true,
        data: null
      });
      return;
    }

    const transfer = new WorkScheduleTransfer({
      doctorId: userId,
      workScheduleId,
      targetScheduleId,
      requestedAt: new Date(),
      status: 'pending'
    });

    await transfer.save();

    res.status(201).json({
      message: 'Tạo yêu cầu đổi lịch thành công',
      success: true,
      error: false,
      data: transfer
    });
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi khi gửi yêu cầu đổi lịch',
      success: false,
      error: true,
      data: null
    });
  }
};

//Chấp nhận yêu cầu
export const acceptTransferRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const transferId = req.params.id;
    const userId = req.user?.id;

    const transfer = await WorkScheduleTransfer.findById(transferId);
    if (!transfer || transfer.status !== 'pending') {
      res.status(404).json({
        message: 'Yêu cầu đổi lịch không tồn tại hoặc đã xử lý',
        success: false,
        error: true,
        data: null
      });
      return;
    }

    const scheduleA = await WorkSchedule.findById(transfer.workScheduleId) as IWorkSchedule & { _id: mongoose.Types.ObjectId };
    const scheduleB = await WorkSchedule.findById(transfer.targetScheduleId) as IWorkSchedule & { _id: mongoose.Types.ObjectId };


    if (!scheduleA || !scheduleB) {
      res.status(404).json({
        message: 'Không tìm thấy một trong hai lịch làm việc',
        success: false,
        error: true,
        data: null
      });
      return;
    }

    if (String(scheduleB.doctorId) !== String(userId)) {
      res.status(403).json({
        message: 'Bạn không có quyền chấp nhận yêu cầu này',
        success: false,
        error: true,
        data: null
      });
      return;
    }

    // Hoán đổi bác sĩ giữa hai lịch làm việc
    const tempDoctorId = scheduleA.doctorId;
    scheduleA.doctorId = scheduleB.doctorId;
    scheduleB.doctorId = tempDoctorId;

    // Ghi nhận lịch đã đổi với nhau
    scheduleA.swappedWith = scheduleB._id;
    scheduleB.swappedWith = scheduleA._id;

    // Lưu lại thay đổi
    await scheduleA.save();
    await scheduleB.save();

    transfer.status = 'accepted';
    transfer.respondedAt = new Date();
    await transfer.save();

    res.json({
      message: 'Đổi lịch thành công',
      success: true,
      error: false,
      data: transfer
    });
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi khi chấp nhận yêu cầu đổi lịch',
      success: false,
      error: true,
      data: null
    });
  }
};


//Từ chối yêu cầu
export const rejectTransferRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const transferId = req.params.id;
    const userId = req.user?.id;

    const transfer = await WorkScheduleTransfer.findById(transferId);
    if (!transfer || transfer.status !== 'pending') {
      res.status(404).json({
        message: 'Yêu cầu đổi lịch không tồn tại hoặc đã xử lý',
        success: false,
        error: true,
        data: null
      });
      return;
    }

    const scheduleB = await WorkSchedule.findById(transfer.targetScheduleId);
    if (!scheduleB || String(scheduleB.doctorId) !== String(userId)) {
      res.status(403).json({
        message: 'Bạn không có quyền từ chối yêu cầu này',
        success: false,
        error: true,
        data: null
      });
      return;
    }

    transfer.status = 'rejected';
    transfer.respondedAt = new Date();
    await transfer.save();

    res.json({
      message: 'Từ chối yêu cầu đổi lịch thành công',
      success: true,
      error: false,
      data: transfer
    });
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi khi từ chối yêu cầu',
      success: false,
      error: true,
      data: null
    });
  }
};

//Lấy danh sách yêu cầu liên quan
export const getMyTransferRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    const requests = await WorkScheduleTransfer.find({
      status: "pending",
      $or: [
        { doctorId: userId },
        {
          targetScheduleId: {
            $in: await WorkSchedule.find({ doctorId: userId }).distinct("_id"),
          },
        },
      ],
    })
      .sort({ requestedAt: -1 })
      .populate({
        path: "workScheduleId",
        populate: [
          { path: "storeId", select: "name" },
          { path: "doctorId", select: "fullName" },
        ],
      })
      .populate({
        path: "targetScheduleId",
        populate: [
          { path: "storeId", select: "name" },
          { path: "doctorId", select: "fullName" },
        ],
      })
      .populate("doctorId", "fullName");   
    
    res.json({
      message: 'Lấy danh sách yêu cầu đổi lịch thành công',
      success: true,
      error: false,
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi khi lấy danh sách yêu cầu',
      success: false,
      error: true,
      data: null
    });
  }
};

