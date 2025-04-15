// server/app.js (ESM version)

import express from "express";
import mongoose from "mongoose";
import config from "config";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import auth from "./middleware/auth.js";

import connectDB from "./utils/db.js";

// routes import
import journalRoutes from "./routes/journalRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import wishingWellPostRoutes from "./routes/wishingWellPostRoutes.js";
import wishingWellCommentRoutes from "./routes/wishingWellCommentRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? [process.env.FRONTEND_URL || "https://moodcompanion.onrender.com"]
      : ["http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "../client/build")));

app.use("/api/journals", auth, journalRoutes);
app.use("/api/users", userRoutes);
app.use("/api/wishing-well/posts", wishingWellPostRoutes);
app.use("/api/wishing-well/comments", wishingWellCommentRoutes);
app.use("/api/chat", chatRoutes);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

connectDB();

export default app;
