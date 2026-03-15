import mongoose from "mongoose";
import dotenv from "dotenv";

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI as string;

    if (!mongoURI) {
      throw new Error("MONGO_URI not found in environment variables");
    }

    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;