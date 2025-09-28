// import { NextRequest, NextResponse } from 'next/server';
// import { generateEmbedding, generateChatResponse } from '@/lib/google-ai'; // Changed from './openai'
// import { searchSimilarChunks } from '@/lib/pinecone';

// export async function POST(request: NextRequest) {
//   try {
//     const { query, filename } = await request.json();
    
//     if (!query || !filename) {
//       return NextResponse.json(
//         { error: 'Query and filename are required' },
//         { status: 400 }
//       );
//     }

//     console.log(`Processing query: "${query}" for document: ${filename}`);

//     // Generate embedding for the query
//     const queryEmbedding = await generateEmbedding(query);
//     console.log('Generated query embedding');

//     // Search for similar chunks
//     const similarChunks = await searchSimilarChunks(queryEmbedding, 5);
//     console.log(`Found ${similarChunks.length} similar chunks`);

//     if (similarChunks.length === 0) {
//       return NextResponse.json({
//         message: "I couldn't find any relevant information in the document to answer your question. Try rephrasing your question or asking about different content.",
//         sources: [],
//       });
//     }

//     // Combine the most relevant chunks as context
//     const context = similarChunks
//       .map((chunk, index) => `[Excerpt ${index + 1}]: ${chunk.content}`)
//       .join('\n\n');

//     console.log('Generating response with context...');

//     // Generate response using the context
//     const response = await generateChatResponse(query, context);

//     // Get unique source filenames
//     const sources = [...new Set(similarChunks.map(chunk => chunk.filename))];

//     console.log('Response generated successfully');

//     return NextResponse.json({
//       message: response,
//       sources,
//       relevanceScores: similarChunks.map(chunk => ({
//         score: chunk.score,
//         preview: chunk.content.substring(0, 100) + '...'
//       }))
//     });

//   } catch (error) {
//     console.error('Chat error:', error);
//     return NextResponse.json(
//       { error: `Failed to process chat query: ${error instanceof Error ? error.message : 'Unknown error'}` },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding, generateChatResponse } from '@/lib/google-ai';
import { searchSimilarChunks } from '@/lib/pinecone';

export async function POST(request: NextRequest) {
  try {
    const { query, documentId } = await request.json(); // Changed from filename to documentId
    
    if (!query || !documentId) {
      return NextResponse.json(
        { error: 'Query and documentId are required' },
        { status: 400 }
      );
    }

    console.log(`Processing query: "${query}" for document: ${documentId}`);

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    console.log('Generated query embedding');

    // Search for similar chunks ONLY in the selected document
    const similarChunks = await searchSimilarChunks(queryEmbedding, documentId, 10);
    console.log(`Found ${similarChunks.length} similar chunks in document ${documentId}`);

    if (similarChunks.length === 0) {
      return NextResponse.json({
        message: "I couldn't find any relevant information in this specific document to answer your question. Try rephrasing your question or asking about different content from this document.",
        sources: [],
      });
    }

    // Combine the most relevant chunks as context
    const context = similarChunks
      .map((chunk, index) => `[Excerpt ${index + 1}]: ${chunk.content}`)
      .join("\n\n");

    console.log('Generating response with document-specific context...');

    // Generate response using the context
    const response = await generateChatResponse(query, context);

    // Get unique source filenames (should be just one since we're filtering by document)
    const sources = [...new Set(similarChunks.map(chunk => chunk.filename))];

    console.log('Document-specific response generated successfully');

    return NextResponse.json({
      message: response,
      sources,
      documentId, // Include document ID in response
      relevanceScores: similarChunks.map(chunk => ({
        score: chunk.score,
        preview: chunk.content.substring(0, 100) + '...'
      }))
    });

  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: `Failed to process chat query: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
