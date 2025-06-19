import { Request, Response } from 'express';
import Appointment from '../models/appointment.model';
import { AuthRequest } from '../middlewares/auth.middlewares';
import Species from '../models/species.model';

// CREATE
export const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { appointment_date, ...rest } = req.body;
    const adjustedDate = new Date(appointment_date);
    adjustedDate.setHours(adjustedDate.getHours() + 7);
    const appointment = await Appointment.create({
      ...rest,
      appointment_date: adjustedDate,
      customerId: req.user?.id,
    });
    res.status(201).json({
      message: 'Appointment created successfully.',
      success: true,
      error: false,
      data: appointment,
    });
  } catch (error) {
    res.status(400).json({
      message: 'Failed to create appointment.',
      success: false,
      error: true,
    });
  }
};

// READ ALL
export const getAppointmentsByCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const appointments = await Appointment.find({ customerId: userId }).sort({ status: -1, createdAt: -1 }).populate([
      {
        path: 'customerId',
        select: 'fullName',
      },
      {
        path: 'petId',
        select: 'petName speciesId gender',
        populate: {
          model: Species,
          path: 'speciesId',
          select: 'speciesName',
        },
      },
      {
        path: 'clinicId',
        select: 'name ',
      },
      {
        path: 'serviceId',
        select: 'name ',
      },
    ]);

    res.status(200).json({
      message: 'Fetched all appointments successfully.',
      success: true,
      error: false,
      data: appointments,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch appointments.',
      success: false,
      error: true,
    });
    console.log(error);
  }
};

// READ ALL
export const getAppointmentsByStaff = async (req: AuthRequest, res: Response) => {
  try {
    const appointments = await Appointment.find().sort({ status: -1, createdAt: -1 }).populate([
      {
        path: 'customerId',
        select: 'fullName',
      },
      {
        path: 'petId',
        select: 'petName speciesId gender',
        populate: {
          model: Species,
          path: 'speciesId',
          select: 'speciesName',
        },
      },
      {
        path: 'clinicId',
        select: 'name',
      },
      {
        path: 'serviceId',
        select: 'name',
      },
    ]);

    res.status(200).json({
      message: 'Fetched all appointments successfully.',
      success: true,
      error: false,
      data: appointments,
    });

  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch appointments.',
      success: false,
      error: true,
    });
  }
};

// READ BY ID
export const getAppointmentById = async (req: Request, res: Response) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId).populate([
      {
        path: 'customerId',
        select: 'fullName',
      },
      {
        path: 'petId',
        select: 'petName',
      },
      {
        path: 'doctorId',
        select: 'fullName',
      },
      {
        path: 'clinicId',
        select: 'name',
      },
      {
        path: 'serviceId',
        select: 'name price',
      },
    ]);


    if (!appointment) {
      res.status(404).json({
        message: 'Appointment not found.',
        success: false,
        error: true,
      });

      return;
    }

    res.status(200).json({
      message: 'Fetched appointment successfully.',
      success: true,
      error: false,
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch appointment.',
      success: false,
      error: true,
    });

  }
};


// UPDATE
export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const updated = await Appointment.findByIdAndUpdate(req.params.appointmentId, req.body, { new: true });
    if (!updated) {
      res.status(404).json({
        message: 'Appointment not found.',
        success: false,
        error: true,
      });
      return;
    }
    res.status(200).json({
      message: 'Appointment updated successfully.',
      success: true,
      error: false,
      data: updated,
    });
  } catch (error) {
    res.status(400).json({
      message: 'Failed to update appointment.',
      success: false,
      error: true,
    });
  }
};

// DELETE
export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    const deleted = await Appointment.findByIdAndDelete(req.params.appointmentId);
    if (!deleted) {
      res.status(404).json({
        message: 'Appointment not found.',
        success: false,
        error: true,
      });
      return;
    }
    res.status(200).json({
      message: 'Appointment deleted successfully.',
      success: true,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete appointment.',
      success: false,
      error: true,
    });
  }
};

// CANCEL APPOINTMENT
export const cancelAppointment = async (req: Request, res: Response) => {
  try {
    const { cancelReason } = req.body;
    const updated = await Appointment.findByIdAndUpdate(
      req.params.appointmentId,
      { status: 'Cancelled', cancelReason },
      { new: true }
    );
    if (!updated) {
      res.status(404).json({
        message: 'Appointment not found.',
        success: false,
        error: true,
      });
      return;
    }
    res.status(200).json({
      message: 'Appointment cancelled successfully.',
      success: true,
      error: false,
      data: updated,
    });
  } catch (error) {
    res.status(400).json({
      message: 'Failed to cancel appointment.',
      success: false,
      error: true,
    });
  }
};

// CHECK APPOINTMENT AVAILABILITY
export const checkAppointmentAvailability = async (req: Request, res: Response) => {
  try {
    const { appointment_date, clinicId } = req.body;
    const adjustedDate = new Date(appointment_date);
    adjustedDate.setHours(adjustedDate.getHours() + 7);
    const count = await Appointment.countDocuments({ appointment_date: adjustedDate, clinicId });
    if (count >= 2) {
      res.status(400).json({
        message: 'This time slot is already booked twice for this clinic.',
        success: false,
        error: true,
      });
      return;
    }
    res.status(200).json({
      message: 'Time slot is available.',
      success: true,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to check appointment availability.',
      success: false,
      error: true,
    });
  }
};
