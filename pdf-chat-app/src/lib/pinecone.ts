import { Pinecone } from '@pinecone-database/pinecone';
import { Chunk } from '@/types';

let pinecone: Pinecone | null = null;

export async function initializePinecone(): Promise<Pinecone> {
  if (pinecone) return pinecone;

  try {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
    
    console.log('Pinecone initialized successfully');
    return pinecone;
  } catch (error) {
    console.error('Error initializing Pinecone:', error);
    throw new Error('Failed to initialize Pinecone');
  }
}

export async function getIndex() {
  try {
    const pc = await initializePinecone();
    const indexName = process.env.PINECONE_INDEX_NAME!;
    
    return pc.index(indexName);
  } catch (error) {
    console.error('Error getting Pinecone index:', error);
    throw new Error('Failed to get Pinecone index');
  }
}

export async function saveChunks(chunks: Chunk[]): Promise<void> {
  try {
    const index = await getIndex();
    
    // Prepare vectors for Pinecone
    const vectors = chunks.map(chunk => ({
      id: chunk.id,
      values: chunk.embedding,
      metadata: {
        documentId: chunk.documentId,
        content: chunk.content,
        filename: chunk.metadata.filename,
        chunkIndex: chunk.metadata.chunkIndex,
        totalChunks: chunk.metadata.totalChunks,
      }
    }));

    // Upsert vectors in batches of 100 (Pinecone limit)
    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await index.upsert(batch);
    }
    
    console.log(`Saved ${chunks.length} chunks to Pinecone`);
  } catch (error) {
    console.error('Error saving chunks to Pinecone:', error);
    throw new Error('Failed to save chunks to Pinecone');
  }
}

export async function searchSimilarChunks(
  queryEmbedding: number[],
  limit: number = 5
): Promise<Array<{
  id: string;
  content: string;
  filename: string;
  score: number;
}>> {
  try {
    const index = await getIndex();
    
    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK: limit,
      includeMetadata: true,
      includeValues: false,
    });

    return queryResponse.matches?.map(match => ({
      id: match.id,
      content: match.metadata?.content as string || '',
      filename: match.metadata?.filename as string || '',
      score: match.score || 0,
    })) || [];
  } catch (error) {
    console.error('Error searching similar chunks:', error);
    throw new Error('Failed to search similar chunks');
  }
}

export async function deleteDocumentChunks(documentId: string): Promise<void> {
  try {
    const index = await getIndex();
    
    // First, query to get all vectors for this document
    const queryResponse = await index.query({
      vector: new Array(1536).fill(0), // Dummy vector
      topK: 10000,
      filter: { documentId: { $eq: documentId } },
      includeMetadata: false,
      includeValues: false,
    });

    if (queryResponse.matches && queryResponse.matches.length > 0) {
      const idsToDelete = queryResponse.matches.map(match => match.id);
      await index.deleteMany(idsToDelete);
      console.log(`Deleted ${idsToDelete.length} chunks for document: ${documentId}`);
    }
  } catch (error) {
    console.error('Error deleting document chunks:', error);
    throw new Error('Failed to delete document chunks');
  }
}
