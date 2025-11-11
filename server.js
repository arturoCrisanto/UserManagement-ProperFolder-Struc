import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

//middleware to parse json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//api routes
app.use("/api/users", userRoutes);

//checking server
app.get("/", (req, res) => {
  res.send("this API is Working Properly");
});

app.listen(PORT, () => {
  console.log(`Server is running on port localhost:${PORT}`);
});
