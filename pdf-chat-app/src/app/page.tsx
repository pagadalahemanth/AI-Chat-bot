'use client';

import { useState } from 'react';
import { PDFUpload } from '@/components/PDFUpload';
import { ChatInterface } from '@/components/ChatInterface';

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const handleUploadSuccess = (filename: string) => {
    setUploadedFile(filename);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          PDF Chat Application
        </h1>
        <p className="text-lg text-gray-600">
          Upload a PDF document and chat with it using AI
        </p>
      </div>

      <div className="space-y-8">
        <PDFUpload onUploadSuccess={handleUploadSuccess} />
        <ChatInterface uploadedFile={uploadedFile} />
      </div>

      {uploadedFile && (
        <div className="text-center">
          <button
            onClick={() => setUploadedFile(null)}
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            Upload a different document
          </button>
        </div>
      )}
    </div>
  );
}
