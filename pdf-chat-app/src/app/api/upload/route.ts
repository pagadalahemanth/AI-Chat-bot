import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { extractTextFromPDF, chunkText } from '@/lib/pdf-parser';
import { processDocumentChunks } from '@/lib/embeddings';

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    if (!process.env.GOOGLE_API_KEY || !process.env.PINECONE_API_KEY || !process.env.PINECONE_INDEX_NAME) {
      return NextResponse.json(
        { error: 'Google API key or Pinecone configuration missing' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('pdf') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 });
    }

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const documentId = uuidv4();
    const filename = `${documentId}_${file.name}`;
    const filepath = path.join(uploadsDir, filename);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    console.log(`File saved: ${filename}`);

    // Extract text from PDF
    const text = await extractTextFromPDF(buffer);
    
    if (!text.trim()) {
      return NextResponse.json({ error: 'Could not extract text from PDF' }, { status: 400 });
    }

    console.log(`Extracted ${text.length} characters from PDF`);

    // Chunk the text
    const chunks = chunkText(text, 3000, 500);
    
    if (chunks.length === 0) {
      return NextResponse.json({ error: 'No meaningful content found in PDF' }, { status: 400 });
    }

    console.log(`Created ${chunks.length} chunks`);

    // Process chunks and create embeddings
    await processDocumentChunks(chunks, documentId, file.name);

    return NextResponse.json({
      success: true,
      documentId,
      filename: file.name,
      chunksCount: chunks.length,
      message: 'PDF processed successfully with Google AI. You can now chat with it!',
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: `Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}