const express = require("express");
const router = express.Router();
const {
  createJournal,
  getUserJournals,
} = require("../controllers/journalController");
const { check, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
/**
 * @route   POST api/journals
 */

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * @route   POST api/journals
 * @desc    create a journal
 * @access  Private
 */
router.post(
  "/",

  auth,

  // check("title", "title can not be empty").not().isEmpty(),
  // check("content", "content can not be empty").not().isEmpty(),

  validateRequest,
  createJournal
);

/**
 * @route   GET api/journals
 * @desc    Get all journals for the authenticated user
 * @access  Private
 */
router.get("/", auth, getUserJournals);

module.exports = router;
