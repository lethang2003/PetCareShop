import { Request, Response } from "express";
import Prescription from "../models/prescription.model";
import { generatePrescriptionPDF } from "../utils/pdfGenerator";
import Doctor from "../models/user.model";
import Appointment from "../models/appointment.model";
import path from "path";
import fs from "fs";
import { AuthRequest } from "../middlewares/auth.middlewares";

export const createPrescription = async (req: AuthRequest, res: Response) => {
    try {
      const { appointmentId, instructions, medications } = req.body;
      const doctorId = req.user?.id;
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
         res.status(404).json({ message: 'Doctor not found.', success: false, error: true });
            return;
      }
  
      const appointment = await Appointment.findById(appointmentId).populate('petId');
      if (!appointment || !appointment.petId) {
         res.status(404).json({ message: 'Appointment or pet not found.', success: false, error: true });
         return;
      }
  
      const pet = appointment.petId as any; // do populate nên cần ép kiểu tạm
      const petName = pet.petName;
      const petSpecies = pet.species || 'Unkonw';
      const petAge = pet.age || 'Unkonw';
  
      const pdfFileName = `prescription_${Date.now()}`;
      const pdfPath = await generatePrescriptionPDF(
        {
          doctorName: doctor.fullName,
          appointmentId,
          petName : petName,
          petSpecies : petSpecies,
          petAge : petAge,
          medications,
          instructions,
        },
        pdfFileName
      );
  
      const prescription = await Prescription.create({
        appointmentId,
        doctorId,
        instructions,
        medications,
        pdfUrl: pdfPath,
      });
  
      res.status(201).json({
        message: 'Created prescription successfully.',
        success: true,
        error: false,
        data: prescription,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Failed to create prescription.',
        success: false,
        error: true,
      });
    }
  };

export const getAllPrescriptions = async (_req: Request, res: Response) => {
  try {
    const prescriptions = await Prescription.find().populate([
      {
        path: "doctorId",
        select: "fullName",
      },
      {
        path: 'appointmentId'
      }
    ]);

    res.status(200).json({
      message: "Fetched all prescriptions successfully.",
      success: true,
      error: false,
      data: prescriptions,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch prescriptions.",
      success: false,
      error: true,
    });
  }
};

export const getPrescriptionById = async (req: Request, res: Response) => {
  try {
    const prescription = await Prescription.findById(req.params.prescriptionid).populate([
      {
        path: "doctorId",
        select: "fullName",
      },
      {
        path: 'appointmentId'
      }
    ]);
    if (!prescription) {
      res.status(404).json({
        message: "Prescription not found.",
        success: false,
        error: true,
      });
      return;
    }

    res.status(200).json({
      message: "Fetched prescription successfully.",
      success: true,
      error: false,
      data: prescription,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch prescription.",
      success: false,
      error: true,
    });

  }
};

export const deletePrescription = async (req: Request, res: Response) => {
  try {
    const deleted = await Prescription.findByIdAndDelete(req.params.prescriptionid);
    if (!deleted) {
      res.status(404).json({
        message: "Prescription not found.",
        success: false,
        error: true,
      });
      return;
    }

    res.status(200).json({
      message: "Deleted prescription successfully.",
      success: true,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete prescription.",
      success: false,
      error: true,
    });
  }
};

export const downloadPrescriptionPdf = async (req: Request, res: Response) => {
  try {
    const prescription = await Prescription.findById(req.params.prescriptionid);
    if (!prescription || !prescription.pdfUrl) {
      res.status(404).json({
        message: "PDF file not found.",
        success: false,
        error: true,
      });
      return;
    }

    const filePath = path.join(__dirname, "..", prescription.pdfUrl);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({
        message: "PDF file does not exist on server.",
        success: false,
        error: true,
      });
      return;
    }

    res.download(filePath, `toa-thuoc-${prescription._id}.pdf`);
  } catch (error) {
    res.status(500).json({
      message: "Failed to download PDF.",
      success: false,
      error: true,
    });
  }
};
