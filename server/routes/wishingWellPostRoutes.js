const express = require("express");
const router = express.Router();
const {
  createPost,
  getRecentPosts,
  getPostById,
  getUserPosts,
  upvotePost,
  followPost,
  unfollowPost,
  deletePost,
  getFollowedPosts,
} = require("../controllers/wishingWellPostController");
const auth = require("../middleware/auth");
const { check, validationResult } = require("express-validator");
const { validateRequest } = require("../middleware/validators");
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
    cb(null, uniqueSuffix + ext);
  },
});

// 文件过滤器 - 只允许图片
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 限制
});

// Multer 错误处理中间件
const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "file size is too large, max 5MB",
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message || "error uploading file",
    });
  } else if (err) {
    // 处理文件过滤器抛出的错误
    return res.status(400).json({
      success: false,
      message: err.message || "error uploading file",
    });
  }
  next(); // 如果没有错误，继续执行后续中间件
};

/**
 * @route   POST api/wishing-well/posts
 * @desc    Create a new post
 * @access  Private
 */
router.post(
  "/",
  auth,
  upload.single("image"),
  multerErrorHandler, // 添加 multer 中间件处理图片上传
  [
    check("content", "Content cannot be empty").not().isEmpty(),
    check("content", "Content is too long").isLength({ max: 1000 }),
  ],
  validateRequest,
  createPost
);

/**
 * @route   GET api/wishing-well/posts
 * @desc    Get recent posts (optionally filtered by tag)
 * @access  Public
 */
router.get("/", getRecentPosts);

/**
 * @route   GET api/wishing-well/posts/user
 * @desc    Get user's own posts
 * @access  Private
 */
router.get("/me", auth, getUserPosts);
/**
 * @route   GET api/wishing-well/posts/:id
 * @desc    Get a post by ID with its comments
 * @access  Public
 */

/**
 * @route   GET api/wishing-well/posts/followed
 * @desc    Get posts followed by the user
 * @access  Private
 */
router.get("/followed", auth, getFollowedPosts);

router.get("/:id", getPostById);

/**
 * @route   PUT api/wishing-well/posts/:id/upvote
 * @desc    Upvote a post
 * @access  Private
 */
router.put("/:id/upvote", auth, upvotePost);

/**
 * @route   PUT api/wishing-well/posts/:id/follow
 * @desc    Follow a post
 * @access  Private
 */
router.put("/:id/follow", auth, followPost);
/**
 * @route   PUT api/wishing-well/posts/:id/unfollow
 * @desc    Unfollow a post
 * @access  Private
 */
router.put("/:id/unfollow", auth, unfollowPost);

/**
 * @route   DELETE api/wishing-well/posts/:id
 * @desc    Delete a post
 * @access  Private
 */
router.delete("/:id", auth, deletePost);

module.exports = router;
