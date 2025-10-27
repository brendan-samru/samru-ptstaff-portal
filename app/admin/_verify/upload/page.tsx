"use client";
import { useState } from "react";
import { uploadToCard } from "@/lib/portal/cards";

export default function Page() {
  const [orgId, setOrg] = useState("samru");     // change if needed
  const [cardId, setCard] = useState("");        // paste a card id
  const [file, setFile] = useState<File|null>(null);

  return (
    <div className="p-6 max-w-md space-y-3">
      <input className="border p-2 w-full" placeholder="orgId" value={orgId} onChange={e=>setOrg(e.target.value)} />
      <input className="border p-2 w-full" placeholder="cardId" value={cardId} onChange={e=>setCard(e.target.value)} />
      <input type="file" onChange={e=>setFile(e.target.files?.[0]||null)} />
      <button className="px-4 py-2 rounded bg-black text-white" disabled={!file || !cardId}
        onClick={async()=>{ if(!file) return; await uploadToCard(orgId, cardId, file); alert("Uploaded"); }}>
        Upload to Card
      </button>
      <p className="text-sm text-gray-500">After upload, your function should add a file doc and bump the card label.</p>
    </div>
  );
}
