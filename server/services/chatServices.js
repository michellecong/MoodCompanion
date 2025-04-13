// services/chatServices.js (ESM version)

import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

import { retrieveContext } from "./retrievalService.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

export default chatServices;
