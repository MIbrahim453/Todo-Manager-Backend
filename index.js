import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import todoRoutes from "./routes/todo.routes.js";
import { connectDB } from "./config/db.connection.js";

const app = express();
const API_PREFIX = "/api/v1";

const allowedOrigin = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.replace(/\/$/, "")
  : true;

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (_req, res) => {
  res.status(200).json({ message: "Todo Manager API is running" });
});

app.get(`${API_PREFIX}/health`, (_req, res) => {
  res.status(200).json({ message: "Server is running" });
});

app.use(async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/user`, userRoutes);
app.use(`${API_PREFIX}/todo`, todoRoutes);

app.use((err, _req, res, _next) => {
  console.error("Server Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 3000;

if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => console.log(`Server Started at ${PORT}`));
}

export default app;

