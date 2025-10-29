'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { FileUpload } from "@/components/FileUpload"; // This now uses the new component
import { 
  addContent, 
  listContent, 
  deleteContent, 
  ContentItem 
} from "@/lib/portal/content"; // Make sure you also created this file
// MODIFICATION: Import storage functions
import { storage } from '@/lib/firebase/client';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { 
  Eye, 
  Download, 
  Settings,
  Plus,
  Trash2,
  FileText,
  Video,
  File,
  X,
  LogOut
} from 'lucide-react';
import { useRouter } from 'next/navigation';

function AdminContent() {
  const { userData, logout } = useAuth();
  const router = useRouter();
  
  const department = userData?.department || "default";
  // FIX: Use 'department' as fallback, 'departmentName' does not exist
  const departmentName = userData?.department || "Department Portal";

  // Portal content
  const [content, setContent] = useState<ContentItem[]>([]);
  
  // Form state
  const [showAddContent, setShowAddContent] = useState(false);
  const [newContentTitle, setNewContentTitle] = useState("");
  const [contentBusy, setContentBusy] = useState(false);
  
  // MODIFICATION: New state to hold the selected file
  const [newFile, setNewFile] = useState<File | null>(null);

  // Load content from Firebase
  const loadContent = async () => {
    if (!department) return;
    try {
      const items = await listContent(department);
      setContent(items);
    } catch (error) {
      console.error('Error loading content:', error);
    }
  };

  // Load content on mount
  useEffect(() => {
    loadContent();
  }, [department]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleDelete = async (id: string, url: string) => {
    if (!confirm('Are you sure you want to delete this file? This cannot be undone.')) {
      return;
    }
    try {
      await deleteContent(department, id, url);
      await loadContent();
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('Failed to delete file. Please try again.');
    }
  };
  
  // Helper to render file type icon
  const FileIcon = ({ type }: { type: string }) => {
    if (type === 'video') return <Video className="w-5 h-5 text-purple-600" />;
    if (type === 'pdf') return <FileText className="w-5 h-5 text-red-600" />;
    return <File className="w-5 h-5 text-blue-600" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>
                {departmentName}
              </div>
              <div className="text-xs text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                Manager View
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {userData?.role === 'super_admin' && (
              <button
                onClick={() => router.push('/super-admin')}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
              >
                Super Admin
              </button>
            )}
            <button
              onClick={() => router.push('/portal')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
            >
              View Portal
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </header>
      
      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Add Content Modal */}
        {showAddContent && (
          <div className="mb-6 bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Upload New Content
              </h3>
              <button
                onClick={() => {
                  setShowAddContent(false);
                  setNewContentTitle("");
                  setNewFile(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Title Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content Title (optional)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BC53F] focus:border-transparent"
                  placeholder="Optional — uses filename if blank"
                  value={newContentTitle}
                  onChange={(e) => setNewContentTitle(e.target.value)}
                  disabled={contentBusy}
                />
              </div>

              {/* MODIFICATION: FileUpload component updated to use onFileChange */}
              <FileUpload
                accept="video/*,application/pdf,.doc,.docx,.ppt,.pptx"
                maxSizeMB={100}
                // Add types to fix implicit 'any' error
                onFileChange={(file: File | null, localUrl: string | null) => {
                  setNewFile(file);
                  // This page doesn't have a preview box, so localUrl isn't used
                }}
                initialFileName={null}
              />

              {/* MODIFICATION: Added Save/Cancel buttons */}
              <div className="flex gap-2 justify-end mt-6">
                <button
                  onClick={() => {
                    setShowAddContent(false);
                    setNewFile(null);
                    setNewContentTitle("");
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={contentBusy}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    // This is the new save logic
                    if (!newFile) {
                      alert("Please select a file to upload.");
                      return;
                    }
                    
                    setContentBusy(true);

                    try {
                      // --- Step 1: Upload file ---
                      const timestamp = Date.now();
                      const sanitizedName = newFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
                      const fileName = `${timestamp}_${sanitizedName}`;
                      const storageRef = ref(storage, `content/${department}/${fileName}`);
                      
                      const uploadTask = uploadBytesResumable(storageRef, newFile);
                      await uploadTask;
                      const downloadURL = await getDownloadURL(storageRef);

                      // --- Step 2: Determine file type ---
                      const fileType = newFile.type.startsWith('video/') ? 'video' 
                        : newFile.type === 'application/pdf' ? 'pdf' 
                        : 'document';
                      
                      // --- Step 3: Save to Firestore ---
                      await addContent(department, {
                        url: downloadURL,
                        title: newContentTitle || newFile.name,
                        type: fileType,
                      });

                      // --- Step 4: Reset and reload ---
                      setShowAddContent(false);
                      setNewFile(null);
                      setNewContentTitle("");
                      await loadContent();

                    } catch (err) {
                      console.error("Error uploading content:", err);
                      alert("Failed to upload content. Please try again.");
                    } finally {
                      setContentBusy(false);
                    }
                  }}
                  disabled={contentBusy || !newFile}
                  className="px-4 py-2 bg-[#8BC53F] text-white rounded-lg hover:bg-[#65953B] transition-colors disabled:opacity-50"
                >
                  {contentBusy ? "Saving…" : "Save Content"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content List */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Manage Content</h2>
            <button
              onClick={() => setShowAddContent(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#8BC53F] text-white rounded-lg hover:bg-[#65953B] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Upload Content
            </button>
          </div>
          
          <div className="p-6">
            {content.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No content uploaded yet. Click "Upload Content" to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {content.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileIcon type={item.type} />
                      <span className="font-medium text-gray-800">{item.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      >
                        <Download className="w-4 h-4" />
                        View
                      </a>
                      <button
                        onClick={() => handleDelete(item.id, item.url)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
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
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminContent />
    </ProtectedRoute>
  );
}