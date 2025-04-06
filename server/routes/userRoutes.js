const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const { validateRequest } = require("../middleware/validators");
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  sendFriendRequest,
  handleFriendRequest,
} = require("../controllers/userController");
const auth = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
// 配置 multer 存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // 确保这个目录存在
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "avatar-" + uniqueSuffix + ext);
  },
});

// 文件过滤器 - 只允许图片
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("只允许上传图片文件"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB 限制
});

// Multer 错误处理中间件
const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "文件大小超出限制，最大 2MB",
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message || "上传文件时出错",
    });
  } else if (err) {
    // 处理文件过滤器抛出的错误
    return res.status(400).json({
      success: false,
      message: err.message || "上传文件时出错",
    });
  }
  next(); // 如果没有错误，继续执行后续中间件
};

// 文件上传处理
const handleFileUpload = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "没有上传文件",
      });
    }

    // 返回文件路径（相对于服务器根目录）
    const filePath = `/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      filePath: filePath,
      message: "文件上传成功",
    });
  } catch (error) {
    console.error("文件上传错误:", error);
    res.status(500).json({
      success: false,
      message: "文件上传失败",
      error: error.message,
    });
  }
};

router.post(
  "/upload",
  auth,
  upload.single("file"),
  multerErrorHandler,
  handleFileUpload
);

// Public routes
router.post(
  "/register",
  [
    check("password", "password is required").not().isEmpty(),
    check("password", "password must be at least 6 characters").isLength({
      min: 6,
    }),
  ],
  validateRequest,
  register
);

// login route
router.post("/login", login);

/**
 * @route   GET api/users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get("/profile", auth, getProfile);

/**
 * @route   PUT api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  "/profile",
  auth,
  [
    check("username", "Username must be between 3 and 30 characters")
      .optional()
      .isLength({ min: 3, max: 30 }),
    check("email", "Please include a valid email").optional().isEmail(),
  ],
  validateRequest,
  updateProfile
);

/**
 * @route   PUT api/users/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put(
  "/change-password",
  auth,
  [
    check("currentPassword", "Current password is required").not().isEmpty(),
    check("newPassword", "New password must be at least 6 characters").isLength(
      { min: 6 }
    ),
  ],
  validateRequest,
  changePassword
);

/**
 * @route   DELETE api/users/account
 * @desc    Delete user account
 * @access  Private
 */
router.delete(
  "/account",
  auth,
  [check("password", "Password is required").exists()],
  validateRequest,
  deleteAccount
);

/**
 * @route   POST api/users/friend-request
 * @desc    Send a friend request
 * @access  Private
 */
router.post(
  "/friend-request",
  auth,
  [check("toUserId", "User ID to send request to is required").not().isEmpty()],
  validateRequest,
  sendFriendRequest
);

/**
 * @route   PUT api/users/friend-request
 * @desc    Handle (accept/reject) a friend request
 * @access  Private
 */
router.put(
  "/friend-request",
  auth,
  [
    check("requestId", "Request ID is required").not().isEmpty(),
    check("action", "Action must be 'accept' or 'reject'").isIn([
      "accept",
      "reject",
    ]),
  ],
  validateRequest,
  handleFriendRequest
);

module.exports = router;
