import express from "express";
const router = express.Router();
import wishingWellPostController from "../controllers/wishingWellPostController.js";

import auth from "../middleware/auth.js";
import { check, validationResult } from "express-validator";

import { validateRequest } from "../middleware/validators.js";
import multer from "multer";
import path from "path";
import cloudinary from "../utils/cloudinary.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";

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
  (req, res, next) => {
    console.log("Auth middleware passed, proceeding to multer...");
    console.log("Request headers:", req.headers);
    next();
  },
  upload.single("image"),
  multerErrorHandler, // handle multer errors

  [
    check("content", "Content cannot be empty").not().isEmpty(),
    check("content", "Content is too long").isLength({ max: 1000 }),
  ],
  validateRequest,
  wishingWellPostController.createPost
);

/**
 * @route   GET api/wishing-well/posts
 * @desc    Get recent posts (optionally filtered by tag)
 * @access  Public
 */
router.get("/", wishingWellPostController.getRecentPosts);

/**
 * @route   GET api/wishing-well/posts/user
 * @desc    Get user's own posts
 * @access  Private
 */
router.get("/me", auth, wishingWellPostController.getUserPosts);
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
router.get("/followed", auth, wishingWellPostController.getFollowedPosts);

router.get("/:id", wishingWellPostController.getPostById);

/**
 * @route   PUT api/wishing-well/posts/:id/upvote
 * @desc    Upvote a post
 * @access  Private
 */
router.put("/:id/upvote", auth, wishingWellPostController.upvotePost);

/**
 * @route   PUT api/wishing-well/posts/:id/follow
 * @desc    Follow a post
 * @access  Private
 */
router.put("/:id/follow", auth, wishingWellPostController.followPost);
/**
 * @route   PUT api/wishing-well/posts/:id/unfollow
 * @desc    Unfollow a post
 * @access  Private
 */
router.put("/:id/unfollow", auth, wishingWellPostController.unfollowPost);

/**
 * @route   DELETE api/wishing-well/posts/:id
 * @desc    Delete a post
 * @access  Private
 */
router.delete("/:id", auth, wishingWellPostController.deletePost);

export default router;
