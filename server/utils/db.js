import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
// conncet to MongoDB
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    console.log("✅ Already connected to MongoDB.");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI); // No options needed
    console.log("✅ MongoDB connected.");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1); // optional: stop the server if DB fails
  }
};

export default connectDB;
