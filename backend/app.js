const express = require("express");
const mongoose = require("mongoose");
const config = require("config");
const cors = require("cors");
const path = require("path");

// 路由导入
const authRoutes = require("./routes/auth");
const journalRoutes = require("./routes/journals");
const wishingwellRoutes = require("./routes/wishingwell");
const userRoutes = require("./routes/users");

// 创建 Express 应用
const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 路由
app.use("/api/auth", authRoutes);
app.use("/api/journals", journalRoutes);
app.use("/api/wishingwell", wishingwellRoutes);
app.use("/api/users", userRoutes);

// 数据库连接
mongoose
  .connect(config.get("mongoURI"))
  .then(() => console.log("数据库连接成功"))
  .catch((err) => console.error("数据库连接失败:", err));

// 导出应用实例
module.exports = app;
