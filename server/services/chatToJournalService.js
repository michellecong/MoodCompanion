const OpenAI = require("openai");
const dotenv = require("dotenv");
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const generateJournalFromMessages = async (userMessagesText) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: "system",
        content: "You are a journaling assistant. Turn reflective messages into a cohesive journal entry."
      },
      {
        role: "user",
        content: userMessagesText
      }
    ]
  });

  return response.choices[0].message.content;
};

module.exports = {
  generateJournalFromMessages,
};
