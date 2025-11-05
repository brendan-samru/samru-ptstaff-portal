'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useRouter } from 'next/navigation';
import { LogOut, Plus, FileText, ChevronsUpDown } from 'lucide-react';

// Import the new components and functions
import { ContentList } from '@/components/ContentList'; 
import { TemplatesModal } from '@/components/TemplatesModal';
// MODIFICATION: Import listActiveCards instead of listCards
import { listAllCards, Card } from '@/lib/portal/cards';

function AdminContent() {
  const { userData, logout } = useAuth();
  const router = useRouter();
  
  // --- NEW STATE ---
  // This holds the department the manager is CURRENTLY viewing
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  // ---

  // Determine the list of departments this manager can see
  const manageableDepts = userData?.departments || (userData?.department ? [userData.department] : []);

  // Set the default selected department when the user loads
  useEffect(() => {
    if (manageableDepts.length > 0 && !selectedDept) {
      setSelectedDept(manageableDepts[0]);
    }
  }, [manageableDepts, selectedDept]);


  // Use the selectedDept as the orgId
  const orgId = selectedDept; 
  // Get the name for the header
  const departmentName = selectedDept || "Department Portal";

  // State for the list of cards
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for the modal
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // Load cards from Firebase
  const loadCards = async () => {
    if (!orgId) return; // Don't load if no department is selected
    setLoading(true);
    try {
      const items = await listAllCards(orgId);
      setCards(items);
    } catch (error) {
      console.error('Error loading cards:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load cards on mount AND when the selectedDept changes
  useEffect(() => {
    loadCards();
  }, [orgId]); // orgId is now selectedDept

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
              <div className="text-xl font-bold text-gray-900">
                {departmentName}
              </div>
              <div className="text-xs text-gray-600">
                Manager View
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {manageableDepts.length > 1 && (
              <div className="relative">
                <select
                  value={selectedDept || ''}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="pl-3 pr-8 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md appearance-none"
                >
                  {manageableDepts.map(deptId => (
                    <option key={deptId} value={deptId}>
                      {deptId}
                    </option>
                  ))}
                </select>
                <ChevronsUpDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
            )}
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
        {/* Show a message if no department is assigned */}
        {!orgId && (
          <div className="text-center py-12 text-gray-500">
            <p>No department is assigned to your account.</p>
          </div>
        )}

        {/* Show the card management only if a department is selected */}
        {orgId && (
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
          </div>
        )}
      </div>

      {/* The Template Modal component */}
      <TemplatesModal
        orgId={orgId!}
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