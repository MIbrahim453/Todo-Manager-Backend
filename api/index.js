import "dotenv/config";
import app from "../app.js";
import { connectDB } from "../config/db.connection.js";

let connectionPromise;

export default async function handler(req, res) {
  try {
    connectionPromise ??= connectDB();
    await connectionPromise;
    return app(req, res);
  } catch (error) {
    connectionPromise = undefined;
    console.error("Database connection failed:", error);
    return res.status(500).json({
      message: "Database connection failed",
    });
  }
}
