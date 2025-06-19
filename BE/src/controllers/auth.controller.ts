import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import { BadRequestError, UnauthorizedError } from '../utils/errors';
import { sendOtpEmail, sendVerificationEmail } from '../utils/mailer';
import { sendNewPasswordEmail } from '../utils/mailer';
import crypto from 'crypto';
import bcrypt from 'bcrypt';


import { generateToken } from "../utils/jwt";
import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";
dotenv.config();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError("Email already in use");
    }

    const emailToken = crypto.randomBytes(32).toString("hex");

    const user = new User({
      email,
      password,
      fullName,
      phone,
      role: "customer",
      emailToken,
      isVerified: false,
    });

    await user.save();
    await sendVerificationEmail(email, emailToken);

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "Register successfully please verify email",
      success: true,
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
      success: false,
      message: error.message || "Server Error",
    });
  }
};
export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.query;

  const user = await User.findOne({ emailToken: token });
  if (!user) {
    throw new BadRequestError("Invalid or expired token");
  }

  user.emailToken = "";
  user.isVerified = true;
  await user.save();

  res.status(200).json({
    success: true,
    error: false,
    message: 'Email verified successfully. You can now login.'
  });
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequestError("Email and password are required");
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (!user.isVerified) {
      throw new UnauthorizedError("Please verify your email before logging in");
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Tạo JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          isBlock: user.isBlock
        },
      },
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: true,
      message: error.message || "Server Error",
    });
  }
};

export const sendNewPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) throw new BadRequestError('Please enter an email');

    const user = await User.findOne({ email });
    if (!user) throw new BadRequestError('Email does not exist');
    const newPassword = crypto.randomBytes(4).toString("hex");
    user.password = newPassword;
    user.markModified("password");
    await user.save();

    await sendNewPasswordEmail(email, newPassword);

    res.status(200).json({
      success: true,
      message: 'The new password has been sent to your email'

    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Serrver Error'
    });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword, userId } = req.body;

    if (!currentPassword || !newPassword || !userId) {
      res.status(400).json({
        success: false,
        error: true,
        message: "currentPassword and newPassword are required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: true,
        message: "User not found !",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user!.password);
    if (!isMatch) {
      res.status(400).json({
        success: false,
        error: true,
        message: "Current password incorect",
      });
    }

    user!.password = newPassword;
    user!.markModified('password');

    await user!.save();

    res.status(200).json({
      success: true,
      error: false,
      message: "Change password succecssfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: true,
      message: 'Server Error',

    });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email)
    res.status(400).json({
      error: true,
      succes: false,
      message: 'Please enter your email.'
    });

  const user = await User.findOne({ email });
  if (!user)
    res.status(404).json({
      error: true,
      succes: false,
      message: 'Email does not exist.'
    });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000);

  user!.resetOtp = otp;
  user!.otpExpires = expires;
  await user!.save();

  await sendOtpEmail(email, otp);

  res.json({
    error: false,
    succes: true,
    message: 'OTP has been sent to your email.'
  });
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email });
  if (!user || user.resetOtp !== otp || user.otpExpires < new Date()) {
    res.status(400).json({
      error: true,
      succes: false,
      message: 'Invalid or expired OTP.'
    });
  }

  user!.password = newPassword;
  user!.resetOtp = "";
  user!.otpExpires = new Date(Date.now() + 1 * 60 * 1000);
  await user!.save();

  res.json({
    error: false,
    succes: true,
    message: 'Password has been reset successfully.'
  });
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  if (!email || !otp) res.status(400).json({
    error: true,
    succes: false,
    message: '	Missing required information.'
  });

  const user = await User.findOne({ email });
  if (!user || user.resetOtp !== otp || user.otpExpires < new Date()) {
    res.status(400).json({
      error: true,
      succes: false,
      message: '	Invalid or expired OTP.'
    });
  }

  res.json({
    error: false,
    succes: true,
    message: 'OTP verified successfully.'
  });
};

export const loginWithGoogle = async (req: Request, res: Response) => {
  const { idToken } = req.body;

  if (!idToken) {
    res.status(400).json({ message: "Missing Google ID token" });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      res.status(401).json({ message: "Invalid Google token" });
    }

    const email = payload?.email;
    const name = payload?.name ?? "Google User";
    const picture = payload?.picture ?? "";

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        fullName: name,
        avatar: picture,
        role: "customer",
        isVerified: true,
      });
    }

    const token = generateToken({ id: user._id, role: user.role });

    res.json({ token, user });
  } catch (err: any) {
    console.error("Error during Google login:", err);
    res.status(500).json({
      message: "Failed to login with Google",
      error: err.message || "Unknown error",
    });
  }
};
