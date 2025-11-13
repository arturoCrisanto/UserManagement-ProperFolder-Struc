import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/userModels.js";
import { logger } from "../utils/logger.js";

const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;

const seedUsers = [
  {
    name: "Alice Johnson",
    email: "alice@example.com",
    password: bcrypt.hashSync("password123", saltRounds),
    role: "Admin",
  },
  {
    name: "Bob Smith",
    email: "bob@example.com",
    password: bcrypt.hashSync("password123", saltRounds),
    role: "User",
  },
  {
    name: "Charlie Brown",
    email: "charlie@example.com",
    password: bcrypt.hashSync("password123", saltRounds),
    role: "User",
  },
  {
    name: "Diana King",
    email: "diana@example.com",
    password: bcrypt.hashSync("password123", saltRounds),
    role: "Moderator",
  },
  {
    name: "Evan Lee",
    email: "evan@example.com",
    password: bcrypt.hashSync("password123", saltRounds),
    role: "User",
  },
  {
    name: "Fiona Davis",
    email: "fiona@example.com",
    password: bcrypt.hashSync("password123", saltRounds),
    role: "Admin",
  },
  {
    name: "George Miller",
    email: "george@example.com",
    password: bcrypt.hashSync("password123", saltRounds),
    role: "User",
  },
  {
    name: "Hannah Scott",
    email: "hannah@example.com",
    password: bcrypt.hashSync("password123", saltRounds),
    role: "User",
  },
  {
    name: "Ivan Lopez",
    email: "ivan@example.com",
    password: bcrypt.hashSync("password123", saltRounds),
    role: "User",
  },
  {
    name: "Jenny Carter",
    email: "jenny@example.com",
    password: bcrypt.hashSync("password123", saltRounds),
    role: "Moderator",
  },
];

const seedDatabase = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/user-management";

    await mongoose.connect(mongoUri);
    logger.info("Connected to MongoDB");

    // Clear existing users
    await User.deleteMany({});
    logger.info("Cleared existing users");

    // Insert seed users
    await User.insertMany(seedUsers);
    logger.info(`Successfully seeded ${seedUsers.length} users`);

    await mongoose.connection.close();
    logger.info("Database connection closed");
    process.exit(0);
  } catch (error) {
    logger.error(`Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
