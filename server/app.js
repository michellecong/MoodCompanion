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

const fs = require("fs");

console.log("Current directory:", __dirname);
console.log("Directory contents:", fs.readdirSync(__dirname));

// 检查上一级目录
console.log("Parent directory:", path.join(__dirname, ".."));
try {
  console.log(
    "Parent directory contents:",
    fs.readdirSync(path.join(__dirname, ".."))
  );
} catch (err) {
  console.log("Error reading parent directory:", err.message);
}

// 检查client目录是否存在
try {
  console.log(
    "Client directory exists:",
    fs.existsSync(path.join(__dirname, "../client"))
  );
  if (fs.existsSync(path.join(__dirname, "../client"))) {
    console.log(
      "Client directory contents:",
      fs.readdirSync(path.join(__dirname, "../client"))
    );

    // 检查client/build目录
    console.log(
      "Client build directory exists:",
      fs.existsSync(path.join(__dirname, "../client/build"))
    );
    if (fs.existsSync(path.join(__dirname, "../client/build"))) {
      console.log(
        "Client build directory contents:",
        fs.readdirSync(path.join(__dirname, "../client/build"))
      );
    }
  }
} catch (err) {
  console.log("Error checking client directory:", err.message);
}

app.get("*", (req, res) => {
  const indexPath = path.join(__dirname, "../client/build", "index.html");
  console.log("Trying to serve:", indexPath);
  console.log("File exists:", fs.existsSync(indexPath));

  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res
      .status(404)
      .send("Frontend build not found. Please check deployment configuration.");
  }
});

connectDB();

module.exports = app;
