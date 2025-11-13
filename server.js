import dotenv from "dotenv";
dotenv.config();

import express from "express";
import userRoutes from "./routes/userRoutes.js";
import { logger } from "./utils/logger.js";
import { connectDatabase } from "./config/database.js";

// Connect to MongoDB
connectDatabase();

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// Export app for testing
export default app;

// Start server only if not in test environment
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
}
