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
import {
  paginate,
  parsePaginationQuery,
  filterItems,
  validatePaginationParams,
} from "../utils/pagination.js";

// ==================== User CRUD Operations ====================

export const getAllUsers = asyncHandler((req, res) => {
  const allUsers = Object.values(users);
  if (allUsers === 0) {
    return sendErrorResponse(res, "No users found", 404);
  }

  // Validate raw query parameters first
  const rawPage = req.query.page ? parseInt(req.query.page) : 1;
  const rawLimit = req.query.limit ? parseInt(req.query.limit) : 10;

  // Check if parsing resulted in invalid numbers
  if (req.query.page && (isNaN(rawPage) || rawPage < 1)) {
    logger.error(`Invalid page parameter: ${req.query.page}`);
    return sendErrorResponse(
      res,
      "Page must be a positive integer greater than 0.",
      400
    );
  }

  if (req.query.limit && (isNaN(rawLimit) || rawLimit < 1 || rawLimit > 100)) {
    logger.error(`Invalid limit parameter: ${req.query.limit}`);
    return sendErrorResponse(
      res,
      "Limit must be a positive integer between 1 and 100.",
      400
    );
  }

  // Parse pagination query parameters
  const { page, limit, sortBy, order } = parsePaginationQuery(req.query);

  logger.debug(
    `Fetching users - Page: ${page}, Limit: ${limit}, SortBy: ${sortBy}, Order: ${order}`
  );
  // Apply search filter if search query is provided
  const searchQuery = req.query.search || null;
  const searchFields = ["name", "email", "role"];
  const filteredUsers = searchQuery
    ? filterItems(allUsers, searchQuery, searchFields)
    : allUsers;

  // Paginate the filtered users
  const { data: paginatedUsers, metadata } = paginate(filteredUsers, {
    page,
    limit,
    sortBy,
    order,
  });

  // Add navigation properties to metadata
  const paginationData = {
    ...metadata,
    hasNextPage: page < metadata.totalPages,
    hasPreviousPage: page > 1,
    nextPage: page < metadata.totalPages ? page + 1 : null,
    previousPage: page > 1 ? page - 1 : null,
  };

  // Sanitize users (remove sensitive data)
  const sanitizedUsers = paginatedUsers.map(sanitizeUser);
  logger.info(
    `Fetched ${sanitizedUsers.length} users (page ${page}, limit ${limit})`
  );
  sendSuccessResponse(
    res,
    {
      users: sanitizedUsers,
      pagination: paginationData,
    },
    "Users retrieved successfully"
  );
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
  sendSuccessResponse(res, sanitizeUser(user), "User retrieved successfully");
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
      { email: user.email, accessToken: accessToken },
      "Token refreshed successfully"
    );
  } catch (error) {
    logger.error("Token refresh failed: " + error.message);
    return sendErrorResponse(res, "Invalid or expired refresh token", 401);
  }
});

// ==================== Profile Operations ====================

export const getCurrentUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  logger.debug(`Fetching profile for user ID: ${userId}`);

  const user = users.find((u) => u.id === userId);

  if (!user) {
    logger.error(`User with ID: ${userId} not found`);
    return sendErrorResponse(res, "User not found", 404);
  }

  logger.info(`Profile retrieved successfully for user ID: ${userId}`);
  sendSuccessResponse(
    res,
    sanitizeUser(user),
    "Profile retrieved successfully"
  );
});

export const updateCurrentUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { name, email } = req.body;

  logger.debug(`Updating profile for user ID: ${userId}`);

  const user = users.find((u) => u.id === userId);

  if (!user) {
    logger.error(`User with ID: ${userId} not found`);
    return sendErrorResponse(res, "User not found", 404);
  }

  // Check if email is being changed and if it already exists
  if (email && email !== user.email) {
    const emailExists = users.find((u) => u.email === email && u.id !== userId);
    if (emailExists) {
      logger.error(`Email ${email} already exists`);
      return sendErrorResponse(res, "Email already exists", 409);
    }
    user.email = email;
  }

  // Update name if provided
  if (name) {
    user.name = name;
  }

  logger.info(`Profile updated successfully for user ID: ${userId}`);
  sendSuccessResponse(res, sanitizeUser(user), "Profile updated successfully");
});
