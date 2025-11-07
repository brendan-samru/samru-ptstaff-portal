'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useRouter } from 'next/navigation';
// --- ADD NEW ICONS ---
import { 
  LogOut, Plus, FileText, ChevronsUpDown, 
  FolderKanban, ImageIcon, Eye, Download, Upload, Trash2, Loader2
} from 'lucide-react';

// Import functions for cards
import { ContentList } from '@/components/ContentList'; 
import { TemplatesModal } from '@/components/TemplatesModal';
import { listAllCards, Card } from '@/lib/portal/cards';

// --- ADD NEW IMPORTS ---
// Import functions for media library
import { MediaItem, listMediaLibrary, uploadToMediaLibrary, deleteFromMediaLibrary } from '@/lib/portal/media';
// Import functions for analytics
import { db } from '@/lib/firebase/client';
import { collection, getDocs, query, where,getCountFromServer } from 'firebase/firestore';
// ---

function AdminContent() {
  const { userData, logout } = useAuth();
  const router = useRouter();
  
  // --- STATE FOR TABS ---
  const [activeTab, setActiveTab] = useState<'cards' | 'media'>('cards');
  
  // --- STATE FOR DEPT SELECTION ---
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const manageableDepts = userData?.departments || (userData?.department ? [userData.department] : []);

  useEffect(() => {
    if (manageableDepts.length > 0 && !selectedDept) {
      setSelectedDept(manageableDepts[0]);
    }
  }, [manageableDepts, selectedDept]);

  const orgId = selectedDept; 
  const departmentName = selectedDept || "Department Portal";

  // --- STATE FOR CARDS ---
  const [cards, setCards] = useState<Card[]>([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  
  // --- STATE FOR MEDIA ---
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  
  // --- STATE FOR ANALYTICS ---
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [totalCards, setTotalCards] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [totalDownloads, setTotalDownloads] = useState(0);

  // --- FUNCTIONS FOR LOADING DATA ---
  
  // Load cards for the selected department
  const loadCards = async () => {
    if (!orgId) return;
    setLoadingCards(true);
    try {
      const items = await listAllCards(orgId);
      setCards(items);
      setTotalCards(items.length); // Update card count
    } catch (error) {
      console.error('Error loading cards:', error);
    } finally {
      setLoadingCards(false);
    }
  };

  // Load analytics for the selected department
  const loadAnalytics = async () => {
    if (!orgId) return;
    setLoadingAnalytics(true);
    try {
      // 1. Get view count for this orgId
      const viewQuery = query(collection(db, 'analyticsEvents'), 
        where("type", "==", "cardView"),
        where("orgId", "==", orgId)
      );
      const viewSnap = await getCountFromServer(viewQuery);
      setTotalViews(viewSnap.data().count);

      // 2. Get download count for this orgId
      const downloadQuery = query(collection(db, 'analyticsEvents'), 
        where("type", "==", "fileDownload"),
        where("orgId", "==", orgId)
      );
      const downloadSnap = await getCountFromServer(downloadQuery);
      setTotalDownloads(downloadSnap.data().count);

    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Load media (runs once on page load)
  const loadMedia = async () => {
    setLoadingMedia(true);
    listMediaLibrary().then(setMediaItems).finally(() => setLoadingMedia(false));
  };

  // --- USE EFFECTS ---

  // Re-load cards and analytics whenever the department changes
  useEffect(() => {
    loadCards();
    loadAnalytics();
  }, [orgId]);

  // Load media library on initial page load
  useEffect(() => {
    loadMedia();
  }, []);

  // --- FUNCTIONS FOR ACTIONS ---

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Handler for uploading to media library
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of files) {
        await uploadToMediaLibrary(file);
      }
      await loadMedia(); // Refresh the media list
    } catch (error) {
      console.error("Media upload failed:", error);
      alert("Media upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  // Handler for deleting from media library
  const handleDeleteMedia = async (item: MediaItem) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"? This cannot be undone.`)) {
      return;
    }
    try {
      await deleteFromMediaLibrary(item);
      await loadMedia(); // Refresh the media list
    } catch (error) {
      console.error("Error deleting media:", error);
      alert("Failed to delete media item.");
    }
  };


  return (
    // --- ADDED GRADIENT BACKGROUND ---
    <div className="min-h-screen">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-green-100/80 via-blue-100/60 to-white" />
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#8BC53F]/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-[#26A9E0]/20 rounded-full blur-3xl" />
      </div>
    
      {/* Header (same as before) */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-xl font-bold text-gray-900">{departmentName}</div>
              <div className="text-xs text-gray-600">Manager View</div>
            </div>
            {manageableDepts.length > 1 && (
              <div className="relative">
                <select
                  value={selectedDept || ''}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="pl-3 pr-8 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md appearance-none"
                >
                  {manageableDepts.map(deptId => (
                    <option key={deptId} value={deptId}>{deptId}</option>
                  ))}
                </select>
                <ChevronsUpDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {userData?.role === 'super_admin' && (
              <button
                onClick={() => router.push('/super')}
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
        {!orgId && (
          <div className="text-center py-12 text-gray-500">
            <p>No department is assigned to your account.</p>
          </div>
        )}

        {orgId && (
          <>
            {/* --- NEW ANALYTICS WIDGETS --- */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex-shrink-0 grid place-items-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">
                    {loadingCards ? <Loader2 className="w-6 h-6 animate-spin" /> : totalCards}
                  </div>
                  <div className="text-sm text-gray-500">Total Cards</div>
                </div>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 flex items-start gap-4">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex-shrink-0 grid place-items-center">
                  <Eye className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">
                    {loadingAnalytics ? <Loader2 className="w-6 h-6 animate-spin" /> : totalViews}
                  </div>
                  <div className="text-sm text-gray-500">Total Card Views</div>
                </div>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex-shrink-0 grid place-items-center">
                  <Download className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <div className="text-3xl font-Bols text-gray-900">
                    {loadingAnalytics ? <Loader2 className="w-6 h-6 animate-spin" /> : totalDownloads}
                  </div>
                  <div className="text-sm text-gray-500">Total Downloads</div>
                </div>
              </div>
            </section>
            
            {/* --- NEW TABBED LAYOUT --- */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              {/* Tab Buttons */}
              <div className="p-2 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setActiveTab('cards')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'cards' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    <FolderKanban className="w-4 h-4" />
                    Manage Cards
                  </button>
                  <button 
                    onClick={() => setActiveTab('media')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'media' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    Media Library
                  </button>
                </div>
              </div>
              
              {/* Tab Content */}
              <div className="p-6">
                
                {/* --- CARD MANAGEMENT TAB --- */}
                {activeTab === 'cards' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Manage Cards</h2>
                      <button
                        onClick={() => setShowTemplateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#8BC53F] text-white rounded-lg hover:bg-[#65953B] transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add Card from Template
                      </button>
                    </div>
                    
                    {loadingCards && (
                      <div className="text-center py-12 text-gray-500">Loading cards...</div>
                    )}
                    {!loadingCards && cards.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No cards created for this department. Click "Add Card" to get started.</p>
                      </div>
                    ) : (
                      <ContentList 
                        orgId={orgId} 
                        cards={cards} 
                        onRefresh={loadCards}
                        userRole={userData?.role}
                      />
                    )}
                  </div>
                )}
                
                {/* --- MEDIA LIBRARY TAB --- */}
                {activeTab === 'media' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Media Library</h2>
                      <label 
                        className={`flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Upload className="w-4 h-4" />
                        {isUploading ? "Uploading..." : "Upload Image"}
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleMediaUpload}
                          disabled={isUploading}
                          multiple
                        />
                      </label>
                    </div>

                    {loadingMedia && (
                      <div className="text-center py-12 text-gray-500">
                        <Loader2 className="w-8 h-8 mx-auto animate-spin" />
                        <p>Loading media...</p>
                      </div>
                    )}
                    
                    {!loadingMedia && mediaItems.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No media uploaded yet. Click "Upload Image" to get started.</p>
                      </div>
                    )}

                    {!loadingMedia && mediaItems.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                        {mediaItems.map(item => (
                          <div key={item.id} className="relative group border border-gray-200 rounded-lg overflow-hidden" style={{ aspectRatio: '1/1' }}>
                            <img 
                              src={item.url} 
                              alt={item.name} 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button 
                                onClick={() => handleDeleteMedia(item)}
                                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                                title="Delete Image"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50">
                              <p className="text-xs text-white truncate" title={item.name}>
                                {item.name}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
              </div>
            </div>
          </>
        )}
      </div>

      {/* Template Modal (no changes) */}
      <TemplatesModal
        orgId={orgId!}
        open={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onCreated={() => {
          loadCards();
        }}
      />
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