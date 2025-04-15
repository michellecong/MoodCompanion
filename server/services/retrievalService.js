// services/retrievalService.js (ESM version)

import { getEmbedding } from "./embedService.js";
import { querySimilarChunks } from "./vectorService.js";

async function retrieveContext(userMessage) {
  const vector = await getEmbedding(userMessage); // Embed user message
  const matches = await querySimilarChunks(vector); // Query Pinecone for similar chunks
  return matches.map(match => match.metadata.text).join("\n\n");
}

export { retrieveContext };
