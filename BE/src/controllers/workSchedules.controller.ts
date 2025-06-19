import { Request, Response } from "express";
import WorkSchedule from "../models/workSchedules.model";
import { AuthRequest } from "../middlewares/auth.middlewares";
import mongoose from "mongoose";
import { error } from "console";


export const createWorkSchedule = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
   
    const schedule = new WorkSchedule(req.body);
    await schedule.save();
    res.status(201).json({
      message: "Create work schedules successfully",
      success: true,
      error: false,
      data: schedule,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to create work schedule",
      error: true,
      success: false,
    });
  }
};

export const registerWorkSchedule = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id_schedule = req.body.id_schedule;
    const id_doctor = req.user?.id;
    const scheduleExists = await WorkSchedule.findById(id_schedule);
    if (!scheduleExists) {
      res.status(404).json({
        message: "Schedule not found",
        error: true,
        success: false,
      });
    } else if (scheduleExists.doctorId) {
      res.status(400).json({
        message: "Schedule already registered",
        error: true,
        success: false,
      });
    } else {
      scheduleExists.doctorId = new mongoose.Types.ObjectId(id_doctor);
      await scheduleExists.save();
      res.status(201).json({
        message: "Register work schedules successfully",
        success: true,
        error: false,
        data: scheduleExists,
      });
    }
  } catch (error) {
    res.status(400).json({
      message: "Failed to create work schedule",
      error: true,
      success: false,
    });
  }
};

export const getAllWorkSchedules = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const schedules = await WorkSchedule.find()
      .populate("storeId")
      .populate("doctorId");
    res.json({
      message: "Get all work schedule successfully",
      success: true,
      error: false,
      data: schedules,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch work schedules",
      error: true,
      success: false,
    });
  }
};


export const getAvailableSchedulesDoctor = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const schedules = await WorkSchedule.find({ doctorId: null })
    .populate("storeId")
    .populate("doctorId", "fullName");
    res.json({
      message: "Get all work schedule successfully for doctor",
      success: true,
      error: false,
      data: schedules,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch work schedules",
      error: true,
      success: false,
    });
  }
};


export const getMyScheduleDoctor = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        message: "Unauthorized",
        success: false,
        error: true,
      });
      return;
    }

    const schedules = await WorkSchedule.find({ doctorId: req.user.id }).populate("storeId").populate("doctorId", "fullName");

    res.status(200).json({
      message: "Get schedule for doctor successfully",
      success: true,
      error: false,
      data: schedules,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch schedule for doctor",
      success: false,
      error: true,
    });
  }
};


export const getWorkScheduleById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const schedule = await WorkSchedule.findById(req.params.id)
      .populate("storeId")
      .populate("doctorId");
    if (!schedule) {
      res.status(404).json({ message: "Work schedule not found" });
      return;
    }
    res.json({
      message: "Get work schedule by id successfully",
      success: true,
      error: false,
      data: schedule,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch work schedule",
      error: true,
      success: false,
    });
  }
};


export const updateWorkSchedule = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const allowedStatuses = ["opening", "closing"];


    // Nếu có status truyền vào và nó không hợp lệ
    if (req.body.status && !allowedStatuses.includes(req.body.status)) {
      res.status(400).json({
        message: "Invalid status value. Must be either opening or closing.",
        success: false,
        error: true,
      });
      return;
    }


    const schedule = await WorkSchedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!schedule) {
      res.status(404).json({ message: "Work schedule not found" });
      return;
    }
    res.json({
      message: "Update work schedule successfully",
      success: true,
      error: false,
      data: schedule,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to update work schedule",
      error: true,
      success: false,
    });
  }
};


export const deleteWorkSchedule = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const schedule = await WorkSchedule.findByIdAndDelete(req.params.id);
    if (!schedule) {
      res.status(404).json({ message: "Work schedule not found" });
      return;
    }
    res.json({
      message: "Work schedule deleted successfully",
      success: true,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete work schedule",
      error: true,
      success: false,
    });
  }
};

export const getSwappableSchedules = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentScheduleId } = req.params;

    // Lấy lịch hiện tại để so sánh thời gian (nếu cần)
    const currentSchedule = await WorkSchedule.findById(currentScheduleId);
    if (!currentSchedule) {
      res.status(404).json({ success: false, message: "Current schedule not found" });
      return;
    }

    // Trả về lịch đã được đăng ký bởi người KHÁC, KHÁC chính mình, KHÁC ca hiện tại
    const swappableSchedules = await WorkSchedule.find({
      _id: { $ne: currentScheduleId },
      doctorId: { $nin: [req.user?.id, null] }, // ❗ bác sĩ khác mình và không null
    }).populate("storeId").populate("doctorId", "fullName");

    res.status(200).json({
      success: true,
      data: swappableSchedules,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching swappable schedules",
    });
  }
};