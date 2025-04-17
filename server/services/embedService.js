// services/embedService.js (ESM version)
const axios = require("axios"); // ✅ CommonJS

async function getEmbedding(text) {
  const response = await axios.post(
    "https://api.openai.com/v1/embeddings",
    {
      input: text,
      model: "text-embedding-ada-002",
    },
    {
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    }
  );
  return response.data.data[0].embedding;
}

module.exports = {
  getEmbedding,
};
