import { Pinecone } from "@pinecone-database/pinecone";
import { error } from "console";
import dotenv from "dotenv";
dotenv.config();

export const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY as string,
});

export const initializePinecone = async ()=> {
  try {
    console.log(process.env.PINECONE_API_KEY);
    if (!process.env.PINECONE_API_KEY) {
      console.error("Missing PINECONE_API_KEY in .env", error);
    }
    const indexName = "quickstart";

    // Check if index exists
    const indexes = (await pc.listIndexes()).indexes as { name: string }[];
const indexNames = indexes.map((index) => index.name);
    if (!indexNames.includes(indexName)) {
      await pc.createIndex({
        name: indexName,
        dimension: 768, // Replace with correct model dimensions
        metric: "cosine",
        spec: {
          serverless: {
            cloud: "aws",
            region: "us-east-1",
          },
        },
      });
      console.log("Index created successfully!");
    } else {
      console.log(`Index "${indexName}" already exists. Skipping creation.`);
    }
  } catch (error) {
    console.error("Error creating index:", error);
  }
}
