const OpenAI = require("openai");
const dotenv = require("dotenv");
dotenv.config();

const { retrieveContext } = require("./retrievalService");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const chatServices = {
  async getAIResponse(message) {
    // Step 1: Classify if there's distorted thinking
    const classificationResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a classifier that decides if a user's message contains cognitive distortions. Respond with 'Yes' or 'No'. Optionally, include the type of distortion if the answer is Yes.",
        },
        {
          role: "user",
          content: `User message: ${message}`,
        },
      ],
      max_tokens: 50,
    });

    const classification = classificationResponse.choices[0].message.content
      .trim()
      .toLowerCase();

    const hasDistortion = classification.startsWith("yes");

    // Step 2: If distortion is detected, retrieve context and give a distortion-based response
    if (hasDistortion) {
      const context = await retrieveContext(message);

      const responseWithContext = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a mental health specialist. The user message contains cognitive distortions. Use the provided context to help give thoughtful feedback on their thinking patterns.",
          },
          {
            role: "user",
            content: `User message: ${message}\n\nContext:\n${context}`,
          },
        ],
        max_tokens: 200,
      });

      return responseWithContext.choices[0].message.content;
    }

    // Step 3: Otherwise, just respond naturally without context
    const generalResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a supportive mental health companion. Gently acknowledge the user's message and provide a short, thoughtful response.",
        },
        {
          role: "user",
          content: message,
        },
      ],
      max_tokens: 150,
    });

    return generalResponse.choices[0].message.content;
  },
};

module.exports = chatServices;
