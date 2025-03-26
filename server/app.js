const express = require("express");
const mongoose = require("mongoose");
const config = require("config");
const cors = require("cors");
const path = require("path");
const connectDB = require("./utils/db");

// routes import

const journalRoutes = require("./routes/journalRoutes");
const userRoutes = require("./routes/userRoutes");
const wishingWellPostRoutes = require("./routes/wishingWellPostRoutes");
const wishingWellCommentRoutes = require("./routes/wishingWellCommentRoutes");

// Configure CORS options
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? [process.env.FRONTEND_URL || "https://yourproductionsite.com"]
      : ["http://localhost:5173"], // Allow your frontend dev server
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Allow cookies if using sessions
};

// create express app
const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "../client/build")));

// routes
// app.use("/api/auth", authRoutes);
app.use("/api/journals", journalRoutes);
// app.use("/api/wishingwell", wishingwellRoutes);
app.use("/api/users", userRoutes);
app.use("/api/wishing-well/posts", wishingWellPostRoutes);
app.use("/api/wishing-well/comments", wishingWellCommentRoutes);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});
const fs = require("fs");
console.log("Current directory:", __dirname);
console.log("Directory contents:", fs.readdirSync(__dirname));

// 如果build目录应该存在，检查它
try {
  console.log(
    "Build directory contents:",
    fs.readdirSync(path.join(__dirname, "build"))
  );
} catch (err) {
  console.log("Error reading build directory:", err.message);
}

connectDB();

module.exports = app;
