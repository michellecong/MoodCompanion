// routes/userRoutes.js (ESM version)

import express from "express";
const router = express.Router();
import { check } from "express-validator";
import { validateRequest } from "../middleware/validators.js";
import userController from "../controllers/userController.js";
import auth from "../middleware/auth.js";
import multer from "multer";
import path from "path";
import cloudinary from "../utils/cloudinary.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "avatars",
    allowed_formats: ["jpg", "jpeg", "png", "gif"],
    transformation: [{ width: 200, height: 200, crop: "limit" }],
  },
});

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
  limits: { fileSize: 2 * 1024 * 1024 },
});

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
    return res.status(400).json({
      success: false,
      message: err.message || "error uploading file",
    });
  }
  next();
};

const handleFileUpload = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }
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

router.post(
  "/register",
  [
    check("password", "password is required").not().isEmpty(),
    check("password", "password must be at least 6 characters").isLength({
      min: 6,
    }),
  ],
  validateRequest,
  userController.register
);

router.post("/login", userController.login);

router.get("/profile", auth, userController.getProfile);

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
  userController.updateProfile
);

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
  userController.changePassword
);

router.delete(
  "/account",
  auth,
  [check("password", "Password is required").exists()],
  validateRequest,
  userController.deleteAccount
);

router.post(
  "/friend-request",
  auth,
  [check("toUserId", "User ID to send request to is required").not().isEmpty()],
  validateRequest,
  userController.sendFriendRequest
);

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
  userController.handleFriendRequest
);
// Auth0用户同步端点
router.post("/auth0-sync", userController.syncAuth0User);

export default router;
