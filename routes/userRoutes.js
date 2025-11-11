import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { authorizeRole } from "../middlewares/roleMiddleware.js";
import {
  getAllUsers,
  createUser,
  getUserById,
} from "../controllers/userController.js";

const router = express.Router();

// routes for user operations
router
  .get("/profile", authenticateToken, authorizeRole("Admin"), getAllUsers)
  .get("/:id", authenticateToken, authorizeRole("Admin"), getUserById)
  .post("/", createUser);

export default router;
