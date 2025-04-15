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
        // { role: "system", content: "You are a mental health specialist. Use the following context to support the user. The goal is to give user feedback on their thinking patterns only if there are examples of disorted thinking patterns in their message" },
        // { role: "user", content: `User message: ${message}\n\nContext:\n${context}` },
        {
          "role": "system",
          "content": "You are a classifier that decides if a user's message contains cognitive distortions. Respond with 'Yes' or 'No' and the type of distorted thinking."
        },
        {
          "role": "user",
          "content": `User message: ${message}\n\n`
        }
      ],
      max_tokens: 200,
    });

    return response.choices[0].message.content;
  },
};

export default chatServices;
