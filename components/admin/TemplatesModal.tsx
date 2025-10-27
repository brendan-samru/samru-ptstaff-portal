"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/client";
import { collection, getDocs } from "firebase/firestore";
import { createCardFromTemplate } from "@/lib/portal/cards";

type Template = { id: string; title: string; description?: string; heroImage?: string; };

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
  const [templates, setTemplates] = useState<Template[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    (async () => {
      const snap = await getDocs(collection(db, `orgs/${orgId}/cardTemplates`));
      setTemplates(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    })();
  }, [open, orgId]);

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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="w-full max-w-lg rounded-xl bg-white p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Choose a Card Template</h2>
          <button className="px-2 py-1 rounded" onClick={onClose}>Close</button>
        </div>
        <div className="space-y-2 max-h-[60vh] overflow-auto">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => handleChoose(t.id)}
              disabled={busyId === t.id}
              className="w-full text-left border rounded-lg p-3 hover:bg-gray-50"
            >
              <div className="font-medium">{t.title}</div>
              {t.description && (
                <div className="text-sm text-gray-600 line-clamp-2">{t.description}</div>
              )}
            </button>
          ))}
          {templates.length === 0 && (
            <div className="text-sm text-gray-600">No templates yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
