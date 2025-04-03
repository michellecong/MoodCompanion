const chatServices = require('../services/chatServices');
const { check, validationResult } = require("express-validator");

const chatContoller = {
    /* sends a message to the AI model and returns the response */
    async chatMessage(req, res) {
        try {
            const { message } = req.body;

            // Simulate a response from the AI model
            const aiResponse = await chatServices.getAIResponse(message);

            res.status(200).json({ reply: aiResponse });
        } catch (error) {
            console.error("Error in chat controller:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
}

module.exports = chatContoller;