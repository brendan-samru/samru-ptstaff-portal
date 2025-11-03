"use client";
import { Fragment, useRef, useState, useEffect } from "react";
import {
  uploadToCard,
  deleteCard,
  Card,
  SubCard,
  listSubContent,
  deleteSubContent,
  // MODIFICATION: Import new function
  updateCardStatus
} from "@/lib/portal/cards";
import { FileText, Plus, Trash, X, Loader2, ChevronDown, ImageOff, Video, File, Presentation, FileSpreadsheet, EyeOff, Eye } from "lucide-react";
import { AddContentModal } from "./AddContentModal";
import { EditCardModal } from "./EditCardModal"; 

// ... (SubContentItem component remains the same) ...
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
        <div className="w-24 h-18 bg-gray-300 rounded-md overflow-hidden flex-shrink-0" style={{ aspectRatio: '4/3' }}>
          {subCard.heroImage ? (
            <img src={subCard.heroImage} alt={subCard.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full grid place-items-center">
              <ImageOff className="w-5 h-5 text-gray-500" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-800 truncate">{subCard.title}</h4>
          <p className="text-sm text-gray-600 line-clamp-2">{subCard.description || "No description."}</p>
        </div>
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
  return null;
}


// --- Main ContentList Component ---

export function ContentList({
  orgId = "samru",
  cards,
  onRefresh,
  userRole,
}: {
  orgId?: string;
  cards: Card[];
  onRefresh?: () => void;
  userRole?: string;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [modalCardId, setModalCardId] = useState<string | null>(null);
  const [subCards, setSubCards] = useState<Record<string, SubCard[]>>({});
  const [loadingSubCards, setLoadingSubCards] = useState<string | null>(null);
  const [localCards, setLocalCards] = useState<Card[]>(cards);
  const [editingCard, setEditingCard] = useState<Card | null>(null);

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

  // MODIFICATION: New "Publish/Unpublish" handler
  const handleToggleStatus = async (card: Card) => {
    const newStatus = card.status === 'active' ? 'draft' : 'active';
    const action = newStatus === 'active' ? 'Publish' : 'Unpublish';
    
    setBusy(`status-${card.id}`);
    try {
      await updateCardStatus(orgId, card.id, newStatus);
      // Update the card in the local list
      setLocalCards(prev => 
        prev.map(c => c.id === card.id ? { ...c, status: newStatus } : c)
      );
    } catch (error) {
      console.error(`Failed to ${action} card:`, error);
      alert(`Failed to ${action} card. Please try again.`);
    } finally {
      setBusy(null);
    }
  };

  // MODIFICATION: Updated Delete Handler with confirm step
  const handleDelete = async (cardId: string) => {
    const confirmed = window.confirm("Are you sure you want to permanently delete this card? This cannot be undone.");
    if (!confirmed) return;
    setBusy(`delete-${cardId}`);
    try {
      await deleteCard(orgId, cardId); // This is soft-delete
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

       {/* ADD THIS NEW MODAL */}
       <EditCardModal
           orgId={orgId}
           card={editingCard}
           open={!!editingCard}
           onClose={() => setEditingCard(null)}
           onRefresh={() => {
           setEditingCard(null);
           handleRefresh(); // Re-fetch all cards
           }}
       />
       {/* END OF NEW MODAL */}

      {localCards.map((card) => {
        const isPublished = card.status === 'active';
        return (
          <Fragment key={card.id}>
            <div className={`rounded-xl border ${isPublished ? 'border-gray-200' : 'border-blue-300 bg-blue-50'} p-4 shadow-sm`}>
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
                      isPublished ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>

                {/* MODIFICATION: Action buttons updated */}
                <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                  {/* --- ADD THIS BUTTON --- */}
                    {userRole === 'super_admin' && (
                        <button
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                        onClick={() => setEditingCard(card)}
                        disabled={!!busy}
                        title="Edit Card Details"
                        >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                        Edit
                        </button>
                    )}
                    {/* --- END OF NEW BUTTON --- */}
                  
                  <button
                    className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    onClick={() => handleAddContentClick(card.id)}
                    disabled={!!busy}
                    title="Add Content or Subcard"
                  >
                    <Plus className="w-4 h-4" />
                    Add Content
                  </button>

                  {/* NEW "Publish" Button */}
                  <button
                    onClick={() => handleToggleStatus(card)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm hover:bg-gray-50 disabled:opacity-50 ${
                      isPublished ? 'bg-white text-gray-700 border-gray-300' : 'bg-green-500 text-white border-green-500 hover:bg-green-600'
                    }`}
                    disabled={busy === `status-${card.id}`}
                    title={isPublished ? "Unpublish" : "Publish to portal"}
                  >
                    {busy === `status-${card.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : (isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />)}
                    <span>{isPublished ? 'Unpublish' : 'Publish'}</span>
                  </button>

                  <button
                    className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-sm"
                    onClick={() => handleDelete(card.id)}
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
        );
      })}
    </div>
  );
}