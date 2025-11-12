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
import {
  createAccountRateLimiter,
  authRateLimiter,
  apiRateLimiter,
} from "../middlewares/rateLimitMiddleware.js";

const router = express.Router();
// Apply general API rate limiter to all routes
router.use(apiRateLimiter);

// Public routes (no authentication required)
router.post(
  "/register",
  createAccountRateLimiter,
  validateRegistration,
  createUser
);
router.post("/login", authRateLimiter, validateLogin, loginUser);
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
