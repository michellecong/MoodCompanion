const express = require("express");
const router = express.Router();
const journalController = require("../controllers/journalController");
const { check, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
/**
 * 验证请求中间件
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
 * @desc    创建新日记
 * @access  Private
 */
router.post(
  "/",

  auth,

  // check("title", "标题不能为空").not().isEmpty(),
  // check("content", "内容不能为空").not().isEmpty(),

  validateRequest,
  journalController.createJournal
);

/**
 * @route   GET api/journals
 * @desc    获取用户的所有日记
 * @access  Private
 */
// router.get("/", auth, journalController.getJournals);

/**
 * @route   GET api/journals/:id
 * @desc    获取单个日记详情
 * @access  Private
 */
// router.get("/:id", auth, journalController.getJournalById);

/**
 * @route   PUT api/journals/:id
 * @desc    更新日记
 * @access  Private
 */
// router.put(
//   "/:id",
//   [
//     auth,
//     [
//       check("title", "标题不能为空").optional().notEmpty(),
//       check("content", "内容不能为空").optional().notEmpty(),
//     ],
//     validateRequest,
//   ],
//   journalController.updateJournal
// );

/**
 * @route   DELETE api/journals/:id
 * @desc    删除日记
 * @access  Private
 */
// router.delete("/:id", auth, journalController.deleteJournal);

/**
 * @route   GET api/journals/stats/emotions
 * @desc    获取情绪统计数据
 * @access  Private
 */
// router.get("/stats/emotions", auth, journalController.getEmotionStats);

module.exports = router;
