const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const { check, validationResult } = require("express-validator");
const auth = require("../middleware/auth");

// Validation middleware (optional for POSTs)
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
router.post("/", auth, validateRequest, chatController.chatMessage);

/**
 * @route   POST /api/chat/save
 * @desc    Save a full chat
 * @access  Private
 */
router.post("/save", auth, chatController.saveChat);

/**
 * @route   GET /api/chat/user/:userId
 * @desc    Get all chats for a specific user
 * @access  Private
 */
router.get("/user/:userId", auth, chatController.getChats);

/**
 * @route   GET /api/chat/:id
 * @desc    Get a single chat by ID
 * @access  Private
 */
router.get("/:id", auth, chatController.getChatById);

module.exports = router;
