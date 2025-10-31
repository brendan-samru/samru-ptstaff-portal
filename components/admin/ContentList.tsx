"use client";
import { useRef, useState } from "react";
import {
  uploadToCard,
  updateCardDesc,
  disableCard,
  deleteCard,
  Card, // Make sure 'Card' is exported from your cards.ts file
} from "@/lib/portal/cards";
import { FileText, Plus, Trash, Edit, X } from "lucide-react"; // Example icons

export function ContentList({
  orgId = "samru",
  cards,
  onRefresh, // optional: parent can refetch after actions
}: {
  orgId?: string;
  cards: Card[];
  onRefresh?: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadForCard, setUploadForCard] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  // 1) Add Content
  const handleAddContentClick = (cardId: string) => {
    setUploadForCard(cardId);
    fileInputRef.current?.click();
  };
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadForCard) return;
    setBusy(`upload-${uploadForCard}`);
    try {
      // This function handles the file upload
      await uploadToCard(orgId, uploadForCard, file);
      onRefresh?.();
    } finally {
      setBusy(null);
      setUploadForCard(null);
      if (e.target) e.target.value = ""; // reset input
    }
  };

  // 2) Edit description (inline example)
  const handleSaveDesc = async (cardId: string, description: string) => {
    setBusy(`desc-${cardId}`);
    try {
      await updateCardDesc(orgId, cardId, description);
      onRefresh?.();
    } finally {
      setBusy(null);
    }
  };

  // 3) Disable / Delete
  const handleDisable = async (cardId: string) => {
    setBusy(`disable-${cardId}`);
    try {
      await disableCard(orgId, cardId);
      onRefresh?.();
    } finally {
      setBusy(null);
    }
  };
  const handleDelete = async (cardId: string) => {
    if (!confirm("Are you sure you want to delete this card? This cannot be undone.")) return;
    setBusy(`delete-${cardId}`);
    try {
      await deleteCard(orgId, cardId); // Uses soft-delete by default
      onRefresh?.();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Hidden file input used by all “Add Content” buttons */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        // Allow all file types you mentioned
        accept="application/pdf,image/*,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,video/*"
      />

      {cards.map((card) => (
        <div key={card.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          {/* Card Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
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
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{card.title || "Untitled Card"}</h3>
                <p className="text-sm text-gray-600">
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
                disabled={busy?.startsWith("upload-")}
                title="Add Content"
              >
                <Plus className="w-4 h-4" />
                Add Content
              </button>

              <button
                className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-sm"
                onClick={() => handleDelete(card.id)}
                disabled={busy === `delete-${card.id}`}
                title="Delete"
              >
                <Trash className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
          
          {/* TODO: Add subcard management UI here */}
          
        </div>
      ))}
    </div>
  );
}