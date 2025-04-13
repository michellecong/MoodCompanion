// services/vectorService.js (for Pinecone SDK v5.1.1 and ESM)

import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";
dotenv.config();

// ✅ Create Pinecone client with API key
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

// ✅ Connect to your index directly (no init required)
const index = pinecone.index("mental-health-companion-zy5p830");

async function querySimilarChunks(vector, topK = 5) {
  const response = await index.query({
    vector,
    topK,
    includeMetadata: true,
  });
  return response.matches;
}

export { querySimilarChunks };
