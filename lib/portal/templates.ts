// lib/portal/templates.ts
import { db } from "@/lib/firebase/client";
import {
  collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp,
  updateDoc,
} from "firebase/firestore";

export type CardTemplate = {
  id: string;
  title: string;
  description?: string | null;
  status?: "active" | "disabled";
  heroImage?: string | null;     // NEW
  createdAt?: any;
  createdBy?: string | null;
};

const colPath = (orgId: string) => `orgs/${orgId}/cardTemplates`;

export async function listTemplates(orgId: string): Promise<CardTemplate[]> {
  const snap = await getDocs(collection(db, colPath(orgId)));
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
}

export async function createTemplate(
  orgId: string,
  data: { title: string; description?: string | null; heroImage?: string | null }
) {
  return addDoc(collection(db, colPath(orgId)), {
    title: data.title.trim(),
    description: (data.description || "").trim() || null,
    status: "active",
    createdAt: serverTimestamp(),
    createdBy: null,
  });
}

export async function updateTemplate(
  orgId: string,
  templateId: string,
  data: Partial<Omit<CardTemplate, "id" | "createdAt" | "createdBy">>
) {
  return updateDoc(doc(db, `${colPath(orgId)}/${templateId}`), data as any);
}

export async function deleteTemplate(orgId: string, templateId: string) {
  return deleteDoc(doc(db, `${colPath(orgId)}/${templateId}`));
}
