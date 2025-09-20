'use client';

import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Card, CardHeader, CardContent } from './ui/Card';

interface PDFUploadProps {
  onUploadSuccess: (filename: string) => void;
}

export const PDFUpload: React.FC<PDFUploadProps> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please select a PDF file');
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload PDF');
      }

      const result = await response.json();
      onUploadSuccess(result.filename);
      setFile(null);
      
      // Reset the file input
      const fileInput = document.getElementById('pdf-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <h2 className="text-xl font-semibold text-gray-900">Upload PDF</h2>
        <p className="text-sm text-gray-600">Upload a PDF document to chat with it</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <input
            id="pdf-upload"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        
        {file && (
          <div className="text-sm text-gray-600">
            Selected: {file.name}
          </div>
        )}
        
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
            {error}
          </div>
        )}
        
        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full"
        >
          {uploading ? 'Uploading...' : 'Upload PDF'}
        </Button>
      </CardContent>
    </Card>
  );
};
