import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

const saltRounds = 10;

const users = [
  {
    id: randomUUID(),
    name: "Alice Johnson",
    email: "alice@example.com",
    password: bcrypt.hashSync("password123", saltRounds),
    role: "Admin",
  },
  {
    id: randomUUID(),
    name: "Bob Smith",
    email: "bob@example.com",
    password: bcrypt.hashSync("password123", saltRounds),
    role: "User",
  },
  {
    id: randomUUID(),
    name: "Charlie Brown",
    email: "charlie@example.com",
    password: bcrypt.hashSync("password123", saltRounds),
    role: "User",
  },
  {
    id: randomUUID(),
    name: "Diana King",
    email: "diana@example.com",
    password: bcrypt.hashSync("password123", saltRounds),
    role: "Moderator",
  },
  {
    id: randomUUID(),
    name: "Evan Lee",
    email: "evan@example.com",
    password: bcrypt.hashSync("password123", saltRounds),
    role: "User",
  },
  {
    id: randomUUID(),
    name: "Fiona Davis",
    email: "fiona@example.com",
    password: bcrypt.hashSync("password123", saltRounds),
    role: "Admin",
  },
  {
    id: randomUUID(),
    name: "George Miller",
    email: "george@example.com",
    password: bcrypt.hashSync("password123", saltRounds),
    role: "User",
  },
  {
    id: randomUUID(),
    name: "Hannah Scott",
    email: "hannah@example.com",
    password: bcrypt.hashSync("password123", saltRounds),
    role: "User",
  },
  {
    id: randomUUID(),
    name: "Ivan Lopez",
    email: "ivan@example.com",
    password: bcrypt.hashSync("password123", saltRounds),
    role: "User",
  },
  {
    id: randomUUID(),
    name: "Jenny Carter",
    email: "jenny@example.com",
    password: bcrypt.hashSync("password123", saltRounds),
    role: "Moderator",
  },
];

export default users;
