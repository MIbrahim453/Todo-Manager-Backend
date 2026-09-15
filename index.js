import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import todoRoutes from "./routes/todo.routes.js";
import { connectDB } from "./config/db.connection.js";

const app = express();
connectDB();
const API_PREFIX = "/api/v1";

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get(`${API_PREFIX}/health`, (_req, res) => {
  res.status(200).json({ message: "Server is running" });
});

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/user`, userRoutes);
app.use(`${API_PREFIX}/todo`, todoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server Started at ${PORT}`),
);
