const Journal = require("../models/journalModel");
// const emotionService = require("../services/emotionService");

/**
 * Journal controller for handling journal-related operations
 */
const journalController = {
  /**
   * Create a new journal entry with emotion detection
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createJournal(req, res) {
    try {
      const { title, content } = req.body;
      const userId = req.user.id;

      // Validate input
      if (!title || !content) {
        return res.status(400).json({ message: "标题和内容不能为空" });
      }

      // Detect emotions in the journal content
      // const emotionsDetected = await emotionService.detectEmotions(content);
      const emotionsDetected = [
        { name: "joy", score: 0.8 },
        { name: "sadness", score: 0.2 },
      ];

      // Generate personalized feedback based on detected emotions
      // const feedback = emotionService.generateFeedback(emotionsDetected);
      const feedback = "这是一条测试反馈";

      // Create new journal entry
      const newJournal = new Journal({
        userId,
        title,
        content,
        emotionsDetected,
        feedback,
      });

      await newJournal.save();

      res.status(201).json({
        success: true,
        data: newJournal,
      });
    } catch (error) {
      console.error("Error creating journal:", error);
      res.status(500).json({
        success: false,
        message: "创建日记失败",
        error: error.message,
      });
    }
  },
};

module.exports = journalController;
