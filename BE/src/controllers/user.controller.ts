
import { Request, Response } from "express";
import User from "../models/user.model";
import { sendVerificationEmail } from "../utils/mailer";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const allUsers = await User.find().select("-password");
    res.status(200).json({
      message: "Get all users successfully",
      success: true,
      error: false,
      data: allUsers,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server is error",
      error: true,
      success: false,
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    let userId = req.params.userId;
    const userDetail = await User.findById(userId).select("-password");
    res.status(200).json({
      message: "Get users detail successfully",
      success: true,
      error: false,
      data: userDetail,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server is error",
      error: true,
      success: false,
    });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    let userId = req.params.userId
    const { fullName, phone, avatar, address, licenseNumber } = req.body
    let dataUpdate = await User.findByIdAndUpdate(userId, {
      fullName: fullName,
      phone: phone,
      avatar: avatar,
      address: address,
      licenseNumber: licenseNumber
    }, {
      new: true
    })
    res.status(200).json({
      success: true,
      error: false,
      message: "User updated successfully",
      data: dataUpdate,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server is error",
      error: true,
      success: false,
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      res.status(404).json({
        message: "User not found",
        success: false,
        error: true,
      });
    }

    res.status(200).json({
      message: "User deleted successfully",
      success: true,
      error: false,
      data: deletedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: true,
      message: "Server error",
    });
  }
};

export const toggleBlockUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const { isBlock } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isBlock },
      { new: true }
    );

    if (!updatedUser) {
      res.status(404).json({
        message: "User not found",
        success: false,
        error: true,
      });
    }

    res.status(200).json({
      message: isBlock ? "User has been blocked" : "User has been unblocked",
      success: true,
      error: false,
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      success: false,
      error: true,
    });
  }
};


export const createUserAccount = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password, fullName, role } = req.body;

    if (!email || !password || !fullName || !role) {
      res.status(400).json({
        message: "Missing required fields",
        success: false,
        error: true,
      });
      return;
    }

    const validRoles = ["customer", "doctor", "staff", "manager"];
    if (!validRoles.includes(role)) {
      res.status(400).json({
        message: "Invalid role",
        success: false,
        error: true,
      });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({
        message: "Email already exists",
        success: false,
        error: true,
      });
      return;
    }
    const emailToken = crypto.randomBytes(32).toString("hex");

    const user = new User({
      email,
      password,
      fullName,
      role,
      emailToken,
      isVerified: false,
      isClinic: false,
    });

    await user.save();
    await sendVerificationEmail(email, emailToken);

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "User created successfully. Please verify email.",
      success: true,
      error: false,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      },
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      message: error.message || "Server error",
      success: false,
      error: true,
    });
  }
};

