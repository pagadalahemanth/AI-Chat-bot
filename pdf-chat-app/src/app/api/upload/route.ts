import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { extractTextFromPDF, chunkText } from '@/lib/pdf-parser';
import { processDocumentChunks } from '@/lib/embeddings';

export async function POST(request: NextRequest) {
  console.log('📤 === OPTIMIZED UPLOAD START ===');
  
  try {
    // Step 1: Validate environment
    if (!process.env.GOOGLE_API_KEY || !process.env.PINECONE_API_KEY || !process.env.PINECONE_INDEX_NAME) {
      return NextResponse.json(
        { error: 'API configuration missing' },
        { status: 500 }
      );
    }

    // Step 2: Parse and validate file
    const formData = await request.formData();
    const file = formData.get('pdf') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
    }

    const documentId = uuidv4();
    console.log(`📄 Processing: ${file.name} (${file.size} bytes) - ID: ${documentId}`);

    // Step 3: Quick file save (don't wait for processing)
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const filename = `${documentId}_${file.name}`;
    const filepath = path.join(uploadsDir, filename);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);
    console.log('✅ File saved');

    // Step 4: Extract and validate text
    let text: string;
    try {
      text = await extractTextFromPDF(buffer);
      console.log(`📝 Extracted ${text.length} characters`);
      
      if (!text.trim()) {
        throw new Error('No text content found');
      }
      
      // Log first part of extracted text for debugging
      console.log('📝 Text sample:', text.substring(0, 300));
      
    } catch (extractError) {
      console.error('❌ Text extraction failed:', extractError);
      return NextResponse.json({ 
        error: 'Could not extract text from PDF. Please ensure it\'s not scanned or encrypted.' 
      }, { status: 400 });
    }

    // Step 5: Create optimized chunks
    // const chunks = chunkText(text, 2000, 400); // Larger chunks for better context
    const chunks = chunkText(text, 1200, 200);
    if (chunks.length === 0) {
      return NextResponse.json({ error: 'No meaningful content found in PDF' }, { status: 400 });
    }

    console.log(`📊 Created ${chunks.length} chunks`);

    // Step 6: Process embeddings with rate limiting
    try {
      console.log('🔄 Starting embedding process...');
      await processDocumentChunks(chunks, documentId, file.name);
      console.log('✅ Document processing completed');
    } catch (processingError) {
      console.error('❌ Processing failed:', processingError);
      return NextResponse.json({ 
        error: `Processing failed: ${processingError instanceof Error ? processingError.message : 'Unknown error'}`,
        details: 'The file was uploaded but embedding generation failed. Please try again.'
      }, { status: 500 });
    }

    console.log('🎉 === UPLOAD SUCCESS ===');
    return NextResponse.json({
      success: true,
      documentId,
      filename: file.name,
      chunksCount: chunks.length,
      extractedLength: text.length,
      message: 'PDF processed successfully! You can now chat with it.',
    });

  } catch (error) {
    console.error('💥 === UPLOAD ERROR ===');
    console.error('Error:', error);
    
    return NextResponse.json(
      { 
        error: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        suggestion: 'Please check the PDF file and try again.'
      },
      { status: 500 }
    );
  }
}
