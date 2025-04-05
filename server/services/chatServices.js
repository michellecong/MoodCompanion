// services/chatServices.js
const Chat = require("../models/chatModel");
const { getAIResponseFromOpenAI } = require("./openaiService"); // You probably have this

const chatServices = {
  async getAIResponse(message) {
    return await getAIResponseFromOpenAI(message); // your LLM logic here
  },

  async saveChat({ userId, messages }) {
    const now = new Date();
    const title = now.toLocaleString(); // or customize

    const newChat = new Chat({ userId, title, messages });
    return await newChat.save();
  },

  async getUserChats(userId) {
    return await Chat.find({ userId }).sort({ createdAt: -1 });
  },

  async getChatById(chatId) {
    return await Chat.findById(chatId);
  },
};

module.exports = chatServices;
