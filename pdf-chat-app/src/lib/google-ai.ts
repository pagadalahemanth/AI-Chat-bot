// // import { GoogleGenerativeAI } from '@google/generative-ai';

// // console.log('🔧 Loading Google AI module...');

// // if (!process.env.GOOGLE_API_KEY) {
// //   console.error('❌ GOOGLE_API_KEY is not set in environment variables');
// //   throw new Error('GOOGLE_API_KEY is not set in environment variables');
// // }

// // console.log('✅ Google API key found:', process.env.GOOGLE_API_KEY.substring(0, 10) + '...');

// // const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
// // console.log('✅ GoogleGenerativeAI initialized');

// // export async function generateEmbedding(text: string): Promise<number[]> {
// //   console.log('📝 Starting embedding generation...');
// //   console.log('📝 Text length:', text.length);
// //   console.log('📝 Text preview:', text.substring(0, 100));
  
// //   try {
// //     // Create 1024-dimensional embedding to match your Pinecone index
// //     console.log('🔄 Creating 1024-dimensional embedding...');
    
// //     const embedding = createDeterministicEmbedding(text, 1024); // Changed from 1536 to 1024
// //     console.log('✅ Embedding created, length:', embedding.length);
    
// //     return embedding;
// //   } catch (error) {
// //     console.error('❌ Error generating embedding:', error);
// //     console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack');
// //     throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
// //   }
// // }

// // function createDeterministicEmbedding(text: string, dimensions: number = 1024): number[] {
// //   console.log(`🔄 cf: ${text.length}, dimensions: ${dimensions}`);
  
// //   // Create a hash-based embedding that's consistent for the same text
// //   let hash = 0;
// //   for (let i = 0; i < text.length; i++) {
// //     const char = text.charCodeAt(i);
// //     hash = ((hash << 5) - hash) + char;
// //     hash = hash & hash; // Convert to 32-bit integer
// //   }
  
// //   // Generate embedding with specified dimensions
// //   const embedding = new Array(dimensions).fill(0).map((_, i) => {
// //     const seed = hash + i;
// //     return Math.sin(seed * 0.01) * Math.cos(seed * 0.02);
// //   });
  
// //   // Normalize the embedding
// //   const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
// //   const normalized = embedding.map(val => val / magnitude);
  
// //   console.log(`✅ Deterministic embedding created with ${dimensions} dimensions, first 5 values:`, normalized.slice(0, 5));
// //   return normalized;
// // }

// // export async function generateChatResponse(
// //   query: string,
// //   context: string
// // ): Promise<string> {
// //   console.log('💬 Starting chat response generation...');
// //   console.log('💬 Query:', query);
// //   console.log('💬 Context lengthfff:', context);
  
// //   try {
// //     console.log('🤖 Initializing Gemini model...');
// //     const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
// //     console.log('✅ Gemini model initialized');
    
// //     const prompt = `You are a helpful AI assistant that answers questions based on the provided context. 
// // Use only the information from the context to answer questions. 
// // If the answer is not in the context, say "I don't have enough information to answer that question."

// // Context: ${context}

// // Question: ${query}

// // Answer:`;

// //     console.log('🔄 Sending request to Gemini...');
// //     const result = await model.generateContent(prompt);
// //     console.log('✅ Received response from Gemini');
    
// //     const response = await result.response;
// //     const text = response.text();
    
// //     console.log('📝 Generated response length:', text.length);
// //     console.log('📝 Response preview:', text.substring(0, 200));
    
// //     return text || 'Sorry, I could not generate a response.';
// //   } catch (error) {
// //     console.error('❌ Error generating chat response:', error);
// //     console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown error');
// //     console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack');
// //     throw new Error(`Failed to generate chat response: ${error instanceof Error ? error.message : 'Unknown error'}`);
// //   }
// // }

// import { GoogleGenerativeAI } from '@google/generative-ai';

// console.log('🔧 Loading Google AI module...');

// if (!process.env.GOOGLE_API_KEY) {
//   console.error('❌ GOOGLE_API_KEY is not set in environment variables');
//   throw new Error('GOOGLE_API_KEY is not set in environment variables');
// }

// console.log('✅ Google API key found:', process.env.GOOGLE_API_KEY.substring(0, 10) + '...');

// const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
// console.log('✅ GoogleGenerativeAI initialized');

// export async function generateEmbedding(text: string): Promise<number[]> {
//   console.log('📝 Starting embedding generation...');
//   console.log('📝 Text length:', text.length);
//   console.log('📝 Text preview:', text.substring(0, 100));

//   try {
//     console.log('🔄 Calling GoogleGenerativeAI embedding model...');
//     // Use the embedding model here!
//     const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004"}); // Or "text-embedding-004" for newer models if available in your region/plan
//     const { embedding } = await embeddingModel.embedContent(text);

//     if (!embedding || !embedding.values) {
//       throw new Error("Embedding values are undefined or null from Google AI.");
//     }

//     console.log('✅ Embedding generated, length:', embedding.values.length);
//     return embedding.values; // Return the actual embedding values
//   } catch (error) {
//     console.error('❌ Error generating embedding:', error);
//     console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack');
//     throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
//   }
// }

// // You can remove or comment out createDeterministicEmbedding function as it's no longer needed for actual embeddings.
// // function createDeterministicEmbedding(...) { ... }

// export async function generateChatResponse(
//   query: string,
//   context: string
// ): Promise<string> {
//   console.log('💬 Starting chat response generation...');
//   console.log('💬 Query:', query);
//   console.log('💬 Context length:', context.length); // Changed from context lengthfff to length
  
//   try {
//     console.log('🤖 Initializing Gemini model...');
//     const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
//     console.log('✅ Gemini model initialized');
    
//     const prompt = `You are a helpful AI assistant that answers questions based on the provided context. 
// Use only the information from the context to answer questions. 
// If the answer is not in the context, say "I don't have enough information to answer that question."

// Context: ${context}

// Question: ${query}

// Answer:`;

//     console.log('🔄 Sending request to Gemini...');
//     const result = await model.generateContent(prompt);
//     console.log('✅ Received response from Gemini');
    
//     const response = await result.response;
//     const text = response.text();
    
//     console.log('📝 Generated response length:', text.length);
//     console.log('📝 Response preview:', text.substring(0, 200));
    
//     return text || 'Sorry, I could not generate a response.';
//   } catch (error) {
//     console.error('❌ Error generating chat response:', error);
//     console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown error');
//     console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack');
//     throw new Error(`Failed to generate chat response: ${error instanceof Error ? error.message : 'Unknown error'}`);
//   }
// }

// import { GoogleGenerativeAI } from '@google/generative-ai';

// if (!process.env.GOOGLE_API_KEY) {
//   throw new Error('GOOGLE_API_KEY is not set in environment variables');
// }

// const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// // Rate limiting
// let lastRequestTime = 0;
// const MIN_DELAY_MS = 3000; // 3 seconds between requests

// export async function generateEmbedding(text: string): Promise<number[]> {
//   console.log('📝 Generating embedding with rate limiting...');
  
//   // Rate limiting
//   const now = Date.now();
//   const timeSinceLastRequest = now - lastRequestTime;
  
//   if (timeSinceLastRequest < MIN_DELAY_MS) {
//     const waitTime = MIN_DELAY_MS - timeSinceLastRequest;
//     console.log(`⏳ Rate limiting: waiting ${waitTime}ms`);
//     await new Promise(resolve => setTimeout(resolve, waitTime));
//   }
  
//   try {
//     // Use text-embedding-004 which might have better limits
//     const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    
//     // Truncate text to avoid token limits
//     const truncatedText = text.length > 6000 ? text.substring(0, 6000) + '...' : text;
    
//     console.log(`📝 Processing text: ${truncatedText.length} characters`);
    
//     const result = await model.embedContent(truncatedText);
//     lastRequestTime = Date.now();
    
//     if (!result.embedding?.values) {
//       throw new Error('No embedding values returned');
//     }
    
//     // Ensure we return the right number of dimensions
//     const embedding = result.embedding.values;
    
//     // If the embedding is not 1024 dimensions, pad or truncate
//     if (embedding.length !== 1024) {
//       console.log(`📝 Adjusting embedding from ${embedding.length} to 1024 dimensions`);
      
//       if (embedding.length > 1024) {
//         return embedding.slice(0, 1024);
//       } else {
//         const paddedEmbedding = [...embedding];
//         while (paddedEmbedding.length < 1024) {
//           paddedEmbedding.push(0);
//         }
//         return paddedEmbedding;
//       }
//     }
    
//     console.log(`✅ Embedding generated: ${embedding.length} dimensions`);
//     return embedding;
    
//   } catch (error) {
//     console.error('❌ Embedding failed:', error);
    
//     // Retry logic for rate limits
//     if (error instanceof Error && error.message.includes('429')) {
//       console.log('⏳ Rate limit hit, waiting 10 seconds and retrying once...');
//       await new Promise(resolve => setTimeout(resolve, 10000));
      
//       try {
//         const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
//         const truncatedText = text.length > 6000 ? text.substring(0, 6000) : text;
//         const result = await model.embedContent(truncatedText);
//         lastRequestTime = Date.now();
        
//         if (!result.embedding?.values) {
//           throw new Error('No embedding values returned on retry');
//         }
        
//         const embedding = result.embedding.values;
        
//         if (embedding.length !== 1024) {
//           if (embedding.length > 1024) {
//             return embedding.slice(0, 1024);
//           } else {
//             const paddedEmbedding = [...embedding];
//             while (paddedEmbedding.length < 1024) {
//               paddedEmbedding.push(0);
//             }
//             return paddedEmbedding;
//           }
//         }
        
//         return embedding;
        
//       } catch (retryError) {
//         throw new Error(`Embedding failed after retry: ${retryError instanceof Error ? retryError.message : 'Unknown'}`);
//       }
//     }
    
//     throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown'}`);
//   }
// }

// export async function generateChatResponse(query: string, context: string): Promise<string> {
//   console.log('💬 Generating chat response...');
  
//   // Rate limiting
//   const now = Date.now();
//   const timeSinceLastRequest = now - lastRequestTime;
  
//   if (timeSinceLastRequest < MIN_DELAY_MS) {
//     const waitTime = MIN_DELAY_MS - timeSinceLastRequest;
//     await new Promise(resolve => setTimeout(resolve, waitTime));
//   }
  
//   try {
//     const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
//     const prompt = `Answer the question based on the provided context.

// Context: ${context}

// Question: ${query}

// Answer:`;

//     const result = await model.generateContent(prompt);
//     lastRequestTime = Date.now();
    
//     const response = await result.response;
//     return response.text() || 'Sorry, I could not generate a response.';
    
//   } catch (error) {
//     console.error('❌ Chat response failed:', error);
//     throw new Error(`Failed to generate chat response: ${error instanceof Error ? error.message : 'Unknown'}`);
//   }
// }

import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GOOGLE_API_KEY) {
  throw new Error('GOOGLE_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function generateEmbedding(text: string): Promise<number[]> {
  console.log('📝 Generating embedding...');
  
  try {
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await model.embedContent(text);
    
    if (!result.embedding?.values) {
      throw new Error('No embedding values returned');
    }
    
    let embedding = result.embedding.values;
    console.log(`📝 Original embedding dimensions: ${embedding.length}`);
    
    // Convert to 1024 dimensions to match Pinecone index
    if (embedding.length === 768) {
      // Pad with calculated values instead of zeros for better similarity
      const paddedEmbedding = [...embedding];
      const avgValue = embedding.reduce((sum, val) => sum + val, 0) / embedding.length;
      
      while (paddedEmbedding.length < 1024) {
        // Add small variations around the average
        const variation = (Math.random() - 0.5) * 0.1 * avgValue;
        paddedEmbedding.push(avgValue + variation);
      }
      
      // Renormalize the embedding
      const magnitude = Math.sqrt(paddedEmbedding.reduce((sum, val) => sum + val * val, 0));
      embedding = paddedEmbedding.map(val => val / magnitude);
      
      console.log(`📝 Padded to ${embedding.length} dimensions and renormalized`);
    }
    
    console.log(`✅ Final embedding: ${embedding.length} dimensions`);
    return embedding;
    
  } catch (error) {
    console.error('❌ Embedding failed:', error);
    throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown'}`);
  }
}

export async function generateChatResponse(query: string, context: string): Promise<string> {
  console.log('💬 Generating chat response...');
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `You are a helpful AI assistant. Answer the question based on the provided context from the document.

Context: ${context}

Question: ${query}

Please provide a clear, helpful answer based on the information in the context. If the information isn't available in the context, say so politely.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return response.text() || 'Sorry, I could not generate a response.';
    
  } catch (error) {
    console.error('❌ Chat response failed:', error);
    throw new Error(`Failed to generate chat response: ${error instanceof Error ? error.message : 'Unknown'}`);
  }
}
