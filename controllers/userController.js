import User from "../models/userModels.js";
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

export const getAllUsers = asyncHandler(async (req, res) => {
  const totalCount = await User.countDocuments();

  if (totalCount === 0) {
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

  // Build query
  let query = {};
  const searchQuery = req.query.search || null;

  if (searchQuery) {
    query.$or = [
      { name: { $regex: searchQuery, $options: "i" } },
      { email: { $regex: searchQuery, $options: "i" } },
      { role: { $regex: searchQuery, $options: "i" } },
    ];
  }

  // Calculate skip value
  const skip = (page - 1) * limit;

  // Fetch users with pagination
  const sortOrder = order === "asc" ? 1 : -1;
  const users = await User.find(query)
    .select("-password -refreshTokens")
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit)
    .lean();

  const filteredCount = await User.countDocuments(query);
  const totalPages = Math.ceil(filteredCount / limit);

  // Create pagination metadata
  const paginationData = {
    currentPage: page,
    totalPages,
    totalItems: filteredCount,
    itemsPerPage: limit,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
    nextPage: page < totalPages ? page + 1 : null,
    previousPage: page > 1 ? page - 1 : null,
  };

  logger.info(`Fetched ${users.length} users (page ${page}, limit ${limit})`);
  sendSuccessResponse(
    res,
    {
      users,
      pagination: paginationData,
    },
    "Users retrieved successfully"
  );
});

export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  logger.debug(`Searching for user with ID: ${id}`);

  const user = await User.findById(id)
    .select("-password -refreshTokens")
    .lean();

  if (!user) {
    logger.error(`User with ID: ${id} not found`);
    return sendErrorResponse(res, "User not found", 404);
  }

  logger.info(`User with ID: ${id} retrieved successfully`);
  sendSuccessResponse(res, user, "User retrieved successfully");
});

export const createUser = asyncHandler(async (req, res) => {
  logger.info("createUser controller called");
  logger.debug(`Request body: ${JSON.stringify(req.body)}`);

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
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    logger.error(`User creation failed: Email ${email} already exists`);
    return sendErrorResponse(res, "Email already exists", 409);
  }

  // Create new user
  const newUser = new User({
    name,
    email,
    password: await hashPassword(password),
    role: role || "User",
  });

  // Generate tokens
  const { accessToken, refreshToken } = generateTokenPair({
    id: newUser._id,
    email: newUser.email,
    role: newUser.role,
  });

  newUser.refreshTokens.push(refreshToken);
  await newUser.save();

  logger.info(`New user created with ID: ${newUser._id}`);

  sendSuccessResponse(
    res,
    {
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
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
  const user = await User.findOne({ email });
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
  const { accessToken, refreshToken } = generateTokenPair({
    id: user._id,
    email: user.email,
    role: user.role,
  });

  user.refreshTokens.push(refreshToken);
  await user.save();

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
    const user = await User.findById(decoded.id);

    // Check if user exists and token is valid
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      logger.error("Invalid refresh token during logout");
      return sendErrorResponse(res, "Invalid refresh token", 401);
    }

    // Remove refresh token
    user.refreshTokens = user.refreshTokens.filter(
      (token) => token !== refreshToken
    );
    await user.save();

    logger.info(`User with ID: ${user._id} logged out successfully`);
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
    const user = await User.findById(decoded.id);

    // Check if user exists and token is valid
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      logger.error("Invalid refresh token");
      return sendErrorResponse(res, "Invalid refresh token", 401);
    }

    // Generate new access token
    const { accessToken } = generateTokenPair({
      id: user._id,
      email: user.email,
      role: user.role,
    });

    logger.info(`Access token refreshed for user ID: ${user._id}`);

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

  const user = await User.findById(userId)
    .select("-password -refreshTokens")
    .lean();

  if (!user) {
    logger.error(`User with ID: ${userId} not found`);
    return sendErrorResponse(res, "User not found", 404);
  }

  logger.info(`Profile retrieved successfully for user ID: ${userId}`);
  sendSuccessResponse(res, user, "Profile retrieved successfully");
});

export const updateCurrentUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { name, email } = req.body;

  logger.debug(`Updating profile for user ID: ${userId}`);

  const user = await User.findById(userId);

  if (!user) {
    logger.error(`User with ID: ${userId} not found`);
    return sendErrorResponse(res, "User not found", 404);
  }

  // Check if email is being changed and if it already exists
  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email, _id: { $ne: userId } });
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

  await user.save();

  logger.info(`Profile updated successfully for user ID: ${userId}`);
  sendSuccessResponse(
    res,
    {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    "Profile updated successfully"
  );
});
