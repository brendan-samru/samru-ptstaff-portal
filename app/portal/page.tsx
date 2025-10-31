'use client';

import { useState, useEffect } from 'react';
import { FileText, HeartPulse, BookOpen, Book, LogOut, ArrowLeft, Play, Video, Presentation, FileSpreadsheet, File, Loader2, ChevronDown, ImageOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAnalytics } from '@/lib/analytics';
import { listActiveCards, Card, SubCard, listSubContent } from '@/lib/portal/cards'; // Import real card functions

// --- Sub-Component for displaying a SubCard or File ---
// This renders the "previews" for the portal users
function SubContentItem({ subCard }: { subCard: SubCard }) {
  
  // Render a Subcard
  if (subCard.type === 'subcard') {
    return (
      <a 
        href="#" // You'll need to decide where subcards link to
        className="block group"
      >
        <div className="relative w-full overflow-hidden rounded-lg border border-gray-200" style={{ aspectRatio: '4/3' }}>
          {subCard.heroImage ? (
            <img src={subCard.heroImage} alt={subCard.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
          ) : (
            <div className="w-full h-full grid place-items-center bg-gray-100">
              <ImageOff className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>
        <h4 className="font-semibold text-gray-800 truncate mt-2 group-hover:text-blue-600">{subCard.title}</h4>
        <p className="text-sm text-gray-600 line-clamp-2">{subCard.description || "No description."}</p>
      </a>
    );
  }

  // Render a File
  if (subCard.type === 'file') {
    let Icon = File;
    if (subCard.fileType === 'pdf') Icon = FileText;
    if (subCard.fileType === 'video') Icon = Video;
    if (subCard.fileType === 'ppt') Icon = Presentation;
    if (subCard.fileType === 'xls') Icon = FileSpreadsheet;

    return (
      <a 
        href={subCard.fileUrl || '#'} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block group"
      >
        <div className="relative w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100" style={{ aspectRatio: '4/3' }}>
          <div className="w-full h-full grid place-items-center">
            <Icon className="w-12 h-12 text-gray-500" />
          </div>
        </div>
        <h4 className="font-semibold text-gray-800 truncate mt-2 group-hover:text-blue-600">{subCard.title}</h4>
      </a>
    );
  }

  return null;
}


// --- Main Portal Home Component ---
function PortalHomeContent() {
  const { userData, logout, isSuperAdmin, isAdmin } = useAuth();
  const router = useRouter();
  const { trackView } = useAnalytics();

  // State for real cards
  const orgId = userData?.department || "default";
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State to hold sub-content
  const [subCards, setSubCards] = useState<Record<string, SubCard[]>>({});
  const [loadingSubCards, setLoadingSubCards] = useState<string | null>(null);


  useEffect(() => {
    // --- THIS IS THE FIX ---
    // Track portal home page view, but only if department is loaded
    if (userData && userData.department) {
    // --- END OF FIX ---
      trackView(
        userData.uid,
        userData.role,
        'portal-home',
        'Portal Home',
        userData.department
      );
    }
  }, [userData]);

  // Fetch real cards from Firestore
  useEffect(() => {
    if (!orgId || orgId === "default") { // Don't load if orgId is still the default
      setLoading(false);
      return;
    }
    
    setLoading(true);
    listActiveCards(orgId) // Only fetches active cards for this org
      .then(fetchedCards => {
        setCards(fetchedCards);
        setLoading(false);
      })
      .catch((error: any) => {
        console.error("Error fetching portal cards:", error);
        setLoading(false);
      });
  }, [orgId]);

  // Function to load sub-content
  const handleLoadSubContent = async (cardId: string) => {
    if (subCards[cardId]) {
      // Toggle visibility
      setSubCards(prev => ({...prev, [cardId]: undefined as any}));
      return;
    }
    setLoadingSubCards(cardId);
    try {
      const fetchedSubCards = await listSubContent(orgId, cardId);
      setSubCards(prev => ({ ...prev, [cardId]: fetchedSubCards }));
    } catch (error) {
      console.error("Error loading subcards:", error);
    } finally {
      setLoadingSubCards(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const getAdminDashboardLink = () => {
    if (isSuperAdmin) return '/super-admin';
    if (isAdmin) return '/admin';
    return null;
  };

  const adminLink = getAdminDashboardLink();

  return (
    <div className="min-h-screen">
      {/* Bubble Gradient Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-green-100/80 via-blue-100/60 to-white" />
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#8BC53F]/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-[#26A9E0]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-[#65953B]/15 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>
              samru
            </div>
            <div className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
              Staff Portal
            </div>
            {userData?.displayName && (
              <div className="ml-4 px-3 py-1 bg-[#8BC53F]/10 rounded-full">
                <span className="text-sm text-gray-700 font-medium">
                  {userData.displayName}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {adminLink && (
              <Link 
                href={adminLink}
                className="px-4 py-2 bg-[#26A9E0] text-white rounded-lg hover:bg-[#0D6537] transition-colors text-sm font-medium"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {isSuperAdmin ? 'Super Admin' : 'Admin Dashboard'}
              </Link>
            )}
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

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-12">
        <h1 
          className="text-5xl md:text-6xl font-bold text-gray-900 mb-4"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Welcome to Your Portal
        </h1>
        <p 
          className="text-xl text-gray-600 max-w-2xl"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Everything you need to succeed at SAMRU - training, resources, and support in one place.
        </p>
      </section>

      {/* MODIFICATION: This is now the dynamic card list, not mock categories */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        {loading ? (
          <div className="text-center py-16 text-gray-500">Loading your content...</div>
        ) : (
          <div className="space-y-12">
            {cards.map((card) => (
              <div key={card.id}>
                {/* --- This is the Main Card --- */}
                <div className="flex items-center gap-6">
                  <div className="w-48 h-36 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={card.heroImage || '/api/placeholder/400/300'} 
                      alt={card.title || 'Card Image'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3
                      className="text-2xl font-bold text-gray-900 mb-2"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {card.title || 'Untitled Card'}
                    </h3>
                    <p
                      className="text-gray-600 text-base mb-4"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {card.description || 'No description available.'}
                    </p>
                    <button 
                      className="flex items-center gap-2 text-sm text-blue-500 font-medium"
                      onClick={() => handleLoadSubContent(card.id)}
                      disabled={loadingSubCards === card.id}
                    >
                      {loadingSubCards === card.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ChevronDown className={`w-4 h-4 transition-transform ${subCards[card.id] ? 'rotate-180' : ''}`} />
                      )}
                      {subCards[card.id] ? 'Hide Content' : 'Show Content'}
                    </button>
                  </div>
                </div>

                {/* --- This is the Sub-Content Grid --- */}
                {subCards[card.id] && (
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {subCards[card.id].length === 0 && (
                      <p className="text-sm text-gray-500 py-2 col-span-full">No content items found for this card.</p>
                    )}
                    {subCards[card.id].map(sub => (
                      <SubContentItem key={sub.id} subCard={sub} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && cards.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
             <h3 
              className="text-xl font-bold text-gray-900 mb-2"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              No content found
            </h3>
            <p 
              className="text-gray-600"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              There are no items available for this department.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default function PortalHomePage() {
  return (
    <ProtectedRoute>
      <PortalHomeContent />
    </ProtectedRoute>
  );
}