const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");

// POST /api/chat — send message to AI
router.post("/", chatController.chatMessage);

// POST /api/chat/save — save full chat
router.post("/save", chatController.saveChat);

// GET /api/chat/user/:userId — get all chats for user
router.get("/user/:userId", chatController.getChats);

// GET /api/chat/:id — get a single chat
router.get("/:id", chatController.getChatById);

module.exports = router;
