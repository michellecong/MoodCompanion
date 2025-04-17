// services/retrievalService.js (ESM version)

const { getEmbedding } = require("./embedService");
require("dotenv").config();
const { querySimilarChunks } = require("./vectorService");


async function retrieveContext(userMessage) {
  const vector = await getEmbedding(userMessage); // Embed user message
  const matches = await querySimilarChunks(vector); // Query Pinecone for similar chunks
  return matches.map(match => match.metadata.text).join("\n\n");
}

module.exports = {
  retrieveContext,
};
