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
const cloudinary = require("../utils/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
// use multer-storage-cloudinary to store images in Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "avatars",
    allowed_formats: ["jpg", "jpeg", "png", "gif"],
    transformation: [{ width: 200, height: 200, crop: "limit" }],
  },
});

// File filter - only allowing images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("only image allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
});

// Multer error handling middleware
const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "the size is greater than 2MB",
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
  next(); // If no error, continue to next middleware
};

// File upload handling
const handleFileUpload = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Return the secure URL from Cloudinary
    const imageUrl = req.file.path;

    res.status(200).json({
      success: true,
      filePath: imageUrl,
      message: "File uploaded successfully",
    });
  } catch (error) {
    console.error("Error uploading file", error);
    res.status(500).json({
      success: false,
      message: "Error uploading file",
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
