"use client";
import { Fragment, useRef, useState, useEffect } from "react";
import {
  uploadToCard,
  updateCardDesc,
  // MODIFICATION: Removed 'disableCard' from this import
  deleteCard,
  Card,
  SubCard,
  listSubCards,
  deleteSubCard
} from "@/lib/portal/cards";
import { FileText, Plus, Trash, Edit, X, Loader2, ChevronDown, ImageOff } from "lucide-react";
import { AddContentModal } from "./AddContentModal"; // Or '@/components/AddContentModal'

// --- Sub-Component for displaying a SubCard ---
// MOVED TO TOP to fix 'Cannot find name' error
function SubCardItem({ 
  subCard, 
  onDelete,
  busy
} : { 
  subCard: SubCard, 
  onDelete: () => void,
  busy: boolean
}) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-100 rounded-lg">
      {/* 4:3 Image on the left */}
      <div className="w-24 h-18 bg-gray-300 rounded-md overflow-hidden flex-shrink-0" style={{ aspectRatio: '4/3' }}>
        {subCard.heroImage ? (
          <img src={subCard.heroImage} alt={subCard.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid place-items-center">
            <ImageOff className="w-5 h-5 text-gray-500" />
          </div>
        )}
      </div>

      {/* Headline (Title) and Content (Description) on the right */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-800 truncate">{subCard.title}</h4>
        <p className="text-sm text-gray-600 line-clamp-2">{subCard.description || "No description."}</p>
      </div>
      
      {/* Delete button for the subcard */}
      <button 
        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded-full"
        onClick={onDelete}
        disabled={busy}
        title="Delete Subcard"
      >
        {busy ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <X className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}


// --- Main ContentList Component ---

export function ContentList({
  orgId = "samru",
  cards,
  onRefresh,
}: {
  orgId?: string;
  cards: Card[];
  onRefresh?: () => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  
  // State for the new modal
  const [modalCardId, setModalCardId] = useState<string | null>(null);

  // State to hold fetched subcards
  const [subCards, setSubCards] = useState<Record<string, SubCard[]>>({});
  const [loadingSubCards, setLoadingSubCards] = useState<string | null>(null);

  const handleRefresh = () => {
    // Also clear subcard cache
    setSubCards({});
    onRefresh?.();
  };

  // 1) Open the new "Add Content" Modal
  const handleAddContentClick = (cardId: string) => {
    setModalCardId(cardId);
  };
  
  // 2) Load Subcards for a Card
  const handleLoadSubCards = async (cardId: string) => {
    // If already loaded, just toggle (or do nothing)
    if (subCards[cardId]) {
      // Optional: toggle visibility by setting subCards[cardId] to undefined
      return;
    }
    setLoadingSubCards(cardId);
    try {
      const fetchedSubCards = await listSubCards(orgId, cardId);
      setSubCards(prev => ({ ...prev, [cardId]: fetchedSubCards }));
    } catch (error) {
      console.error("Error loading subcards:", error);
    } finally {
      setLoadingSubCards(null);
    }
  };

  // MODIFICATION: Removed the unused 'handleDisable' function
  // const handleDisable = ...

  // 3) Delete Top-Level Card
  const handleDelete = async (cardId: string) => {
    if (!confirm("Are you sure you want to delete this card? This will also delete all its content and subcards.")) return;
    setBusy(`delete-${cardId}`);
    try {
      // This function (deleteCard) already sets status to "disabled"
      await deleteCard(orgId, cardId);
      handleRefresh();
    } finally {
      setBusy(null);
    }
  };
  
  // 4) Delete a Subcard
  const handleDeleteSubCard = async (cardId: string, subCard: SubCard) => {
     if (!confirm(`Delete the subcard "${subCard.title}"?`)) return;
     setBusy(`delete-sub-${subCard.id}`);
     try {
       await deleteSubCard(orgId, cardId, subCard.id, subCard.heroImage || null);
       // Refresh just this card's list
       // We must clear the cache first to force a re-fetch
       setSubCards(prev => ({ ...prev, [cardId]: undefined as any })); // Clear cache
       await handleLoadSubCards(cardId); // Re-fetch
     } catch (error) {
       console.error("Error deleting subcard:", error);
     } finally {
       setBusy(null);
     }
  };

  return (
    <div className="space-y-4">
      {/* The modal is now here, rendered once */}
      <AddContentModal
        orgId={orgId}
        cardId={modalCardId}
        open={!!modalCardId}
        onClose={() => setModalCardId(null)}
        onRefresh={() => {
          // Refresh the main list
          handleRefresh();
          // Also, re-load the subcards for the card we just modified
          if (modalCardId) {
             // Clear cache first
            setSubCards(prev => ({ ...prev, [modalCardId]: undefined as any }));
            handleLoadSubCards(modalCardId);
          }
        }}
      />

      {cards.map((card) => (
        <Fragment key={card.id}>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            {/* Card Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                {/* Card Image */}
                <div className="w-24 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  {card.heroImage ? (
                    <img src={card.heroImage} alt={card.title || ""} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full grid place-items-center">
                      <FileText className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                {/* Card Title/Desc */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{card.title || "Untitled Card"}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {card.description ?? "No description."}
                  </p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-2 inline-block ${
                    card.status === 'live' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {card.status}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                <button
                  className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  onClick={() => handleAddContentClick(card.id)}
                  disabled={!!busy}
                  title="Add Content or Subcard"
                >
                  <Plus className="w-4 h-4" />
                  Add...
                </button>

                <button
                  className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-sm"
                  onClick={() => handleDelete(card.id)}
                  disabled={busy === `delete-${card.id}`}
                  title="Delete Card"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Subcard/Content Area */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              {/* Button to load content */}
              {!subCards[card.id] && (
                <button 
                  className="flex items-center gap-2 text-sm text-blue-500 font-medium"
                  onClick={() => handleLoadSubCards(card.id)}
                  disabled={loadingSubCards === card.id}
                >
                  {loadingSubCards === card.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  Show Content & Subcards
                </button>
              )}
              
              {/* List of Subcards */}
              {subCards[card.id] && (
                <div className="space-y-3">
                  {subCards[card.id].length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-2">No subcards added yet.</p>
                  )}
                  {subCards[card.id].map(sub => (
                    <SubCardItem 
                      key={sub.id} 
                      subCard={sub} 
                      onDelete={() => handleDeleteSubCard(card.id, sub)}
                      busy={busy === `delete-sub-${sub.id}`}
                    />
                  ))}
                </div>
              )}
            </div>
            
          </div>
        </Fragment>
      ))}
    </div>
  );
}