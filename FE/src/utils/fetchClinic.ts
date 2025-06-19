import axios from "axios";
import SummaryApi, { baseURL } from "../common/SummarryAPI";

export const fetchAllClinics = async () => {
  const { url, method } = SummaryApi.clinics.getAllClinics;
  const response = await axios({
    baseURL,
    url,
    method,
  });
  return response.data.data;
};

export const createClinic = async (formData: any, imageFiles?: File[]) => {
  let imageUrls: string[] = [];

  if (imageFiles && imageFiles.length > 0) {
    const form = new FormData();
    imageFiles.forEach((file) => form.append("image", file));
    const uploadRes = await axios.post(
      `${baseURL}${SummaryApi.upload.uploadImage.url}`,
      form
    );
    imageUrls = uploadRes.data?.data?.urls || [];
  }

  const { url, method } = SummaryApi.clinics.createClinic;

  const payload = {
    ...formData,
    ...(imageUrls.length > 0 ? { images: imageUrls } : {}),
  };

  const response = await axios({
    baseURL,
    url,
    method,
    data: payload,
  });

  return response.data;
};

export const getClinicById = async (id: string) => {
  const { method } = SummaryApi.clinics.getClinicById;
  const url = SummaryApi.clinics.getClinicById.url(id);
  const response = await axios({
    baseURL,
    url,
    method,
  });
  return response.data.data;
};

export const updateClinic = async (id: string, formData: any) => {
  const { method } = SummaryApi.clinics.updateClinic;
  const url = SummaryApi.clinics.updateClinic.url(id);
  const response = await axios({
    baseURL,
    url,
    method,
    data: formData, // formData đã có đủ trường images
  });
  return response.data;
};