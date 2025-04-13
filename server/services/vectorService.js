// Manages storage and retrieval from Pinecone vector database.
// This code initializes the Pinecone client and 
// queries the vector database for similar chunks based on the provided vector. 
// It uses the PineconeClient from the @pinecone-database/pinecone package to interact with the Pinecone service.
const { PineconeClient } = require("@pinecone-database/pinecone");
const client = new PineconeClient();

async function initPinecone() {
  await client.init({
    apiKey: process.env.PINECONE_API_KEY,
    environment: "us-west1-gcp",
  });
  return client.Index("mental-health-companion");
}

async function querySimilarChunks(vector, topK = 5) {
  const index = await initPinecone();
  const response = await index.query({
    queryRequest: { vector, topK, includeMetadata: true },
  });
  return response.matches;
}

module.exports = { initPinecone, querySimilarChunks };

