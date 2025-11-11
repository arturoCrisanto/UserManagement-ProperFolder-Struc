import { randomUUID } from "crypto";

const users = [
  {
    id: randomUUID(),
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "Admin",
  },
  {
    id: randomUUID(),
    name: "Bob Smith",
    email: "bob@example.com",
    role: "User",
  },
  {
    id: randomUUID(),
    name: "Charlie Brown",
    email: "charlie@example.com",
    role: "User",
  },
  {
    id: randomUUID(),
    name: "Diana King",
    email: "diana@example.com",
    role: "Moderator",
  },
  {
    id: randomUUID(),
    name: "Evan Lee",
    email: "evan@example.com",
    role: "User",
  },
  {
    id: randomUUID(),
    name: "Fiona Davis",
    email: "fiona@example.com",
    role: "Admin",
  },
  {
    id: randomUUID(),
    name: "George Miller",
    email: "george@example.com",
    role: "User",
  },
  {
    id: randomUUID(),
    name: "Hannah Scott",
    email: "hannah@example.com",
    role: "User",
  },
  {
    id: randomUUID(),
    name: "Ivan Lopez",
    email: "ivan@example.com",
    role: "User",
  },
  {
    id: randomUUID(),
    name: "Jenny Carter",
    email: "jenny@example.com",
    role: "Moderator",
  },
];

export default users;
