import users from "../models/userModels.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/errorHandler.js";
import { logger } from "../utils/logger.js";
import {
  sendSuccessResponse,
  sendErrorResponse,
} from "../utils/responseHandler.js";
import { send } from "process";

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

export const createUser = asyncHandler((req, res) => {
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

  const newUser = {
    id: crypto.randomUUID(),
    name,
    email,
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
  logger.debug(`Generated token for user Name: ${newUser.name}`);
  users.push(newUser);
  sendSuccessResponse(
    res,
    { user: newUser, token },
    "User created successfully",
    201
  );
});
