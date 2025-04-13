// ✅ This works with Pinecone SDK v0.0.10
const { PineconeClient } = require("@pinecone-database/pinecone");
require("dotenv").config();

// ✅ Correct constructor for v0.0.10
const client = new PineconeClient();

async function initPinecone() {
    console.log("API:", process.env.PINECONE_API_KEY);
    console.log("ENV:", process.env.PINECONE_ENVIRONMENT);

  await client.init({
    apiKey: process.env.PINECONE_API_KEY,
    environment: process.env.PINECONE_ENVIRONMENT, // e.g., "us-west1-gcp"
  });

  return client.Index("mental-health-companion");
}

async function querySimilarChunks(vector, topK = 5) {
  const index = await initPinecone();
  const response = await index.query({
    queryRequest: {
      vector,
      topK,
      includeMetadata: true,
    },
  });
  return response.matches;
}

module.exports = { initPinecone, querySimilarChunks };
