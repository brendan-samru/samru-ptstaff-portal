"use client";
import { useState } from "react";
import { setUserRole } from "@/lib/portal/roles";

export default function Page() {
  const [uid, setUid] = useState(""); const [role, setRole] = useState<"manager"|"superadmin">("manager");
  return (
    <div className="p-6 max-w-md space-y-3">
      <input className="border p-2 w-full" placeholder="UID" value={uid} onChange={e=>setUid(e.target.value)} />
      <select className="border p-2 w-full" value={role} onChange={e=>setRole(e.target.value as any)}>
        <option value="manager">manager</option><option value="superadmin">superadmin</option>
      </select>
      <button className="px-4 py-2 rounded bg-black text-white" onClick={async()=>{ await setUserRole(uid, role); alert("Role set"); }}>
        Set Role
      </button>
      <p className="text-sm text-gray-500">Get UID from Firebase Console → Authentication → Users.</p>
    </div>
  );
}
