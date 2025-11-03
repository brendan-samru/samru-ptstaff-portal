'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useRouter } from 'next/navigation';
import { LogOut, Plus, FileText } from 'lucide-react';

// Import the new components and functions
import { ContentList } from '@/components/ContentList'; 
import { TemplatesModal } from '@/components/TemplatesModal';
// MODIFICATION: Import listActiveCards instead of listCards
import { listAllCards, Card } from '@/lib/portal/cards'; 

function AdminContent() {
  const { userData, logout } = useAuth();
  const router = useRouter();
  
  const orgId = userData?.department || "default";
  const departmentName = userData?.department || "Department Portal";

  // State for the list of cards
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for the modal
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // Load cards from Firebase
  const loadCards = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      
      // MODIFICATION: Call listAllCards
      const items = await listAllCards(orgId);
      setCards(items);
    } catch (error) {
      console.error('Error loading cards:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load cards on mount
  useEffect(() => {
    loadCards();
  }, [orgId]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
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
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Manage Cards</h2>
            <button
              onClick={() => setShowTemplateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#8BC53F] text-white rounded-lg hover:bg-[#65953B] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Card from Template
            </button>
          </div>
          
          <div className="p-6">
            {loading && (
              <div className="text-center py-12 text-gray-500">Loading cards...</div>
            )}
            {!loading && cards.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No cards created yet. Click "Add Card" to get started.</p>
              </div>
            ) : (
              // Your ContentList component goes here
              <ContentList 
                orgId={orgId} 
                cards={cards} 
                onRefresh={loadCards} // This will re-run 'listActiveCards'
              />
            )}
          </div>
        </div>
      </div>

      {/* The Template Modal component goes here */}
      <TemplatesModal
        orgId={orgId}
        open={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onCreated={() => {
          loadCards(); // Refresh the list after creating a new card
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