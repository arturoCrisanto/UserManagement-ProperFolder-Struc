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

// Trust proxy - required for rate limiting behind reverse proxies (like Render)
app.set("trust proxy", 1);

// Middleware
app.use(express.json());

// Logging middleware to debug routes
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

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
