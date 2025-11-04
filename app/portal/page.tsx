'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { LogOut, FileText, Loader2 } from 'lucide-react';

// Import the function to fetch cards and the Card type
import { listActiveCards, Card } from '@/lib/portal/cards';
// Import our new component
import { PortalCard } from '@/components/PortalCard';

export default function PortalPage() {
  const { userData, logout } = useAuth();
  const router = useRouter();
  
  // Get the department ID from the logged-in user
  const orgId = userData?.department;
  const departmentName = userData?.department || 'SAMRU Staff Portal';

  // State for cards and loading
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch cards on component mount
  useEffect(() => {
    // Only fetch if we have an orgId
    if (!orgId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    listActiveCards(orgId)
      .then(items => {
        setCards(items);
      })
      .catch(err => {
        console.error("Error loading active cards:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [orgId]); // Re-run if orgId changes

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Check if user is an admin to show the admin buttons
  const isAdmin = userData?.role === 'admin' || userData?.role === 'super_admin';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="font-bold text-xl text-gray-900">samru</div>
            <nav className="flex items-center gap-2">
              <a href="/portal" className="px-3 py-1 bg-gray-100 text-gray-900 rounded-md text-sm font-medium">
                Staff Portal
              </a>
              {isAdmin && (
                <a href="/admin" className="px-3 py-1 text-gray-500 hover:bg-gray-100 rounded-md text-sm font-medium">
                  Manager
                </a>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <button 
                onClick={() => router.push('/admin')} 
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600"
              >
                Admin Dashboard
              </button>
            )}
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
              <p>Loading content...</p>
            </div>
          )}

          {!loading && cards.length === 0 && (
            <div className="text-center py-16 text-gray-500 bg-white rounded-lg shadow-sm border border-gray-100">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">No content found</p>
              <p>There are no items available for this department.</p>
              {isAdmin && (
                <p className="mt-4">
                  Go to the{' '}
                  <a href="/admin" className="text-blue-500 font-medium hover:underline">
                    Admin Dashboard
                  </a>{' '}
                  to publish a card.
                </p>
              )}
            </div>
          )}

          {!loading && cards.length > 0 && (
            /* This is the 4-column grid you asked for */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {cards.map(card => (
                <PortalCard key={card.id} card={card} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}