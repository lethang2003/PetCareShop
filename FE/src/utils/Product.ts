import Axios from "./Axios";
import ServiceAPI from "../common/SummarryAPI";

export const viewAllProduct = async () => {
  try {
    const token = localStorage.getItem("token"); // Lấy token từ localStorage

    const res = await Axios({
      url: "/api/v1/products/view-product", // Gọi đúng route backend
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

export const viewAllProductbyID = async (id: string) => {
  try {
    const token = localStorage.getItem("token"); // Lấy token từ localStorage

    const res = await Axios({
      url: `/api/v1/products/view-product/${id}`, // Gọi đúng route backend
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

export const viewAllProductforGuest = async (clinicName: string) => {
  try {
    const token = localStorage.getItem("token"); // Lấy token từ localStorage
    const encodedName = encodeURIComponent(clinicName);
    console.log(clinicName);

    const res = await Axios({
      url: `/api/v1/products/view-product/guest/${encodedName}`,
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

export const createProduct = async (data: object) => {
  try {
    const res = await Axios({ ...ServiceAPI.createProduct, data });
    return res.data;
  } catch (err) {
    console.error("Create Pets fail", err);
    return [];
  }
};

export const deleteProduct = async (id: string) => {
  try {
    const res = await Axios({
      ...ServiceAPI.deleteProduct(id),
    });
    return res.data;
  } catch (err) {
    console.error("Delete pet failed", err);
    return { success: false, message: "Delete failed" };
  }
};
export const updateProduct = async (id: string, data: object) => {
  try {
    const res = await Axios({
      ...ServiceAPI.updateProduct(id),
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
