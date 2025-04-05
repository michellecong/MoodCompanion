const express = require("express");
const router = express.Router();
const {
  chatMessage,
  saveChat,
  getUserChats,
  getChatById,
} = require("../controllers/chatController");
const { validationResult } = require("express-validator");
const auth = require("../middleware/auth");

// Optional validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// === Routes ===

/**
 * @route   POST /api/chat
 * @desc    Send a chat message
 * @access  Private
 */
router.post("/", auth, validateRequest, chatMessage);

/**
 * @route   POST /api/chat/save
 * @desc    Save a full chat
 * @access  Private
 */
router.post("/save", auth, validateRequest, saveChat);

/**
 * @route   GET /api/chat/user/:userId
 * @desc    Get all chats for a specific user
 * @access  Private
 */
router.get("/user/:userId", auth, validateRequest, getUserChats);

/**
 * @route   GET /api/chat/:id
 * @desc    Get a single chat by ID
 * @access  Private
 */
router.get("/:id", auth, validateRequest, getChatById);

module.exports = router;
