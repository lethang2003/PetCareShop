import mongoose from "mongoose";

const isValidString = (str: string): boolean => /^[\p{L}0-9\s]+$/u.test(str);

export const validateServiceFields = (
  data: {
    clinicId?: any;
    name?: any;
    category?: any;
    description?: any;
    price?: any;
  },
  isCreate = false
): { valid: boolean; message?: string } => {
  const { clinicId, name, category, description, price } = data;

  if (isCreate || clinicId !== undefined) {
    if (!clinicId || !mongoose.Types.ObjectId.isValid(clinicId)) {
      return { valid: false, message: "Invalid or missing clinicId" };
    }
  }

  if (isCreate || name !== undefined) {
    if (typeof name !== "string" || name.trim() === "" || !isValidString(name)) {
      return { valid: false, message: "Name must be a non-empty string without special characters" };
    }
  }

  if (isCreate || category !== undefined) {
    if (typeof category !== "string" || category.trim() === "" || !isValidString(category)) {
      return { valid: false, message: "Category must be a non-empty string without special characters" };
    }
  }

  if (description !== undefined) {
    if (typeof description !== "string" || !isValidString(description)) {
      return { valid: false, message: "Description must not contain special characters" };
    }
  }

  if (isCreate || price !== undefined) {
    if (typeof price !== "number" || price < 0) {
      return { valid: false, message: "Price must be a non-negative number" };
    }
  }

  return { valid: true };
};
