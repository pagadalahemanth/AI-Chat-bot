// import * as lancedb from '@lancedb/lancedb';
// import { Chunk } from '@/types';
// import path from 'path';

// let db: lancedb.Connection | null = null;

// export async function initializeDB(): Promise<lancedb.Connection> {
//   if (db) return db;
  
//   try {
//     const dbPath = process.env.LANCEDB_PATH || './lancedb_data';
//     db = await lancedb.connect(dbPath);
//     console.log('LanceDB connected successfully');
//     return db;
//   } catch (error) {
//     console.error('Error connecting to LanceDB:', error);
//     throw new Error('Failed to connect to LanceDB');
//   }
// }

// export async function createDocumentsTable() {
//   try {
//     const database = await initializeDB();
    
//     // Check if table exists
//     const tableNames = await database.tableNames();
//     if (tableNames.includes('documents')) {
//       return await database.openTable('documents');
//     }
    
//     // Create table with sample data to establish schema
//     const sampleData = [{
//       id: 'sample',
//       documentId: 'sample',
//       content: 'sample content',
//       embedding: new Array(1536).fill(0), // OpenAI ada-002 embedding size
//       filename: 'sample.pdf',
//       chunkIndex: 0,
//       totalChunks: 1
//     }];
    
//     const table = await database.createTable('documents', sampleData);
    
//     // Delete the sample data
//     await table.delete('id = "sample"');
    
//     return table;
//   } catch (error) {
//     console.error('Error creating documents table:', error);
//     throw new Error('Failed to create documents table');
//   }
// }

// export async function saveChunks(chunks: Chunk[]): Promise<void> {
//   try {
//     const table = await createDocumentsTable();
    
//     const data = chunks.map(chunk => ({
//       id: chunk.id,
//       documentId: chunk.documentId,
//       content: chunk.content,
//       embedding: chunk.embedding,
//       filename: chunk.metadata.filename,
//       chunkIndex: chunk.metadata.chunkIndex,
//       totalChunks: chunk.metadata.totalChunks
//     }));
    
//     await table.add(data);
//     console.log(`Saved ${chunks.length} chunks to LanceDB`);
//   } catch (error) {
//     console.error('Error saving chunks to LanceDB:', error);
//     throw new Error('Failed to save chunks to LanceDB');
//   }
// }

// export async function searchSimilarChunks(
//   queryEmbedding: number[], 
//   limit: number = 5
// ): Promise<Array<{
//   id: string;
//   content: string;
//   filename: string;
//   score: number;
// }>> {
//   try {
//     const table = await createDocumentsTable();
    
//     const results = await table
//       .search(queryEmbedding)
//       .limit(limit)
//       .toArray();
    
//     return results.map((result: any) => ({
//       id: result.id,
//       content: result.content,
//       filename: result.filename,
//       score: result._distance || 0
//     }));
//   } catch (error) {
//     console.error('Error searching similar chunks:', error);
//     throw new Error('Failed to search similar chunks');
//   }
// }

// export async function deleteDocumentChunks(documentId: string): Promise<void> {
//   try {
//     const table = await createDocumentsTable();
//     await table.delete(`documentId = "${documentId}"`);
//     console.log(`Deleted chunks for document: ${documentId}`);
//   } catch (error) {
//     console.error('Error deleting document chunks:', error);
//     throw new Error('Failed to delete document chunks');
//   }
// }
