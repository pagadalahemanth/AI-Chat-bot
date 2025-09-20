// import { v4 as uuidv4 } from 'uuid';
// import { generateEmbedding } from './google-ai';
// import { saveChunks } from './pinecone';
// import { Chunk } from '@/types';

// export async function processDocumentChunks(
//   chunks: string[],
//   documentId: string,
//   filename: string
// ): Promise<void> {
//   console.log('🔄 === STARTING DOCUMENT PROCESSING ===');
//   console.log(`📄 Document ID: ${documentId}`);
//   console.log(`📁 Filename: ${filename}`);
//   console.log(`📊 Number of chunks: ${chunks.length}`);
  
//   try {
//     const chunkObjects: Chunk[] = [];
    
//     // Test first chunk to catch issues early
//     console.log('🧪 Testing first chunk...');
//     if (chunks.length > 0) {
//       console.log('🔍 First chunk preview:', chunks[0].substring(0, 200));
//       console.log('🔍 First chunk length:', chunks[0].length);
//     }
    
//     for (let i = 0; i < chunks.length; i++) {
//       const chunk = chunks[i];
//       console.log(`\n--- Processing chunk ${i + 1}/${chunks.length} ---`);
//       console.log(`📝 Chunk length: ${chunk.length}`);
//       console.log(`📝 Chunk preview: "${chunk.substring(0, 100)}..."`);
      
//       try {
//         console.log('🔄 Generating embedding...');
//         const embedding = await generateEmbedding(chunk);
//         console.log('✅ Embedding generated successfully');
        
//         const chunkObject: Chunk = {
//           id: `${documentId}-chunk-${i}`,
//           documentId,
//           content: chunk,
//           embedding,
//           metadata: {
//             filename,
//             chunkIndex: i,
//             totalChunks: chunks.length
//           }
//         };
        
//         chunkObjects.push(chunkObject);
//         console.log(`✅ Chunk ${i + 1} processed successfully`);
        
//         // Add a small delay to be safe
//         if (i < chunks.length - 1) {
//           console.log('⏳ Brief pause before next chunk...');
//           await new Promise(resolve => setTimeout(resolve, 100));
//         }
        
//       } catch (chunkError) {
//         console.error(`❌ Failed to process chunk ${i + 1}:`, chunkError);
//         console.error('❌ Chunk content that failed:', chunk.substring(0, 200));
//         throw new Error(`Failed to process chunk ${i + 1}: ${chunkError instanceof Error ? chunkError.message : 'Unknown error'}`);
//       }
//     }
    
//     console.log(`\n💾 Saving ${chunkObjects.length} chunks to Pinecone...`);
    
//     try {
//       await saveChunks(chunkObjects);
//       console.log('✅ All chunks saved to Pinecone successfully');
//     } catch (saveError) {
//       console.error('❌ Failed to save chunks to Pinecone:', saveError);
//       throw new Error(`Failed to save to Pinecone: ${saveError instanceof Error ? saveError.message : 'Unknown error'}`);
//     }
    
//     console.log('🎉 === DOCUMENT PROCESSING COMPLETED SUCCESSFULLY ===');
//     console.log(`✅ Processed and saved ${chunkObjects.length} chunks for document ${filename}`);
    
//   } catch (error) {
//     console.error('\n💥 === DOCUMENT PROCESSING FAILED ===');
//     console.error('❌ Error details:', error);
//     console.error('❌ Error message:', error instanceof Error ? error.message : 'Unknown error');
//     console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
//     throw new Error(`Failed to process document chunks: ${error instanceof Error ? error.message : 'Unknown error'}`);
//   }
// }

import { v4 as uuidv4 } from 'uuid';
import { generateEmbedding } from './google-ai';
import { saveChunks } from './pinecone';
import { Chunk } from '@/types';

export async function processDocumentChunks(
  chunks: string[],
  documentId: string,
  filename: string
): Promise<void> {
  console.log(`🔄 Processing ${chunks.length} chunks with optimized rate limiting`);
  
  try {
    const chunkObjects: Chunk[] = [];
    const BATCH_SIZE = 5; // Process 5 chunks then take a break
    
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      console.log(`📦 Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(chunks.length/BATCH_SIZE)}`);
      
      // Process batch with delays
      for (let j = 0; j < batch.length; j++) {
        const globalIndex = i + j;
        const chunk = batch[j];
        
        console.log(`📝 Processing chunk ${globalIndex + 1}/${chunks.length}`);
        
        try {
          const embedding = await generateEmbedding(chunk);
          
          const chunkObject: Chunk = {
            id: `${documentId}-chunk-${globalIndex}`,
            documentId,
            content: chunk,
            embedding,
            metadata: {
              filename,
              chunkIndex: globalIndex,
              totalChunks: chunks.length
            }
          };
          
          chunkObjects.push(chunkObject);
          
          // Small delay between chunks in the same batch
          if (j < batch.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
        } catch (chunkError) {
          console.error(`❌ Failed to process chunk ${globalIndex + 1}:`, chunkError);
          throw new Error(`Failed to process chunk ${globalIndex + 1}: ${chunkError instanceof Error ? chunkError.message : 'Unknown error'}`);
        }
      }
      
      // Longer delay between batches
      if (i + BATCH_SIZE < chunks.length) {
        console.log('⏳ Taking a longer break between batches...');
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second break
      }
    }
    
    console.log(`💾 Saving all ${chunkObjects.length} chunks to Pinecone...`);
    await saveChunks(chunkObjects);
    console.log('✅ All chunks processed and saved successfully');
    
  } catch (error) {
    console.error('❌ Document processing failed:', error);
    throw new Error(`Failed to process document chunks: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}