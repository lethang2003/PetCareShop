import { Request, Response } from "express";
import Service from "../models/service.model";
import { validateServiceFields } from "../utils/validateService";

export const createService = async (req: Request, res: Response) => {
    try {
      const validation = validateServiceFields(req.body, true);
      if (!validation.valid) {
        res.status(400).json({ message: validation.message, success: false, error: true });
        return;
      }
  
      const newService = new Service(req.body);
      const saved = await newService.save();
  
      res.status(201).json({
        message: "Service created successfully.",
        success: true,
        error: false,
        data: saved,
      });
    } catch (error) {
      res.status(400).json({
        message: "Failed to create service.",
        success: false,
        error: true,
      });
    }
  };
export const getAllServices = async (_req: Request, res: Response) => {
  try {
    const services = await Service.find();
    res.status(200).json({
      message: "Fetched all services successfully.",
      success: true,
      error: false,
      data: services,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch services.",
      success: false,
      error: true,
    });
  }
};

export const getServiceById = async (req: Request, res: Response) => {
  try {
    const service = await Service.findById(req.params.serviceId);
    if (!service) {
      res.status(404).json({
        message: "Service not found.",
      });
      return;
    }
    res.status(200).json({
      message: "Fetched service successfully.",
      success: true,
      error: false,
      data: service,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch service.",
      success: false,
      error: true,
    });
  }
};

export const updateService = async (req: Request, res: Response) => {
    try {
      const validation = validateServiceFields(req.body, false);
      if (!validation.valid) {
        res.status(400).json({ message: validation.message, success: false, error: true });
        return;
      }
  
      const updated = await Service.findByIdAndUpdate(req.params.serviceId, req.body, { new: true });
  
      if (!updated) {
        res.status(404).json({ message: "Service not found." });
        return;
      }
  
      res.status(200).json({
        message: "Service updated successfully.",
        success: true,
        error: false,
        data: updated,
      });
    } catch (error) {
      res.status(400).json({
        message: "Failed to update service.",
        success: false,
        error: true,
      });
    }
  };
  

export const deleteService = async (req: Request, res: Response) => {
  try {
    const deleted = await Service.findByIdAndDelete(req.params.serviceId);
    if (!deleted) {
      res.status(404).json({
        message: "Service not found.",
      });
      return;
    }
    res.status(200).json({
      message: "Service deleted successfully.",
      success: true,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete service.",
      success: false,
      error: true,
    });
  }
};

export const getServiceByClinic = async (req: Request, res: Response) => {
  try {
    const services = await Service.find({ clinicId: req.params.clinicId });
    res.status(200).json({
      message: "Fetched services successfully.",
      success: true,
      error: false,
      data: services,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch services.",
      success: false,
      error: true,
    });
  }
}