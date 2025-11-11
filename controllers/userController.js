import users from "../models/userModels.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/errorHandler.js";
import { logger } from "../utils/logger.js";
import {
  sendSuccessResponse,
  sendErrorResponse,
} from "../utils/responseHandler.js";
import bcrypt from "bcrypt";

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
    return res.status(404).json({ message: "User not found" });
  }
  logger.info(`User with ID: ${id} retrieved successfully`);
  sendSuccessResponse(res, user, "User retrieved successfully");
});

export const createUser = asyncHandler(async (req, res) => {
  const { name, email, role } = req.body;
  logger.debug("Creating a new user");
  if (!name || !email || !role) {
    logger.error("Missing required fields for user creation");
    sendErrorResponse(res, "Name, email, and role are required", 400);
    return;
  }

  if (users.find((u) => u.email === email)) {
    logger.error(`User creation failed: Email ${email} already exists`);
    return sendErrorResponse(res, "Email already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(
    req.body.password,
    parseInt(process.env.SALT_ROUNDS)
  );

  const newUser = {
    id: crypto.randomUUID(),
    name,
    email,
    password: hashedPassword,
    role,
  };

  const token = jwt.sign(
    {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  logger.info(`New user created with ID: ${newUser.id}`);
  users.push(newUser);
  const { password: _, ...userWithoutPassword } = newUser;
  sendSuccessResponse(
    res,
    { user: userWithoutPassword, token },
    "User created successfully",
    201
  );
});

export const loginUser = asyncHandler(async (req, res) => {
  console.log("LOGIN ENDPOINT HIT");
  const { email, password } = req.body;
  logger.debug("User login attempt");
  const user = users.find((u) => u.email === email);
  if (!user) {
    logger.error(`Login failed: User with email ${email} not found`);
    return sendErrorResponse(res, "Invalid email or password", 401);
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    logger.error(`Login failed: Invalid password for email ${email}`);
    return sendErrorResponse(res, "Invalid email or password", 401);
  }
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
  logger.info(`User with email ${email} logged in successfully`);
  sendSuccessResponse(res, { token }, "Login successful");
});
