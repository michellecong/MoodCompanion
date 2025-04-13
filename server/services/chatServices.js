const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const { retrieveContext } = require("./retrievalService");

const chatServices = {
  async getAIResponse(message) {
    const context = await retrieveContext(message);
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a mental health specialist. Use the following context to support the user." },
        { role: "user", content: `User message: ${message}\n\nContext:\n${context}` },
      ],
      max_tokens: 200,
    });

    return response.choices[0].message.content;
  },
};

module.exports = chatServices;
