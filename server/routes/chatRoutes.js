const express = require("express");
const router = express.Router();
const {
  chatMessage,
  saveChat,
  getChatById,
} = require("../controllers/chatController");

router.post("/", chatMessage);
router.post("/save", saveChat);
router.get("/:id", getChatById);

module.exports = router;
