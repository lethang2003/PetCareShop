import { Request, Response } from 'express';
import Clinic from '../models/clinic.model';
import WorkSchedule from '../models/workSchedules.model';
import User from '../models/user.model';
import axios from 'axios';
// Tạo phòng khám mới
// export const createClinic = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const clinic = new Clinic(req.body);
//     await clinic.save();
//     res.status(201).json({
//       message: "Create clinic successfully",
//       success: true,
//       error: false,
//       data: clinic
//     }
//     );
//   } catch (error) {
//     res.status(400).json({
//       message: 'Failed to create clinic',
//       success: false,
//       error: true
//     });
//   }
// };

// Lấy danh sách phòng khám (chỉ những cái đang active)
export const getAllClinic = async (_req: Request, res: Response): Promise<void> => {
  try {
    const clinics = await Clinic.find({ isVerified: true }).populate("managerId", "fullName email");
    res.json({
      message: "Get all clinic successfully",
      success: true,
      error: false,
      data: clinics
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to get all clinics',
      error: true,
      success: false
    });
  }
};

// Lấy thông tin 1 phòng khám
export const getClinicById = async (req: Request, res: Response): Promise<void> => {
  try {
    const clinic = await Clinic.findById(req.params.id).lean(); // dùng lean để thêm field
    if (!clinic || !clinic.isVerified) {
      res.status(404).json({
        message: 'Clinic not found',
        success: false,
        error: true,
        data: null
      });
      return;
    }

    // Lấy lịch làm việc liên quan tới phòng khám
    const workSchedules = await WorkSchedule.find({ storeId: clinic._id })
      .sort({ work_Date: 1 });

    res.json({
      message: 'Get clinic by id successfully',
      success: true,
      error: false,
      data: {
        ...clinic,
        workSchedules
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to get clinic',
      error: true,
      success: false,
      data: null
    });
  }
};

// Cập nhật phòng khám
export const updateClinic = async (req: Request, res: Response): Promise<void> => {
  try {
    const clinic = await Clinic.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!clinic) {
      res.status(404).json({ message: 'Clinic not found' });
      return;
    }
    res.json({
      message: 'Update clinic successfully',
      success: true,
      error: false,
      data: clinic
    });
  } catch (error) {
    res.status(400).json({
      message: 'Failed to update clinic',
      error: true,
      success: false
    });
  }
};

// Xóa mềm (chuyển isVerified về false)
export const banClinic = async (req: Request, res: Response): Promise<void> => {
  try {
    const clinic = await Clinic.findByIdAndUpdate(
      req.params.id,
      { isVerified: false },
      { new: true }
    );
    if (!clinic) {
      res.status(404).json({ message: 'Clinic not found' });
      return;
    }

    res.json({
      message: 'Clinic ban successfully',
      success: true,
      error: false,
      data: clinic
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to ban clinic',
      error: true,
      success: false
    });
  }
};

//Chuyển isVerified về True
export const unbanClinic = async (req: Request, res: Response): Promise<void> => {
  try {
    const clinic = await Clinic.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    );
    if (!clinic) {
      res.status(404).json({ message: 'Clinic not found' });
      return;
    }

    res.json({
      message: 'Clinic unban successfully',
      success: true,
      error: false,
      data: clinic
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to unban clinic',
      error: true,
      success: false
    });
  }
};

//Search clinic theo name, city, address
export const searchClinics = async (req: Request, res: Response): Promise<void> => {
  try {
    const keyword = req.query.q as string;

    if (!keyword || keyword.trim() === '') {
      res.status(400).json({
        message: 'Missing search keyword',
        success: false,
        error: true,
        data: []
      });
      return;
    }

    const results = await Clinic.find({
      $text: { $search: keyword },
      isVerified: true
    });

    res.json({
      message: 'Search clinics successfully',
      success: true,
      error: false,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to search clinics',
      success: false,
      error: true,
      data: []
    });
  }
};

// Lấy danh sách bác sĩ trong phòng khám
export const getDoctorsInClinic = async (req: Request, res: Response): Promise<void> => {
  try {
    const clinicId = req.params.clinicId;

    const clinic = await Clinic.findById(clinicId);
    if (!clinic) {
      res.status(404).json({
        message: 'Clinic not found',
        success: false,
        error: true,
        data: null
      });
      return;
    }

    // Lấy thông tin chi tiết của các bác sĩ
    const doctors = await User.find({
      _id: { $in: clinic.doctorIds },
      role: 'doctor'
    }).select('fullName email phone avatar specialization experience');

    res.json({
      message: 'Get doctors in clinic successfully',
      success: true,
      error: false,
      data: doctors
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to get doctors in clinic',
      success: false,
      error: true,
      data: null
    });
  }
};

// Thêm bác sĩ vào phòng khám
export const addDoctorToClinic = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clinicId, doctorId } = req.body;

    const clinic = await Clinic.findById(clinicId);
    if (!clinic) {
      res.status(404).json({
        message: 'Clinic not found',
        success: false,
        error: true
      });
      return;
    }

    // Kiểm tra xem bác sĩ đã tồn tại trong phòng khám chưa
    if (clinic.doctorIds.includes(doctorId)) {
      res.status(400).json({
        message: 'Doctor already exists in this clinic',
        success: false,
        error: true
      });
      return;
    }

    // Thêm bác sĩ vào phòng khám
    clinic.doctorIds.push(doctorId);
    await clinic.save();

    res.json({
      message: 'Add doctor to clinic successfully',
      success: true,
      error: false,
      data: clinic
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to add doctor to clinic',
      success: false,
      error: true
    });
  }
};

// Xóa bác sĩ khỏi phòng khám
export const removeDoctorFromClinic = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clinicId, doctorId } = req.body;

    const clinic = await Clinic.findById(clinicId);
    if (!clinic) {
      res.status(404).json({
        message: 'Clinic not found',
        success: false,
        error: true
      });
      return;
    }

    // Xóa bác sĩ khỏi phòng khám
    clinic.doctorIds = clinic.doctorIds.filter(id => id.toString() !== doctorId);
    await clinic.save();

    res.json({
      message: 'Remove doctor from clinic successfully',
      success: true,
      error: false,
      data: clinic
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to remove doctor from clinic',
      success: false,
      error: true
    });
  }
};

// Tạo phòng khám mới với geocode tọa độ từ địa chỉ
export const createClinic = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      address,
      city,
      phone,
      email,
      description,
      images,
      licenseNumber,
      licenseImage,
      managerId,
      workingHours,
    } = req.body;

    const fullAddress = `${address}, ${city}`;
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullAddress)}&format=json&limit=1`;

    const geoRes = await axios.get(geocodeUrl);
    const geoData = geoRes.data;

    if (!geoData || geoData.length === 0) {
      res.status(400).json({
        message: 'Không tìm được tọa độ từ địa chỉ',
        success: false,
        error: true
      });
      return;
    }

    const { lat, lon } = geoData[0];

    const clinic = new Clinic({
      name,
      address,
      city,
      phone,
      email,
      description,
      images,
      licenseNumber,
      licenseImage,
      managerId,
      workingHours,
      location: {
        type: 'Point',
        coordinates: [parseFloat(lon), parseFloat(lat)] // GeoJSON: [longitude, latitude]
      }
    });

    await clinic.save();

    res.status(201).json({
      message: "Tạo phòng khám thành công",
      success: true,
      error: false,
      data: clinic
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      message: 'Tạo phòng khám thất bại',
      success: false,
      error: true
    });
  }
};

// find nearby
export const findNearbyClinics = async (req: Request, res: Response): Promise<void> => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
     res.status(400).json({ success: false, message: 'Thiếu tọa độ' });
  
    return;}

  const clinics = await Clinic.find({
    location: {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng as string), parseFloat(lat as string)],
        },
        $maxDistance: 5000, // 5km
      }
    }
  });

  res.status(200).json({ success: true, data: clinics });
};
