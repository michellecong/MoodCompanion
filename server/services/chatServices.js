const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, 
});

const chatServices = {
    async getAIResponse(message) {
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo", // Change model if needed
                messages: [{ role: "user", content: message }],
                max_tokens: 100,
            });

            return response.choices[0].message.content;
        } catch (error) {
            console.error("Error generating AI response:", error);
            throw new Error("Failed to fetch response from AI.");
        }
    }
};

module.exports = chatServices;
