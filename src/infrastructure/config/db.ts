import { logger } from '../../shared/logger/logger';
import mongoose from "mongoose";
import dotenv from "dotenv";

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI as string;

    if (!mongoURI) {
      throw new Error("MONGO_URI not found in environment variables");
    }

    await mongoose.connect(mongoURI);
    logger.info("✅ MongoDB connected");
  } catch (error) {
    logger.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;