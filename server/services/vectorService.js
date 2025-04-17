// services/vectorService.js (for Pinecone SDK v5.1.1 and ESM)

const { Pinecone } = require("@pinecone-database/pinecone");
require("dotenv").config();


// ✅ Create Pinecone client with API key
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

// ✅ Connect to your index directly (no init required)
const index = pinecone.index("mental-health-companion");

async function querySimilarChunks(vector, topK = 5) {
  const response = await index.query({
    vector,
    topK,
    includeMetadata: true,
  });
  return response.matches;
}

module.exports = {
  querySimilarChunks,
};