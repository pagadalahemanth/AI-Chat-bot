'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, MessageCircle, Trash2, Clock, User, Send, Loader, Plus, X } from 'lucide-react';

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
}

export default function PDFChatApp() {
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<UploadedDocument | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    setShowUploadModal(true);

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
      
      setSelectedDoc(newDoc);
      setMessages([]);

      setTimeout(() => {
        setUploadProgress('');
        setShowUploadModal(false);
      }, 2000);
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTimeout(() => {
        setUploadProgress('');
        setShowUploadModal(false);
      }, 3000);
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
    };

    setMessages(prev => [...prev, userMessage]);
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
          filename: selectedDoc.filename,
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
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatting(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Sidebar */}
      <div className="w-80 bg-white/90 backdrop-blur-sm border-r border-gray-200 flex flex-col shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
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
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg"
          >
            {isUploading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
            {isUploading ? 'Processing...' : 'Upload New PDF'}
          </button>
        </div>

        {/* Documents List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700">
                My Documents ({uploadedDocs.length})
              </h3>
            </div>
            
            {uploadedDocs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm font-medium mb-1">No documents yet</p>
                <p className="text-xs text-gray-400">Upload your first PDF to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {uploadedDocs.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => {
                      setSelectedDoc(doc);
                      setMessages([]);
                    }}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedDoc?.id === doc.id
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-md'
                        : 'bg-white border border-gray-200 hover:shadow-md hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-1 bg-red-100 rounded">
                            <FileText className="w-4 h-4 text-red-600" />
                          </div>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {doc.filename}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(doc.uploadedAt)}
                          </span>
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">
                            {doc.chunksCount} chunks
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedDocs(prev => prev.filter(d => d.id !== doc.id));
                          if (selectedDoc?.id === doc.id) {
                            setSelectedDoc(null);
                            setMessages([]);
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {selectedDoc ? (
          <>
            {/* Chat Header */}
            <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 px-6 py-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">{selectedDoc.filename}</h2>
                  <p className="text-sm text-gray-600">
                    Uploaded {formatDate(selectedDoc.uploadedAt)} • Ready for questions
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50/50 to-white/50">
              {messages.length === 0 ? (
                <div className="text-center py-16">
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full w-20 h-20 mx-auto mb-6 shadow-lg">
                    <MessageCircle className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Ready to chat!</h3>
                  <p className="text-gray-600 mb-6">Ask me anything about your document</p>
                  <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                    <button 
                      onClick={() => setInputMessage("What is this document about?")}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
                    >
                      What is this about?
                    </button>
                    <button 
                      onClick={() => setInputMessage("Summarize the key points")}
                      className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm hover:bg-indigo-200 transition-colors"
                    >
                      Key points
                    </button>
                    <button 
                      onClick={() => setInputMessage("What are the main topics?")}
                      className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition-colors"
                    >
                      Main topics
                    </button>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-4xl ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                      <div
                        className={`p-4 rounded-2xl shadow-md ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                            : 'bg-white border border-gray-200'
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 px-4">
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                      message.role === 'user' 
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 order-1' 
                        : 'bg-gradient-to-br from-gray-100 to-gray-200 order-2'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="w-5 h-5 text-white" />
                      ) : (
                        <MessageCircle className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                  </div>
                ))
              )}
              
              {isChatting && (
                <div className="flex gap-4 justify-start">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-md order-2">
                    <MessageCircle className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="max-w-4xl order-1">
                    <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-md">
                      <div className="flex items-center gap-3">
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

            {/* Input Area */}
            <div className="bg-white/90 backdrop-blur-sm border-t border-gray-200 p-6 shadow-lg">
              <div className="flex gap-4">
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
                  placeholder="Ask anything about your document..."
                  disabled={isChatting}
                  className="flex-1 px-6 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 shadow-sm text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isChatting}
                  className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  {isChatting ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="p-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full w-24 h-24 mx-auto mb-8 shadow-xl">
                <FileText className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Welcome to PDF Chat AI</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Upload a PDF document and start having intelligent conversations about its content. 
                Perfect for research, studying, or document analysis.
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Upload className="w-5 h-5" />
                Upload Your First PDF
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upload Progress Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
            <div className="text-center">
              <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4">
                {isUploading ? (
                  <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                ) : (
                  <FileText className="w-8 h-8 text-blue-600" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing PDF</h3>
              <p className="text-sm text-gray-600 mb-4">{uploadProgress}</p>
              {!isUploading && (
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
