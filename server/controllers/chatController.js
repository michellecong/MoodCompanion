const chatContoller = {
    /* sends a message to the AI model and returns the response */
    async sendChatMessage(req, res) {
        try {
            const { message } = req.body;

            // Simulate a response from the AI model
            const aiResponse = `AI response to: ${message}`;

            res.status(200).json({ reply: aiResponse });
        } catch (error) {
            console.error("Error in chat controller:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
}