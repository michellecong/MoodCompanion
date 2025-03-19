const express = require("express");
const mongoose = require("mongoose");
const config = require("config");
const cors = require("cors");
const path = require("path");
const connectDB = require("./utils/db");

// routes import
// const authRoutes = require("./middleware/auth");
const journalRoutes = require("./routes/journalRoutes");
// const wishingwellRoutes = require("./routes/wishingwell");
const userRoutes = require("./routes/userRoutes");

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

connectDB();

module.exports = app;
