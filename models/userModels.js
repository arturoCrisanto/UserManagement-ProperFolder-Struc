import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

const saltRounds = process.env.SALT_ROUNDS
  ? parseInt(process.env.SALT_ROUNDS)
  : 10;

const users = [
  {
    id: randomUUID(),
    name: "Alice Johnson",
    email: "alice@example.com",
    password: bcrypt.hashSync("password123", saltRounds),
    role: "Admin",
    refreshTokens: [],
  },
  {
    id: randomUUID(),
    name: "Bob Smith",
    email: "bob@example.com",
    password: bcrypt.hashSync("password123", saltRounds),
    role: "User",
    refreshTokens: [],
  },
  {
    id: randomUUID(),
    name: "Charlie Brown",
    email: "charlie@example.com",
    password: bcrypt.hashSync("password123", saltRounds),
    role: "User",
    refreshTokens: [],
  },
  {
    id: randomUUID(),
    name: "Diana King",
    email: "diana@example.com",
    password: bcrypt.hashSync("password123", saltRounds),
    role: "Moderator",
    refreshTokens: [],
  },
  {
    id: randomUUID(),
    name: "Evan Lee",
    email: "evan@example.com",
    password: bcrypt.hashSync("password123", saltRounds),
    role: "User",
    refreshTokens: [],
  },
  {
    id: randomUUID(),
    name: "Fiona Davis",
    email: "fiona@example.com",
    password: bcrypt.hashSync("password123", saltRounds),
    role: "Admin",
    refreshTokens: [],
  },
  {
    id: randomUUID(),
    name: "George Miller",
    email: "george@example.com",
    password: bcrypt.hashSync("password123", saltRounds),
    role: "User",
    refreshTokens: [],
  },
  {
    id: randomUUID(),
    name: "Hannah Scott",
    email: "hannah@example.com",
    password: bcrypt.hashSync("password123", saltRounds),
    role: "User",
    refreshTokens: [],
  },
  {
    id: randomUUID(),
    name: "Ivan Lopez",
    email: "ivan@example.com",
    password: bcrypt.hashSync("password123", saltRounds),
    role: "User",
    refreshTokens: [],
  },
  {
    id: randomUUID(),
    name: "Jenny Carter",
    email: "jenny@example.com",
    password: bcrypt.hashSync("password123", saltRounds),
    role: "Moderator",
    refreshTokens: [],
  },
];

export default users;
