const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");

// Public routes
router.post("/register", userController.register);
router.post("/login", userController.login);

// Protected routes - require authentication
// router.get("/profile", auth, userController.getProfile);
// router.put("/profile", auth, userController.updateProfile);
// router.post("/friend-request", auth, userController.handleFriendRequest);

// Admin routes
// 如果需要管理员特定的路由，可以添加额外的权限中间件
// router.get("/all", [auth, admin], userController.getAllUsers);

module.exports = router;
