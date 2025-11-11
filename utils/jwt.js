import jwt from "jsonwebtoken";
import { asyncHandler } from "./errorHandler.js";

export const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded; // Make sure you're returning the decoded token
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};
