import { sendErrorResponse } from "../utils/responseHandler.js";
import { logger } from "../utils/logger.js";

export const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      logger.error(
        `Unauthorized access attempt by user with role: ${
          req.user ? req.user.role : "unknown"
        }`
      );
      return sendErrorResponse(
        res,
        "Access denied: insufficient permissions",
        403
      );
    }
    logger.info(`User with role: ${req.user.role} authorized successfully`);
    next();
  };
};
