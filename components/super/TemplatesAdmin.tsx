// components/super/TemplatesAdmin.tsx
"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/client";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

type Template = {
  id: string;
  title: string;
  description?: string | null;
  status?: "active" | "disabled";
  createdAt?: any;
  createdBy?: string;
};

export function TemplatesAdmin({ orgId = "samru" }: { orgId?: string }) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  const load = async () => {
    const snap = await getDocs(collection(db, `orgs/${orgId}/cardTemplates`));
    setTemplates(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
  };

  useEffect(() => { load(); }, [orgId]);

  const create = async () => {
    if (!title.trim()) return;
    setBusy(true);
    try {
      await addDoc(collection(db, `orgs/${orgId}/cardTemplates`), {
        title: title.trim(),
        description: desc.trim() || null,
        status: "active",
        createdAt: serverTimestamp(),
        createdBy: "Super Admin",
      });
      setOpen(false);
      setTitle(""); setDesc("");
      await load();
    } finally { setBusy(false); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this template? This cannot be undone.")) return;
    await deleteDoc(doc(db, `orgs/${orgId}/cardTemplates/${id}`));
    await load();
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Manage Card Templates</h2>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#8BC53F] text-white hover:bg-[#65953B]"
        >
          + Add Template
        </button>
      </div>

      {/* list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map(t => (
          <div key={t.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="text-lg font-semibold">{t.title}</div>
                  {t.status !== "disabled" && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">
                      Active
                    </span>
                  )}
                </div>
                {t.description && (
                  <div className="text-sm text-gray-600 mt-1">{t.description}</div>
                )}
              </div>
              <button
                onClick={() => remove(t.id)}
                className="px-3 py-1.5 text-sm rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {templates.length === 0 && (
          <div className="text-sm text-gray-500">No templates yet.</div>
        )}
      </div>

      {/* modal */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center">
          <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="text-lg font-semibold">New Template</div>
              <button onClick={() => setOpen(false)} className="px-2 py-1 rounded hover:bg-gray-100">
                Close
              </button>
            </div>
            <div className="space-y-3">
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                className="w-full border rounded px-3 py-2"
                rows={3}
                placeholder="Description (optional)"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setOpen(false)} className="px-4 py-2 rounded border">
                  Cancel
                </button>
                <button
                  onClick={create}
                  disabled={busy || !title.trim()}
                  className="px-4 py-2 rounded bg-[#8BC53F] text-white disabled:opacity-50"
                >
                  {busy ? "Saving…" : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
