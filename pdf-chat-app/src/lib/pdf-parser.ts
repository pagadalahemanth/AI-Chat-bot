export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Simple text extraction - for complex PDFs you might need OCR
    const text = await extractPDFText(buffer);
    return text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

async function extractPDFText(buffer: Buffer): Promise<string> {
  try {
    // This is a simplified approach
    // For production, you might want to use a more robust solution
    const textContent = buffer.toString('utf-8');
    
    // Basic text extraction (this is very basic and might not work for all PDFs)
    // You might need to implement OCR for scanned PDFs
    const extracted = textContent.replace(/[^\x20-\x7E\n]/g, ' ').trim();
    
    if (!extracted || extracted.length < 10) {
      throw new Error('Could not extract readable text from PDF');
    }
    
    return extracted;
  } catch (error) {
    throw new Error('Failed to parse PDF content');
  }
}

export function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
  
  let currentChunk = '';
  
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    
    if (currentChunk.length + trimmedSentence.length > chunkSize) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        
        // Create overlap by taking the last part of current chunk
        const words = currentChunk.split(' ');
        const overlapWords = words.slice(-Math.floor(overlap / 10));
        currentChunk = overlapWords.join(' ') + ' ' + trimmedSentence;
      } else {
        chunks.push(trimmedSentence);
        currentChunk = '';
      }
    } else {
      currentChunk += (currentChunk ? ' ' : '') + trimmedSentence;
    }
  }
  
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks.filter(chunk => chunk.length > 50);
}