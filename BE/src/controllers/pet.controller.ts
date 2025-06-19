import { Request, Response, RequestHandler } from "express";
import Pet from "../models/pet.model";
import { AuthRequest } from "../middlewares/auth.middlewares";
import User from "../models/user.model";
import mongoose from "mongoose";
import speciesModel from "../models/species.model";

// Create Pet
export const createPetCustomer = async (req: AuthRequest, res: Response) => {
  // const user_id = "67f4c7c9a3732bb2e27826c1";z
  const user_id = req.user?.id; // Lấy userId từ token đã giải mã
  const image = req.file?.path; // lấy url của ảnh
  console.log(image);
  const { petDetails }  = req.body; // Lấy thông tin từ frontend
  console.log(petDetails);
  try {
    const species = await speciesModel.findOne({ speciesName: petDetails.species });
    if (!species) {
      res.status(404).json({
        message: "Species not found",
        success: false,
        error: true,
      });
      return;
    }
    const new_pet = new Pet({
      petName: petDetails.petName,
      customerId: user_id,
      createBy: user_id,
      speciesId: species?._id,
      gender: petDetails.gender,
      imageUrl: image,
      age: petDetails.age,
      medicalHistory: petDetails.medicalHistory,
      weight: petDetails.weight,
    });
    await new_pet.save();
    res.status(201).json({
      message: "Create new pet successfully",
      success: true,
      error: false,
      data: new_pet,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      message: "Failed to create pet",
      success: false,
      error: true,
    });
  }
};

export const createPetDoctor = async (req: AuthRequest, res: Response) => {
  // const user_id = "67f4c7c9a3732bb2e27826c1";
  const doctor_id = req.user?.id;
  // const doctor_id = "67f4bd98841b1f25cb61fbd4";
  console.log(doctor_id);
  const image = req.file?.path;
  const {petDetails}  = req.body;
  console.log(petDetails);

  const user = await User.findOne({
    email: petDetails.email,
    phone: petDetails.phone,
  });
  const species = await speciesModel.findOne({ speciesName: petDetails.species });
  if (!species) {
    res.status(404).json({
      message: "Species not found",
      success: false,
      error: true,
    });
    return;
  }
  if (!user) {
    res.status(404).json({
      success: false,
      message: "User not found with the provided email and phone number.",
    });
    return;
  }

  try {
    const new_pet = new Pet({
      petName: petDetails.petName,
      customerId: user._id,
      createBy: doctor_id,
      speciesId: species?._id,
      gender: petDetails.gender,
      imageUrl: image,
      age: petDetails.age,
      medicalHistory: petDetails.medicalHistory,
      weight: petDetails.weight,
    });
    await new_pet.save();
    res.status(201).json({
      message: "Create new pet successfully",
      success: true,
      error: false,
      data: new_pet,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      message: "Failed to create pet",
      success: false,
      error: true,
    });
  }
};

// Get all Pets By Customer
export const viewAllPetsByCustomer = async (
  req: AuthRequest,
  res: Response
) => {
  const user_id = req.user?.id;

  try {
    const pets = await Pet.find({ customerId: user_id, isDeleted: false }).populate("speciesId", "speciesName").sort(
      {
        createdAt: -1,
      }
    );

    res.status(200).json({
      message: "List of pets fetched successfully",
      success: true,
      error: false,
      data: pets,
    });
  } catch (error) {
    console.error("Error fetching pets:", error);
    res.status(500).json({
      message: "Failed to fetch pets",
      success: false,
      error: true,
    });
  }
};
export const viewAllPetsByDoctor = async (req: AuthRequest, res: Response) => {
  try {
    const pets = await Pet.find().populate("customerId", "email fullName").populate("speciesId", "speciesName");
    if (pets) {
      res.status(200).json({
        message: "List of pets fetched successfully",
        success: true,
        error: false,
        data: pets,
      });
    }
  } catch (error) {
    console.error("Error fetching pets:", error);
    res.status(500).json({
      message: "Failed to fetch pets",
      success: false,
      error: true,
    });
  }
};

// Get pet by ID
export const getPetById: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const pet = await Pet.findById(req.params.id).populate("speciesId", "speciesName");
    if (!pet) {
      res.status(404).json({ message: "Pet not found" });
      return;
    }
    res.status(200).json({
      message: "Get pet by ID successfully",
      success: true,
      error: false,
      data: pet,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve pet", success: false, error: true });
  }
};
export const updatePetByCustomer = async (req: AuthRequest, res: Response) => {
  const user_id = req.user?.id;
  const image = req.file?.path;
  console.log(req.params.id);
  const petDetails  = req.body;
  try {
    const updateData = { ...petDetails };
    console.log(updateData);
    if (image) {
      updateData.imageUrl = image;
    }
    const species = await speciesModel.findOne({ speciesName: petDetails.species });
    if (!species) {
      res.status(404).json({
        message: "Species not found",
        success: false,
        error: true,
      });
      return;
    }
    const petId = new mongoose.Types.ObjectId(req.params.id);
    const updatedPet = await Pet.findOne({_id: petId, customerId: user_id, isDeleted: false});
    if (!updatedPet) {
      res.status(404).json({ success: false, message: "Pet Not Found" });
      return;
    }
    updatedPet.petName = petDetails.petName || updatedPet.petName;
    updatedPet.customerId = petDetails.ownerID || updatedPet.customerId;
    updatedPet.createBy = petDetails.createBy || updatedPet.createBy;
    updatedPet.speciesId = species?._id ? new mongoose.Types.ObjectId(species._id.toString()) : updatedPet.speciesId;
    updatedPet.gender = petDetails.gender || updatedPet.gender;
    updatedPet.age = petDetails.age || updatedPet.age;
    updatedPet.imageUrl = image || updatedPet.imageUrl;
    updatedPet.medicalHistory = petDetails.medicalHistory || updatedPet.medicalHistory;
    updatedPet.weight = petDetails.weight || updatedPet.weight;
    const savedPet = await updatedPet.save();

    res.status(200).json({
      message: "Update pet successfully",
      success: true,
      error: false,
      data: savedPet,
    });
  } catch (error) {
    console.error("Error updating pet:", error);
    res.status(400).json({
      message: "Failed to update pet",
      success: false,
      error: true,
    });
  }
};
export const updatePetByDoctor = async (req: AuthRequest, res: Response) => {
  const image = req.file?.path;
  const petDetails = req.body;
  console.log(petDetails);

  try {
    const species = await speciesModel.findOne({ speciesName: petDetails.species });
    if (!species) {
      res.status(404).json({
        message: "Species not found",
        success: false,
        error: true,
      });
      return;
    }
    if (image) {
      petDetails.imageUrl = image;
    }
    const petId = new mongoose.Types.ObjectId(req.params.id);
    const updatedPet = await Pet.findOne({ _id: petId });
    if (updatedPet) {
      updatedPet.petName = petDetails.petName || updatedPet.petName;
      updatedPet.customerId = petDetails.ownerID || updatedPet.customerId;
      updatedPet.createBy = petDetails.createBy || updatedPet.createBy;
      updatedPet.speciesId = species?._id ? new mongoose.Types.ObjectId(species._id.toString()) : updatedPet.speciesId;
      updatedPet.gender = petDetails.gender || updatedPet.gender;
      updatedPet.age = petDetails.age || updatedPet.age;
      updatedPet.imageUrl = image || updatedPet.imageUrl;
      updatedPet.medicalHistory =
        petDetails.medicalHistory || updatedPet.medicalHistory;
      const savedPet = await updatedPet.save();
      res.status(200).json({
        message: "Update pet successfully",
        success: true,
        error: false,
        data: savedPet,
      });
    } else {
      res.status(404).json({ success: false, message: "Pet Not Found" });
      return;
    }
  } catch (error) {
    console.error("Error updating pet:", error);
    res.status(400).json({
      message: "Failed to update pet",
      success: false,
      error: true,
    });
  }
};
export const DeletePetByCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const pet = await Pet.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    if (!pet) {
      res.status(404).json({
        message: "Pet not found",
        success: false,
        error: true,
      });
      return;
    }

    res.status(200).json({
      message: "Pet deleted successfully (soft delete)",
      success: true,
      error: false,
      data: pet,
    });
  } catch (error) {
    console.error("Soft delete error:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
      error: true,
    });
  }
};
