// lib/portal/content.ts
import { db, storage } from "@/lib/firebase/client";
import {
  collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";

export type ContentItem = {
  id: string;
  title: string;
  url: string;
  type: 'video' | 'pdf' | 'document';
  createdAt?: any;
};

const colPath = (department: string) => `content/${department}/items`;

// List all content for a department
export async function listContent(department: string): Promise<ContentItem[]> {
  const snap = await getDocs(collection(db, colPath(department)));
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
}

// Add a new piece of content
export async function addContent(
  department: string,
  data: { url: string; title: string; type: 'video' | 'pdf' | 'document' }
) {
  return addDoc(collection(db, colPath(department)), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

// Delete a piece of content (from Firestore AND Storage)
export async function deleteContent(department: string, contentId: string, fileUrl: string) {
  try {
    // 1. Delete the file from Firebase Storage
    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
    
    // 2. Delete the document from Firestore
    await deleteDoc(doc(db, colPath(department), contentId));
  } catch (error: any) {
    // Handle cases where the file might not exist in storage but the DB entry does
    if (error.code === 'storage/object-not-found') {
      console.warn("File not found in storage, deleting database entry only.");
      await deleteDoc(doc(db, colPath(department), contentId));
    } else {
      console.error("Error deleting content:", error);
      throw error;
    }
  }
}