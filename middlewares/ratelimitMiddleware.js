import dotenv from "dotenv";
dotenv.config();

import rateLimit from "express-rate-limit";

// General API rate limiter
export const apiRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS), // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

// Authentication rate limiter
export const authRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS), // 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX), // limit each IP to 5 requests per windowMs
  message:
    "Too many authentication attempts from this IP, please try again later.",
});

// Account creation rate limiter
export const createAccountRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS), // 15 minutes
  max: 3, // limit each IP to 3 account creation requests per windowMs
  message: "Too many accounts created from this IP, please try again later.",
});
