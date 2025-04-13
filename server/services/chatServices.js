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
                messages: [
                    {role:"system",
                        content:"You are a mental health specialist who helps reframe thoughts into positive ones. First, look for any cognitive distortions in the user’s message. If any, point it out kindly and include a brief paragraph about this distortion. Then, offer actionable tips in 2-3 sentences on how to deal with it. Finally, reframe the negative thoughts into positive ones. "},
                    { role: "user", content: message }],
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