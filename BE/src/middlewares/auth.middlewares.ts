import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/user.model";
import dotenv from "dotenv";
dotenv.config();
export interface AuthRequest extends Request {
  user?: JwtPayload & { id: string; role: string };
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("❌ JWT_SECRET is not defined in environment variables!");
}

export const isAuthenticated = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];

    if (!token) {
      res.status(401).json({ success: false, message: "Token not found" });
      return;
    }

    // Giải mã token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & {
      id: string;
      role: string;
    };

    req.user = decoded;

    // Lấy thông tin user từ DB để kiểm tra trạng thái
    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    if (user.isBlock) {
      res.status(403).json({
        success: false,
        message: "Your account has been blocked",
      });
      return;
    }

    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user || !roles.includes(user.role)) {
      res.status(403).json({
        success: false,
        message: "Access denied: insufficient role",
      });
      return;
    }

    next();
  };
};
