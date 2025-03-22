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

// create express app
const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// routes
// app.use("/api/auth", authRoutes);
app.use("/api/journals", journalRoutes);
// app.use("/api/wishingwell", wishingwellRoutes);
app.use("/api/users", userRoutes);
app.use("/api/wishing-well/posts", wishingWellPostRoutes);
app.use("/api/wishing-well/comments", wishingWellCommentRoutes);

connectDB();

module.exports = app;
