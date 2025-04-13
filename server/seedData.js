const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { initPinecone } = require("./services/vectorService");
require("dotenv").config();

async function getEmbedding(text) {
  const response = await axios.post(
    "https://api.openai.com/v1/embeddings",
    {
      input: text,
      model: "text-embedding-ada-002"
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      }
    }
  );

  return response.data.data[0].embedding;
}

async function uploadChunks() {
  const index = await initPinecone();

  const filePath = path.join(__dirname, "rag_data", "cbt_examples.json");
  const chunks = JSON.parse(fs.readFileSync(filePath, "utf8"));

  for (const chunk of chunks) {
    const embedding = await getEmbedding(chunk.text);
    await index.upsert({
      upsertRequest: {
        vectors: [
          {
            id: chunk.id,
            values: embedding,
            metadata: { text: chunk.text },
          },
        ],
      },
    });
    console.log(`✅ Uploaded: ${chunk.id}`);
  }

  console.log("✅ All chunks uploaded to Pinecone.");
}

uploadChunks().catch(console.error);
