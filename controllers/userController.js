import users from "../models/userModels.js";
import crypto from "crypto";
import bycrypt from "bcrypt";
import { asyncHandler } from "../utils/errorHandler.js";
import { logger } from "../utils/logger.js";
import {
  sendSuccessResponse,
  sendErrorResponse,
} from "../utils/responseHandler.js";
import { verifyRefreshToken } from "../utils/jwt.js";
import {
  hashPassword,
  comparePassword,
  generateTokenPair,
  addRefreshToken,
  removeRefreshToken,
  hasValidRefreshToken,
  sanitizeUser,
} from "../utils/authHelper.js";

// ==================== User CRUD Operations ====================

export const getAllUsers = asyncHandler((req, res) => {
  if (users.length === 0) {
    return sendErrorResponse(res, "No users found", 404);
  }

  logger.info("Fetched all users");
  sendSuccessResponse(res, users, "Users retrieved successfully");
});

export const getUserById = asyncHandler((req, res) => {
  const { id } = req.params;
  const user = users.find((u) => u.id === id);

  logger.debug(`Searching for user with ID: ${id}`);

  if (!user) {
    logger.error(`User with ID: ${id} not found`);
    return sendErrorResponse(res, "User not found", 404);
  }

  logger.info(`User with ID: ${id} retrieved successfully`);
  sendSuccessResponse(res, user, "User retrieved successfully");
});

export const createUser = asyncHandler(async (req, res) => {
  const { name, email, role, password } = req.body;

  logger.debug("Creating a new user");

  // Validate required fields
  if (!name || !email || !password) {
    logger.error("Missing required fields for user creation");
    return sendErrorResponse(
      res,
      "Name, email, and password are required",
      400
    );
  }

  // Check if user already exists
  if (users.find((u) => u.email === email)) {
    logger.error(`User creation failed: Email ${email} already exists`);
    return sendErrorResponse(res, "Email already exists", 409);
  }

  // Create new user
  const newUser = {
    id: crypto.randomUUID(),
    name,
    email,
    password: await hashPassword(password),
    role: role || "User",
    refreshTokens: [],
  };

  // Generate tokens
  const { accessToken, refreshToken } = generateTokenPair(newUser);
  addRefreshToken(newUser, refreshToken);

  // Add user to database
  users.push(newUser);

  logger.info(`New user created with ID: ${newUser.id}`);

  // Remove password from response
  const { password: _, ...userWithoutPassword } = newUser;

  sendSuccessResponse(
    res,
    {
      user: sanitizeUser(userWithoutPassword),
      accessToken,
      refreshToken,
    },
    "User created successfully",
    201
  );
});

// ==================== Authentication Operations ====================

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  logger.debug("User login attempt");

  // Find user by email
  const user = users.find((u) => u.email === email);
  if (!user) {
    logger.error(`Login failed: User with email ${email} not found`);
    return sendErrorResponse(res, "Invalid email or password", 401);
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    logger.error(`Login failed: Invalid password for email ${email}`);
    return sendErrorResponse(res, "Invalid email or password", 401);
  }
  // Generate tokens
  const { accessToken, refreshToken } = generateTokenPair(user);
  addRefreshToken(user, refreshToken);

  logger.info(`User with email ${email} logged in successfully`);

  sendSuccessResponse(res, { accessToken, refreshToken }, "Login successful");
});

export const logoutUser = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    logger.error("Refresh token missing in logout request");
    return sendErrorResponse(res, "Refresh token is required", 400);
  }

  try {
    // Verify and decode refresh token
    const decoded = verifyRefreshToken(refreshToken);
    const user = users.find((u) => u.id === decoded.id);

    // Check if user exists and token is valid using hasValidRefreshToken helper
    if (!user || !hasValidRefreshToken(user, refreshToken)) {
      logger.error("Invalid refresh token during logout");
      return sendErrorResponse(res, "Invalid refresh token", 401);
    }
    // Remove refresh token using removeRefreshToken helper
    removeRefreshToken(user, refreshToken);

    logger.info(`User with ID: ${user.id} logged out successfully`);
    sendSuccessResponse(res, null, "Logout successful");
  } catch (error) {
    logger.error("Logout failed: " + error.message);
    return sendErrorResponse(res, "Invalid refresh token", 401);
  }
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    logger.error("Refresh token missing in request");
    return sendErrorResponse(res, "Refresh token is required", 400);
  }

  try {
    // Verify and decode refresh token
    const decoded = verifyRefreshToken(refreshToken);
    const user = users.find((u) => u.id === decoded.id);

    // Check if user exists and token is valid using hasValidRefreshToken helper
    if (!user || !hasValidRefreshToken(user, refreshToken)) {
      logger.error("Invalid refresh token");
      return sendErrorResponse(res, "Invalid refresh token", 401);
    }
    // Generate new access token
    const { accessToken } = generateTokenPair(user);

    logger.info(`Access token refreshed for user ID: ${user.id}`);

    sendSuccessResponse(
      res,
      { accessToken: accessToken },
      "Token refreshed successfully"
    );
  } catch (error) {
    logger.error("Token refresh failed: " + error.message);
    return sendErrorResponse(res, "Invalid or expired refresh token", 401);
  }
});
