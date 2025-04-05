const express = require("express");
const router = express.Router();
const { chatMessage } = require("../controllers/chatController");

// Optional: you can remove validation while testing
// const { check, validationResult } = require("express-validator");

router.post("/", chatMessage);

module.exports = router;
