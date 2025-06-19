import Axios from "./Axios";
import ServiceAPI from "../common/SummarryAPI";

export const viewAllPets = async () => {
  try {
    const token = localStorage.getItem("token"); // Lấy token từ localStorage

    const res = await Axios({
      url: "/api/v1/pets/view-all-pet-customer", // Gọi đúng route backend
      method: "get",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  } catch (err) {
    console.error("Fetch pets failed", err);
    return {
      success: false,
      data: [],
      message: "Error fetching pets",
    };
  }
};

export const viewAllPetsDoctor = async () => {
  try {
    const res = await Axios({ ...ServiceAPI.getAllPetsDoctor });
    return res.data;
  } catch (err) {
    console.error("Fetch pets failed", err);
    return {
      success: false,
      data: [],
      message: "Error fetching pets",
    };
  }
};

export const createPetsCustomer = async (data: object) => {
  try {
    console.log("Create Pets", data);

    const res = await Axios({ ...ServiceAPI.createPetCustomer, data });
    return res.data;
  } catch (err) {
    console.error("Create Pets fail", err);
    return [];
  }
};

export const createPetsDoctor = async (data: object) => {
  try {
    const res = await Axios({ ...ServiceAPI.createPetDoctor, data });
    return res.data;
  } catch (err) {
    console.error("Create Pets fail", err);
    return [];
  }
};

export const deletePetCustomer = async (id: string) => {
  try {
    const res = await Axios({
      ...ServiceAPI.deletePetCustomer(id),
    });
    return res.data;
  } catch (err) {
    console.error("Delete pet failed", err);
    return { success: false, message: "Delete failed" };
  }
};
export const updatePetCustomer = async (id: string, data: object) => {
  try {
    const res = await Axios({
      ...ServiceAPI.updatePetCustomer(id),
      data,
    });
    return res.data;
  } catch (err) {
    console.error("Update pet failed", err);
    return { success: false, message: "Update failed" };
  }
};
export const updatePetDoctor = async (id: string, data: object) => {
  try {
    console.log(data);

    const res = await Axios({
      ...ServiceAPI.updatePetDoctor(id),
      data,
    });
    return res.data;
  } catch (err) {
    console.error("Update pet failed", err);
    return { success: false, message: "Update failed" };
  }
};
