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

// Public routes (no authentication required)
router.post(
  "/register",
  apiRateLimiter,
  createAccountRateLimiter,
  validateRegistration,
  createUser
);
router.post(
  "/login",
  apiRateLimiter,
  authRateLimiter,
  validateLogin,
  loginUser
);
router.post(
  "/refresh",
  apiRateLimiter,
  validateRefreshToken,
  refreshAccessToken
);

// Protected routes (authentication required)
router.post("/logout", apiRateLimiter, authenticateToken, logoutUser);

// Current user profile routes
router.get(
  "/profile",
  apiRateLimiter,
  authenticateToken,
  getCurrentUserProfile
);
router.put(
  "/profile",
  apiRateLimiter,
  authenticateToken,
  validateProfileUpdate,
  updateCurrentUserProfile
);

// Admin-only routes
router.get(
  "/all",
  apiRateLimiter,
  authenticateToken,
  authorizeRole("Admin"),
  getAllUsers
);
router.get(
  "/:id",
  apiRateLimiter,
  authenticateToken,
  authorizeRole("Admin"),
  getUserById
);

export default router;
