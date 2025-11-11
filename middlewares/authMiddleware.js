import { verifyToken } from "../utils/jwt.js";
import { logger } from "../utils/logger.js";
import { sendErrorResponse } from "../utils/responseHandler.js";

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return sendErrorResponse(res, "No token provided", 401);
  }
  try {
    const decoded = await verifyToken(token);
    req.user = decoded;
    logger.info("Token verified successfully");
    logger.info(`User data from token: ${JSON.stringify(decoded)}`); // Add this line to see what's in the token
    next();
  } catch (error) {
    logger.error(`Token verification failed: ${error.message}`);
    return sendErrorResponse(res, "Invalid token", 403, error);
  }
};
