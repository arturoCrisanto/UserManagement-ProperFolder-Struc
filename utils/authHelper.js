import bcrypt from "bcrypt";
import { generateToken, generateRefreshToken } from "../utils/jwt.js";
import { isValidPassword } from "./validationHelper.js";
/**
 * Hash a password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export const hashPassword = async (password) => {
  const validation = isValidPassword(password);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }
  return await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS));
};

/**
 * Compare password with hashed password
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password
 * @returns {Promise<boolean>} True if passwords match
 */
export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Generate both access and refresh tokens for a user
 * @param {Object} user - User object
 * @returns {Object} Object containing accessToken and refreshToken
 */
export const generateTokenPair = (user) => {
  const accessToken = generateToken(user);
  const refreshToken = generateRefreshToken(user);
  return { accessToken, refreshToken };
};

/**
 * Add refresh token to user's token list
 * @param {Object} user - User object
 * @param {string} refreshToken - Refresh token to add
 */
export const addRefreshToken = (user, refreshToken) => {
  if (!user.refreshTokens) {
    user.refreshTokens = [];
  }
  user.refreshTokens.push(refreshToken);
};

/**
 * Remove refresh token from user's token list
 * @param {Object} user - User object
 * @param {string} refreshToken - Refresh token to remove
 */
export const removeRefreshToken = (user, refreshToken) => {
  if (!user.refreshTokens) {
    return;
  }
  user.refreshTokens = user.refreshTokens.filter(
    (token) => token !== refreshToken
  );
};

/**
 * Check if user has a valid refresh token
 * @param {Object} user - User object
 * @param {string} refreshToken - Refresh token to check
 * @returns {boolean} True if token is valid
 */
export const hasValidRefreshToken = (user, refreshToken) => {
  return user?.refreshTokens?.includes(refreshToken) ?? false;
};

/**
 * Remove password from user object
 * @param {Object} user - User object
 * @returns {Object} User object without password
 */
export const sanitizeUser = (user) => {
  const { password, refreshTokens, ...sanitizedUser } = user;
  return sanitizedUser;
};
