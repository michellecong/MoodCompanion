const Chat = require("../models/chatModel");
const User = require("../models/userModel");
const chatServices = require("../services/chatServices");

/**
 * Chat controller for handling chat-related operations
 */
const chatController = {
  /**
   * Send a message to the AI model
   */
  async chatMessage(req, res) {
    try {
      const { message } = req.body;

      if (!message || message.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Message is required",
        });
      }

      const aiResponse = await chatServices.getAIResponse(message);

      res.status(200).json({
        success: true,
        reply: aiResponse,
      });
    } catch (error) {
      console.error("Error in chatMessage:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get AI response",
        error: error.message,
      });
    }
  },

  /**
   * Save a complete chat
   */
  async saveChat(req, res) {
    console.log("🔵 saveChat endpoint hit");
    try {
      const { messages } = req.body;
      const userId = req.user.id;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Chat messages are required",
        });
      }

      const now = new Date();
      const title = now.toLocaleString(); // or derive from first message

      const newChat = new Chat({
        userId,
        title,
        messages,
      });

      await newChat.save();
      console.log("Chat saved:", newChat);

      // Optionally link chat to User model
      await User.findByIdAndUpdate(userId, {
        $push: { chats: newChat._id },
      });

      res.status(201).json({
        success: true,
        data: newChat,
      });
    } catch (error) {
      console.error("Error saving chat:", error);
      res.status(500).json({
        success: false,
        message: "Failed to save chat",
        error: error.message,
      });
    }
  },

  /**
   * Get all saved chats for the authenticated user
   */
  async getUserChats(req, res) {
    try {
      const userId = req.user.id;

      const chats = await Chat.find({ userId }).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        count: chats.length,
        data: chats,
      });
    } catch (error) {
      console.error("Error fetching chats:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch chats",
        error: error.message,
      });
    }
  },

  /**
   * Get a single chat by ID
   */
  async getChatById(req, res) {
    try {
      const chatId = req.params.id;
      const userId = req.user.id;

      const chat = await Chat.findById(chatId);

      if (!chat) {
        return res.status(404).json({
          success: false,
          message: "Chat not found",
        });
      }

      if (chat.userId.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to access this chat",
        });
      }

      res.status(200).json({
        success: true,
        data: chat,
      });
    } catch (error) {
      console.error("Error fetching chat by ID:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch chat",
        error: error.message,
      });
    }
  },

  /**
   * Delete a chat
   */
  async deleteChat(req, res) {
    try {
      const chatId = req.params.id;
      const userId = req.user.id;

      const chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({
          success: false,
          message: "Chat not found",
        });
      }

      if (chat.userId.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to delete this chat",
        });
      }

      await Chat.findByIdAndDelete(chatId);

      // Optionally remove from user reference
      await User.findByIdAndUpdate(userId, {
        $pull: { chats: chatId },
      });

      res.status(200).json({
        success: true,
        message: "Chat deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting chat:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete chat",
        error: error.message,
      });
    }
  },
};

module.exports = chatController;
