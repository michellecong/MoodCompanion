// services/chatServices.js (ESM version)
const OpenAI = require("openai");
const dotenv = require("dotenv");
dotenv.config();

const { retrieveContext } = require("./retrievalService");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const chatServices = {
  async getAIResponse(message) {
    const context = await retrieveContext(message);
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a mental health specialist. Use the following context to support the user. The goal is to give user feedback on their thinking patterns only if there are examples of disorted thinking patterns in their message" },
        { role: "user", content: `User message: ${message}\n\nContext:\n${context}` },
      ],
      max_tokens: 200,
    });

    return response.choices[0].message.content;
  },
};

module.exports = chatServices;
