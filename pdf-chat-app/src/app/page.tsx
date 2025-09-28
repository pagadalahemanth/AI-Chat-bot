'use client';

import React, { useState, useRef, useEffect } from 'react';

interface UploadedDocument {
  id: string;
  filename: string;
  uploadedAt: Date;
  chunksCount: number;
  status: 'processing' | 'ready' | 'error';
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  documentId: string; // NEW: Associate message with document
}

export default function PDFChatApp() {
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<UploadedDocument | null>(null);
  const [allMessages, setAllMessages] = useState<ChatMessage[]>([]); // Store all messages
  const [inputMessage, setInputMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  // Get messages for the currently selected document
  const currentMessages = selectedDoc 
    ? allMessages.filter(msg => msg.documentId === selectedDoc.id)
    : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);
useEffect(() => {
  const savedFile = localStorage.getItem("uploadedFile");
  if (savedFile) {
    setUploadedFile(savedFile);
  }
}, []);

const handleUploadSuccess = (filename: string) => {
  setUploadedFile(filename);
  localStorage.setItem("uploadedFile", filename);
};

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please select a PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress('Uploading PDF...');

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      setUploadProgress('Processing PDF and generating embeddings...');
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload PDF');
      }

      const newDoc: UploadedDocument = {
        id: result.documentId,
        filename: result.filename,
        uploadedAt: new Date(),
        chunksCount: result.chunksCount,
        status: 'ready'
      };

      setUploadedDocs(prev => [newDoc, ...prev]);
      setUploadProgress('Upload completed successfully!');
      
      // Auto-select the newly uploaded document
      setSelectedDoc(newDoc);

      setTimeout(() => setUploadProgress(''), 2000);
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTimeout(() => setUploadProgress(''), 3000);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedDoc || isChatting) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
      documentId: selectedDoc.id // Associate with current document
    };

    // Add message to all messages
    setAllMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsChatting(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: inputMessage.trim(),
          documentId: selectedDoc.id, // Send document ID instead of filename
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        documentId: selectedDoc.id // Associate with current document
      };

      setAllMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        documentId: selectedDoc.id
      };
      setAllMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatting(false);
    }
  };

  const handleDocumentSelect = (doc: UploadedDocument) => {
    setSelectedDoc(doc);
    // Messages will automatically update based on selectedDoc via currentMessages
  };

  const handleDeleteDocument = (docId: string) => {
    // Remove document
    setUploadedDocs(prev => prev.filter(d => d.id !== docId));
    
    // Remove all messages for this document
    setAllMessages(prev => prev.filter(msg => msg.documentId !== docId));
    
    // If deleted document was selected, clear selection
    if (selectedDoc && selectedDoc.id === docId) {
      setSelectedDoc(null);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Count messages per document
  const getMessageCount = (docId: string) => {
    return allMessages.filter(msg => msg.documentId === docId).length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-6 bg-blue-600 text-white">
            <h1 className="text-2xl font-bold mb-2">PDF Chat AI</h1>
            <p className="text-blue-100 text-sm">Intelligent document conversations</p>
          </div>

          {/* Upload Section */}
          <div className="p-4 border-b border-gray-200">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isUploading ? 'Processing...' : '+ Upload New PDF'}
            </button>
            
            {uploadProgress && (
              <div className="mt-2 text-sm text-blue-600 bg-blue-50 p-2 rounded">
                {uploadProgress}
              </div>
            )}
          </div>

          {/* Documents List */}
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              My Documents ({uploadedDocs.length})
            </h3>
            
            {uploadedDocs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-3">📄</div>
                <p className="text-sm font-medium mb-1">No documents yet</p>
                <p className="text-xs text-gray-400">Upload your first PDF to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {uploadedDocs.map((doc) => {
                  const messageCount = getMessageCount(doc.id);
                  return (
                    <div
                      key={doc.id}
                      onClick={() => handleDocumentSelect(doc)}
                      className={`p-4 rounded-lg cursor-pointer transition-all border ${
                        selectedDoc?.id === doc.id
                          ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-red-600">📄</span>
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {doc.filename}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>🕒 {formatDate(doc.uploadedAt)}</span>
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">
                              {doc.chunksCount} chunks
                            </span>
                            {messageCount > 0 && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                💬 {messageCount} messages
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDocument(doc.id);
                          }}
                          className="text-gray-400 hover:text-red-500 p-1 ml-2"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {selectedDoc ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-lg">
                    💬
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900">{selectedDoc.filename}</h2>
                    <p className="text-sm text-gray-600">
                      {currentMessages.length} messages • {selectedDoc.chunksCount} chunks processed
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                {currentMessages.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">💬</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Start chatting with this document</h3>
                    <p className="text-gray-600 mb-6">Ask me anything about "{selectedDoc.filename}"</p>
                    <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                      <button 
                        onClick={() => setInputMessage("What is this document about?")}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
                      >
                        What is this about?
                      </button>
                      <button 
                        onClick={() => setInputMessage("Summarize the key points")}
                        className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-colors"
                      >
                        Key points
                      </button>
                      <button 
                        onClick={() => setInputMessage("What are the main topics covered?")}
                        className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition-colors"
                      >
                        Main topics
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {currentMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-3xl ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                          <div
                            className={`p-4 rounded-xl shadow-sm ${
                              message.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border border-gray-200'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 px-2">
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
                          message.role === 'user' ? 'bg-blue-600 order-1' : 'bg-gray-100 order-2'
                        }`}>
                          <span className="text-sm">
                            {message.role === 'user' ? '👤' : '🤖'}
                          </span>
                        </div>
                      </div>
                    ))}
                    {isChatting && (
                      <div className="flex gap-4 justify-start">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shadow-sm order-2">
                          <span className="text-sm">🤖</span>
                        </div>
                        <div className="max-w-3xl order-1">
                          <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-2">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                              </div>
                              <p className="text-sm text-gray-500">Thinking...</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder={`Ask anything about "${selectedDoc.filename}"...`}
                    disabled={isChatting}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isChatting}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
                  >
                    {isChatting ? '⏳' : '📤'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-8xl mb-6">📄</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Welcome to PDF Chat AI</h3>
                <p className="text-gray-600 mb-8 max-w-md">
                  Upload PDF documents and have intelligent conversations about their content. 
                  Each document maintains its own chat history.
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
                >
                  📤 Upload Your First PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
