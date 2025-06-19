import express from "express";
import mongoose from "mongoose";
import routes from "./routes";
import dotenv from "dotenv";
import connectDB from "./config/db";
import path from "path";
import "./middlewares/discountCode.middlewares";
import cors from "cors";
dotenv.config();

const app = express();
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};

app.use(cors(corsOptions));
connectDB();
app.use(express.json());
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/api/v1", routes);

export default app;
