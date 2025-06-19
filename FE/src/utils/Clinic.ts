// src/utils/Clinic.ts

import Axios from "./Axios";

export const getNearbyClinics = async (lat: number, lng: number) => {
  try {
    const res = await Axios({
      url: `/api/v1/clinic/nearby?lat=${lat}&lng=${lng}`,
      method: "get",
    });
    return res.data;
  } catch (err) {
    console.error("Lỗi lấy phòng khám gần:", err);
    return { success: false, data: [] };
  }
};
