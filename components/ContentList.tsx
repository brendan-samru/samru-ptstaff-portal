"use client";
import { Fragment, useRef, useState, useEffect } from "react";
import {
  uploadToCard,
  updateCardDesc,
  disableCard,
  deleteCard,
  Card,
  SubCard,
  listSubContent,
  deleteSubContent
} from "@/lib/portal/cards";
import { FileText, Plus, Trash, X, Loader2, ChevronDown, ImageOff, Video, File, Presentation, FileSpreadsheet, EyeOff } from "lucide-react";
import { AddContentModal } from "./AddContentModal"; // Or '@/components/AddContentModal'

// --- Sub-Component for displaying a SubCard or File ---
function SubContentItem({ 
  subCard, 
  onDelete,
  busy
} : { 
  subCard: SubCard, 
  onDelete: () => void,
  busy: boolean
}) {
  // Render a Subcard
  if (subCard.type === 'subcard') {
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
        {/* Delete button */}
        <button 
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded-full"
          onClick={onDelete}
          disabled={busy}
          title="Delete Subcard"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" /> }
        </button>
      </div>
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
      <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
        {/* Show image preview if fileType is 'image' */}
        <div className="w-16 h-12 bg-gray-300 rounded-md overflow-hidden flex-shrink-0" style={{ aspectRatio: '4/3' }}>
          {subCard.fileType === 'image' && subCard.fileUrl ? (
            <img src={subCard.fileUrl} alt={subCard.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full grid place-items-center">
              <Icon className="w-6 h-6 text-gray-500" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <a 
            href={subCard.fileUrl || '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-medium text-blue-600 hover:underline truncate"
          >
            {subCard.title}
          </a>
        </div>
        {/* Delete button */}
        <button 
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded-full"
          onClick={onDelete}
          disabled={busy}
          title="Delete File"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" /> }
        </button>
      </div>
    );
  }

  return null; // Should not happen
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
  const [modalCardId, setModalCardId] = useState<string | null>(null);
  const [subCards, setSubCards] = useState<Record<string, SubCard[]>>({});
  const [loadingSubCards, setLoadingSubCards] = useState<string | null>(null);
  const [localCards, setLocalCards] = useState<Card[]>(cards);

  useEffect(() => {
    setLocalCards(cards);
  }, [cards]);

  const handleRefresh = () => {
    setSubCards({});
    onRefresh?.();
  };

  const handleAddContentClick = (cardId: string) => {
    setModalCardId(cardId);
  };
  
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

  const handleDisable = async (cardId: string) => {
    const confirmed = window.confirm("Disable this card? It’ll disappear from staff view but can be re-enabled.");
    if (!confirmed) return;
    setBusy(`disable-${cardId}`);
    try {
      await disableCard(orgId, cardId);
      setLocalCards(prev => prev.filter(c => c.id !== cardId));
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = async (cardId: string) => {
    const confirmed = window.confirm("Are you sure you want to permanently delete this card? This cannot be undone.");
    if (!confirmed) return;
    setBusy(`delete-${cardId}`);
    try {
      await deleteCard(orgId, cardId);
      setLocalCards(prev => prev.filter(c => c.id !== cardId));
    } finally {
      setBusy(null);
    }
  };
  
  const handleDeleteSubContent = async (cardId: string, subCard: SubCard) => {
     if (!confirm(`Delete "${subCard.title}"?`)) return;
     setBusy(`delete-sub-${subCard.id}`);
     try {
       await deleteSubContent(orgId, cardId, subCard);
       setSubCards(prev => ({ ...prev, [cardId]: undefined as any })); // Clear cache
       await handleLoadSubContent(cardId); // Re-fetch
     } catch (error) {
       console.error("Error deleting subcard:", error);
     } finally {
       setBusy(null);
     }
  };

  return (
    <div className="space-y-4">
      <AddContentModal
        orgId={orgId}
        cardId={modalCardId}
        open={!!modalCardId}
        onClose={() => setModalCardId(null)}
        onRefresh={() => {
          handleRefresh();
          if (modalCardId) {
            setSubCards(prev => ({ ...prev, [modalCardId]: undefined as any }));
            handleLoadSubContent(modalCardId);
          }
        }}
      />

      {localCards.map((card) => (
        <Fragment key={card.id}>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            {/* Card Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="w-24 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  {card.heroImage ? (
                    <img src={card.heroImage} alt={card.title || ""} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full grid place-items-center">
                      <FileText className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{card.title || "Untitled Card"}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {card.description ?? "No description."}
                  </p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-2 inline-block ${
                    card.status === 'live' || card.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
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
                  Add Content
                </button>
                <button
                  onClick={() => handleDisable(card.id)}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 text-sm"
                  // --- THIS IS THE FIX ---
                  disabled={busy === `disable-${card.id}`}
                  title="Disable (hide without deleting)"
                >
                  {busy === `disable-${card.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-sm"
                  onClick={() => handleDelete(card.id)}
                  // --- THIS IS THE FIX ---
                  disabled={busy === `delete-${card.id}`}
                  title="Delete permanently"
                >
                  {busy === `delete-${card.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            {/* Subcard/Content Area */}
            <div className="mt-4 pt-4 border-t border-gray-200">
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
                {subCards[card.id] ? 'Hide Content' : 'Show Content & Subcards'}
              </button>
              
              {/* List of Subcards and Files */}
              {subCards[card.id] && (
                <div className="space-y-3 mt-3">
                  {subCards[card.id].length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-2">No content or subcards added yet.</p>
                  )}
                  {subCards[card.id].map(sub => (
                    <SubContentItem 
                      key={sub.id} 
                      subCard={sub} 
                      onDelete={() => handleDeleteSubContent(card.id, sub)}
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