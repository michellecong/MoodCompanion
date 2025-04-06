const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, 
});

const chatServices = {
    async getAIResponse(message) {
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo", 
                messages: [{role:"system",content:"You are a mental health specialist who helps reframe thoughts into positive ones."},{ role: "user", content: message }],
                //Fine-tune the system message as per your requirement
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