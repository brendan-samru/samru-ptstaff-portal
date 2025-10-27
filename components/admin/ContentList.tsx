"use client";
import { useRef, useState } from "react";
import {
  uploadToCard,
  updateCardDesc,
  disableCard,
  deleteCard,
} from "@/lib/portal/cards";

type Card = {
  id: string;
  title: string;
  description?: string;
  labelCount?: number;
  status?: "live" | "disabled" | "draft";
  lastUpdated?: any;
  // ...whatever else you already have
};

export default function ContentList({
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
      await uploadToCard(orgId, uploadForCard, file);
      onRefresh?.();
    } finally {
      setBusy(null);
      setUploadForCard(null);
      e.target.value = ""; // reset input
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
    if (!confirm("Delete this card? This cannot be undone.")) return;
    setBusy(`delete-${cardId}`);
    try {
      await deleteCard(orgId, cardId);
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
      />

      {cards.map((card) => (
        <div key={card.id} className="rounded-xl border p-4">
          {/* Your existing header/metrics UI stays as-is */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{card.title}</h3>
              <p className="text-sm text-gray-600">
                {card.description ?? "—"}
              </p>
            </div>

            {/* Right-side action buttons (use your existing buttons/styles) */}
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1 rounded"
                onClick={() => handleAddContentClick(card.id)}
                disabled={busy?.startsWith("upload-")}
                title="Add Content"
              >
                Add Content
              </button>

              <button
                className="px-3 py-1 rounded"
                onClick={() =>
                  handleDisable(card.id)
                }
                disabled={busy === `disable-${card.id}`}
                title="Disable"
              >
                Disable
              </button>

              <button
                className="px-3 py-1 rounded"
                onClick={() => handleDelete(card.id)}
                disabled={busy === `delete-${card.id}`}
                title="Delete"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Minimal inline description editor (if you want it) */}
          <InlineDescEditor
            initial={card.description ?? ""}
            onSave={(val) => handleSaveDesc(card.id, val)}
            saving={busy === `desc-${card.id}`}
          />
        </div>
      ))}
    </div>
  );
}

/** Tiny, style-safe inline editor. Replace with your component if you already have one. */
function InlineDescEditor({
  initial,
  onSave,
  saving,
}: {
  initial: string;
  onSave: (val: string) => Promise<void>;
  saving: boolean;
}) {
  const [val, setVal] = useState(initial);
  return (
    <div className="mt-3 flex items-center gap-2">
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="w-full border rounded px-2 py-1"
        placeholder="Description"
      />
      <button
        className="px-3 py-1 rounded"
        onClick={() => onSave(val)}
        disabled={saving}
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
