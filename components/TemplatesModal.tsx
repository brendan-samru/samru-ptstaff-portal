"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/client";
import { collection, getDocs } from "firebase/firestore";
import { createCardFromTemplate } from "@/lib/portal/cards";

// Use the CardTemplate type from your templates library
import { CardTemplate } from "@/lib/portal/templates";

export function TemplatesModal({
  orgId = "samru",
  open,
  onClose,
  onCreated, // optional: refetch cards after create
}: {
  orgId?: string;
  open: boolean;
  onClose: () => void;
  onCreated?: (cardId: string) => void;
}) {
  const [templates, setTemplates] = useState<CardTemplate[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    (async () => {
      // --- THIS IS THE FIX ---
      // Always fetch templates from the "samru" (super-admin) folder
      const masterTemplateOrg = "samru";
      const snap = await getDocs(collection(db, `orgs/${masterTemplateOrg}/cardTemplates`));
      // --- END OF FIX ---

      setTemplates(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    })();
  }, [open]); // We no longer need orgId as a dependency here

  const handleChoose = async (templateId: string) => {
    setBusyId(templateId);
    try {
      const cardId = await createCardFromTemplate(orgId, templateId);
      onCreated?.(cardId);
      onClose();
    } finally {
      setBusyId(null);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Choose a Card Template</h2>
          <button 
            className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-md" 
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="space-y-3 max-h-[60vh] overflow-auto pr-2">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => handleChoose(t.id)}
              disabled={!!busyId}
              className="w-full text-left border rounded-lg p-3 hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-start gap-4"
            >
              {/* Small image on the left */}
              <div className="w-20 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                {t.heroImage ? (
                  <img src={t.heroImage} alt={t.title || ""} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full grid place-items-center text-xs text-gray-400">No img</div>
                )}
              </div>
              
              {/* Title and Description on the right */}
              <div className="flex-1">
                <div className="font-semibold text-lg text-gray-900">
                  {busyId === t.id ? "Creating..." : (t.title || "Untitled")}
                </div>
                {t.description && (
                  <div 
                    className="text-sm text-gray-600 line-clamp-2" 
                    dangerouslySetInnerHTML={{ __html: t.description }} 
                  />
                )}
              </div>
            </button>
          ))}
          {templates.length === 0 && (
            <div className="text-sm text-center text-gray-600 py-8">No templates found.</div>
          )}
        </div>
      </div>
    </div>
  );
}