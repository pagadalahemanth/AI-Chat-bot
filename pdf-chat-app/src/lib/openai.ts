// import OpenAI from 'openai';

// if (!process.env.OPENAI_API_KEY) {
//   throw new Error('OPENAI_API_KEY is not set in environment variables');
// }

// export const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// export async function generateEmbedding(text: string): Promise<number[]> {
//   try {
//     const response = await openai.embeddings.create({
//       model: 'text-embedding-ada-002',
//       input: text,
//     });
    
//     return response.data[0].embedding;
//   } catch (error) {
//     console.error('Error generating embedding:', error);
//     throw new Error('Failed to generate embedding');
//   }
// }

// export async function generateChatResponse(
//   query: string,
//   context: string
// ): Promise<string> {
//   try {
//     const response = await openai.chat.completions.create({
//       model: 'gpt-4',
//       messages: [
//         {
//           role: 'system',
//           content: `You are a helpful AI assistant that answers questions based on the provided context. 
//                    Use only the information from the context to answer questions. 
//                    If the answer is not in the context, say "I don't have enough information to answer that question."`
//         },
//         {
//           role: 'user',
//           content: `Context: ${context}\n\nQuestion: ${query}`
//         }
//       ],
//       max_tokens: 500,
//       temperature: 0.3,
//     });

//     return response.choices[0].message?.content || 'Sorry, I could not generate a response.';
//   } catch (error) {
//     console.error('Error generating chat response:', error);
//     throw new Error('Failed to generate chat response');
//   }
// }
