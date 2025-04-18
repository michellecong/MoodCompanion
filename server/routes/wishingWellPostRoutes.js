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
  checkFollowStatus,
} = require("../controllers/wishingWellPostController");
const auth = require("../middleware/auth");
const { check, validationResult } = require("express-validator");
const { validateRequest } = require("../middleware/validators");
const multer = require("multer");
const path = require("path");
const cloudinary = require("../utils/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const wishingWellPostController = require("../controllers/wishingWellPostController");

// use multer-storage-cloudinary to store images in Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "wishing-well", // upload folder name
    allowed_formats: ["jpg", "jpeg", "png", "gif"],
    transformation: [{ width: 1000, height: 1000, crop: "limit" }], // limit the size
  },
});

// File filter - only allowing images
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Multer error handling middleware
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
    // Handle file filter errors
    return res.status(400).json({
      success: false,
      message: err.message || "error uploading file",
    });
  }
  next(); // go to the next middleware
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
  multerErrorHandler, // handle multer errors
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

/**
 * @route   GET api/wishing-well/posts/:id/upvote-status
 * @desc    Check if the user has upvoted a post
 * @access  Private
 */
router.get(
  "/:id/upvote-status",
  auth,
  wishingWellPostController.checkUpvoteStatus
);

/**
 * @route   PUT api/wishing-well/posts/:id/remove-upvote
 * @desc    Remove upvote from a post
 * @access  Private
 */
router.put("/:id/remove-upvote", auth, wishingWellPostController.removeUpvote);
/**
 * @route   GET api/wishing-well/posts/:id/follow-status
 * @desc    Check if the user has followed a post
 * @access  Private
 */
router.get(
  "/:id/follow-status",
  auth,
  wishingWellPostController.checkFollowStatus
);
module.exports = router;
