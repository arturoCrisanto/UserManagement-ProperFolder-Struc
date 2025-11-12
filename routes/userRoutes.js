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
  getCurrentUserProfile,
  updateCurrentUserProfile,
} from "../controllers/userController.js";
import {
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
  validateRefreshToken,
} from "../middlewares/validateMiddleware.js";

const router = express.Router();

// Public routes (no authentication required)
router.post("/register", validateRegistration, createUser);
router.post("/login", validateLogin, loginUser);
router.post("/refresh", validateRefreshToken, refreshAccessToken);

// Protected routes (authentication required)
router.post("/logout", authenticateToken, logoutUser);

// Current user profile routes
router.get("/profile", authenticateToken, getCurrentUserProfile);
router.put(
  "/profile",
  authenticateToken,
  validateProfileUpdate,
  updateCurrentUserProfile
);

// Admin-only routes
router.get("/all", authenticateToken, authorizeRole("Admin"), getAllUsers);
router.get("/:id", authenticateToken, authorizeRole("Admin"), getUserById);

export default router;
