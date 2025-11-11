import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { authorizeRole } from "../middlewares/roleMiddleware.js";
import {
  getAllUsers,
  createUser,
  getUserById,
  loginUser,
  logoutUser,
  refreshAccessToken,
} from "../controllers/userController.js";

const router = express.Router();

// routes for user operations
// Specific routes MUST come before parameterized routes
router
  .post("/login", loginUser)
  .post("/refresh", refreshAccessToken)
  .post("/logout", logoutUser)
  .post("/", createUser)
  .get("/profile", authenticateToken, authorizeRole("Admin"), getAllUsers)
  .get("/:id", authenticateToken, authorizeRole("Admin"), getUserById);

export default router;
