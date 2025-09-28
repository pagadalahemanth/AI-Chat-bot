import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GOOGLE_API_KEY) {
  throw new Error("GOOGLE_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function generateEmbedding(text: string): Promise<number[]> {
  console.log("📝 Generating embedding...");

  try {
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(text);

    if (!result.embedding?.values) {
      throw new Error("No embedding values returned");
    }

    let embedding = result.embedding.values;
    console.log(`📝 Original embedding dimensions: ${embedding.length}`);

    // Convert to 1024 dimensions to match Pinecone index
    if (embedding.length === 768) {
      // Pad with calculated values instead of zeros for better similarity
      const paddedEmbedding = [...embedding];
      const avgValue =
        embedding.reduce((sum, val) => sum + val, 0) / embedding.length;

      while (paddedEmbedding.length < 1024) {
        // Add small variations around the average
        const variation = (Math.random() - 0.5) * 0.1 * avgValue;
        paddedEmbedding.push(avgValue + variation);
      }

      // Renormalize the embedding
      const magnitude = Math.sqrt(
        paddedEmbedding.reduce((sum, val) => sum + val * val, 0)
      );
      embedding = paddedEmbedding.map((val) => val / magnitude);

      console.log(
        `📝 Padded to ${embedding.length} dimensions and renormalized`
      );
    }

    console.log(`✅ Final embedding: ${embedding.length} dimensions`);
    return embedding;
  } catch (error) {
    console.error("❌ Embedding failed:", error);
    throw new Error(
      `Failed to generate embedding: ${
        error instanceof Error ? error.message : "Unknown"
      }`
    );
  }
}

export async function generateChatResponse(
  query: string,
  context: string
): Promise<string> {
  console.log("💬 Generating chat response...");

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    //     const prompt = `You are a helpful AI assistant. Answer the question based on the provided context from the document.

    // Context: ${context}

    // Question: ${query}

    // Please provide a clear, helpful answer based on the information in the context. If the information isn't available in the context, say so politely.`;
    const prompt = `
You are a helpful AI assistant. 
Answer ONLY using the provided context. 
If the user asks for a section like "Education", "Certifications", or "Skills", 
search the context carefully and extract the exact details listed. 
If nothing is present, only then say: "Not found in the document".

Context:
${context}

Question: ${query}

Answer:
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    return response.text() || "Sorry, I could not generate a response.";
  } catch (error) {
    console.error("❌ Chat response failed:", error);
    throw new Error(
      `Failed to generate chat response: ${
        error instanceof Error ? error.message : "Unknown"
      }`
    );
  }
}
