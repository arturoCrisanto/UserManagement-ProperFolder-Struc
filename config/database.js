import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

export const connectDatabase = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/user-management";

    await mongoose.connect(mongoUri);

    logger.info(
      `MongoDB connected successfully to ${mongoose.connection.host}`
    );
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected");
});

mongoose.connection.on("error", (error) => {
  logger.error(`MongoDB error: ${error.message}`);
});
