import fs from "fs";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { Pinecone } from "@pinecone-database/pinecone";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ✅ Create Pinecone client
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pinecone.index("mental-health-companion");

// ✅ Get OpenAI embedding
async function getEmbedding(text) {
  const response = await axios.post(
    "https://api.openai.com/v1/embeddings",
    {
      input: text,
      model: "text-embedding-ada-002",
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    }
  );

  return response.data.data[0].embedding;
}

// ✅ Upload all chunks to Pinecone
async function uploadChunks() {
  const filePath = path.join(__dirname, "rag_data", "cbt_examples.json");
  const chunks = JSON.parse(fs.readFileSync(filePath, "utf8"));

  const vectors = [];

  for (const chunk of chunks) {
    const embedding = await getEmbedding(chunk.text);
    vectors.push({
      id: chunk.id,
      values: embedding,
      metadata: { text: chunk.text },
    });
    console.log(`🧠 Prepared: ${chunk.id}`);
  }

  await index.upsert(vectors);
  console.log("✅ All chunks uploaded to Pinecone.");
}

uploadChunks().catch(console.error);
