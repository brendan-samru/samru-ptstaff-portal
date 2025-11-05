'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from "@/components/ProtectedRoute"; // Import security
import { LogOut, FileText, Loader2 } from 'lucide-react';

import { listActiveCards, Card } from '@/lib/portal/cards';
import { PortalCard } from '@/components/PortalCard';
import { PortalSubContentModal } from '@/components/PortalSubContentModal';

// This is the main content of the portal, now secure
function PortalContent() {
  const { userData, logout } = useAuth();
  const router = useRouter();

  // This will hold the department we need to load
  // For staff, this comes from their user profile
  const departmentId = userData?.department;

  // State for cards and loading
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  // This effect handles user roles
  useEffect(() => {
    if (!userData) return; // Wait for user data to load

    // 1. If user is an admin, they shouldn't be here.
    //    Send them to the admin page to use the department switcher.
    if (userData.role === 'admin' || userData.role === 'super_admin') {
      router.push('/admin');
      return; // Stop running code
    }

    // 2. If user is staff but has no department, they can't see anything.
    if (userData.role === 'staff' && !departmentId) {
      setLoading(false);
      setCards([]); // Set to empty
      return;
    }
    
  }, [userData, departmentId, router]);

  // This effect runs to fetch cards for the staff member's department
  useEffect(() => {
    if (!departmentId) {
      setLoading(false);
      return; 
    }
    
    setLoading(true);
    listActiveCards(departmentId) // Fetch using the staff member's department
      .then(items => {
        setCards(items);
      })
      .catch(err => {
        console.error("Error loading active cards:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [departmentId]); // Re-run if departmentId changes

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen">
      {/* Gradient Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-green-100/80 via-blue-100/60 to-white" />
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#8BC53F]/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-[#26A9E0]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-[#65953B]/15 rounded-full blur-3xl" />
        <div className="absolute bottom-40 right-1/4 w-72 h-72 bg-[#0D6537]/15 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="font-bold text-xl text-gray-900">samru</div>
            <nav className="flex items-center gap-2">
              <a href="/portal" className="px-3 py-1 bg-gray-100 text-gray-900 rounded-md text-sm font-medium">
                Staff Portal
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-5xl font-bold text-gray-900">
          Welcome to Your Portal
        </h1>
        <p className="text-xl text-gray-600 mt-2">
          Everything you need to succeed at SAMRU - training, resources, and support in one place.
        </p>

        {/* Card Grid Section */}
        <div className="mt-12">
          {loading && (
            <div className="text-center py-16 text-gray-500 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <p>Loading...</p>
            </div>
          )}

          {!loading && cards.length === 0 && (
            <div className="text-center py-16 text-gray-500 bg-white rounded-lg shadow-sm border border-gray-100">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">No content found</p>
              <p>There are no items available for this department.</p>
            </div>
          )}

          {!loading && cards.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {cards.map(card => (
                <PortalCard 
                  key={card.id} 
                  card={card} 
                  onClick={() => setSelectedCard(card)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal (only renders if departmentId exists) */}
      {departmentId && (
        <PortalSubContentModal
          open={!!selectedCard}
          onClose={() => setSelectedCard(null)}
          card={selectedCard}
          orgId={departmentId}
        />
      )}
    </div>
  );
}


// This is the new page export that wraps our content in security
export default function PortalPage() {
  return (
    // This will require a user to be logged in to see this page at all
    <ProtectedRoute>
      <PortalContent />
    </ProtectedRoute>
  );
}