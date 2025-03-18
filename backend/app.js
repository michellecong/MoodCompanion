const express = require("express");
const mongoose = require("mongoose");
const config = require("config");
const cors = require("cors");
const path = require("path");
const connectDB = require("./utils/db");

// 路由导入
// const authRoutes = require("./middleware/auth");
const journalRoutes = require("./routes/journalRoutes");
// const wishingwellRoutes = require("./routes/wishingwell");
// const userRoutes = require("./routes/users");

// 创建 Express 应用
const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 路由
// app.use("/api/auth", authRoutes);
app.use("/api/journals", journalRoutes);
// app.use("/api/wishingwell", wishingwellRoutes);
// app.use("/api/users", userRoutes);

// 数据库连接
connectDB();

// 导出应用实例
module.exports = app;
