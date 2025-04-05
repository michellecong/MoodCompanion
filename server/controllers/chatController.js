const chatServices = require("../services/chatServices");

const chatController = {
  // Handle chat messages to the AI
  async chatMessage(req, res) {
    try {
      const { message } = req.body;
      const aiResponse = await chatServices.getAIResponse(message);
      res.status(200).json({ reply: aiResponse });
    } catch (error) {
      console.error("Error in chatMessage:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Save a complete chat to MongoDB
  async saveChat(req, res) {
    try {
      const { messages } = req.body;
      const userId = req.user?.id || req.body.userId; // assuming JWT auth or manual pass

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "No messages provided" });
      }

      const savedChat = await chatServices.saveChat({ userId, messages });
      res.status(201).json(savedChat);
    } catch (error) {
      console.error("Error in saveChat:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Get all chats for a user
  async getChats(req, res) {
    try {
      const userId = req.user?.id || req.params.userId;
      const chats = await chatServices.getUserChats(userId);
      res.status(200).json(chats);
    } catch (error) {
      console.error("Error in getChats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Get a specific chat by ID
  async getChatById(req, res) {
    try {
      const chat = await chatServices.getChatById(req.params.id);
      if (!chat) return res.status(404).json({ error: "Chat not found" });
      res.status(200).json(chat);
    } catch (error) {
      console.error("Error in getChatById:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = chatController;
