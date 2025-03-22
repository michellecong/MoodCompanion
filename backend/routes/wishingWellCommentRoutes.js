const express = require("express");
const router = express.Router();
const wishingWellCommentController = require("../controllers/wishingWellCommentController");
const { check, validationResult } = require("express-validator");
const auth = require("../middleware/auth");

router.post("/");

module.exports = router;
