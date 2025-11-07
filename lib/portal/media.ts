'use client';

import { db, storage } from "@/lib/firebase/client";
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  query,
  orderBy
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

// This defines what a media item looks like
export type MediaItem = {
  id: string;
  name: string;
  url: string; // The public download URL
  storagePath: string; // The path in Firebase Storage (for deleting)
  createdAt: any;
};

// The path in Firestore to the media library
const mediaCol = collection(db, `orgs/samru/mediaLibrary`);

/**
 * Lists all items in the media library.
 */
export async function listMediaLibrary(): Promise<MediaItem[]> {
  const q = query(mediaCol, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
}

/**
 * Uploads a new file to the media library.
 */
export async function uploadToMediaLibrary(file: File) {
  // 1. Create a unique path in Storage
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `orgs/samru/mediaLibrary/${timestamp}_${sanitizedName}`;
  const storageRef = ref(storage, storagePath);

  // 2. Upload the file
  await uploadBytes(storageRef, file);

  // 3. Get the public download URL
  const downloadURL = await getDownloadURL(storageRef);

  // 4. Save the file info to Firestore
  await addDoc(mediaCol, {
    name: file.name,
    url: downloadURL,
    storagePath: storagePath,
    createdAt: serverTimestamp(),
  });
}

/**
 * Deletes an item from the media library (both Storage and Firestore).
 */
export async function deleteFromMediaLibrary(item: MediaItem) {
  // 1. Delete the file from Firebase Storage
  try {
    const storageRef = ref(storage, item.storagePath);
    await deleteObject(storageRef);
  } catch (error: any) {
    // A "not-found" error is ok, means the file was already gone
    if (error.code !== 'storage/object-not-found') {
      console.error("Error deleting file from storage:", error);
      throw error; // Re-throw if it's a real error
    }
  }

  // 2. Delete the document from Firestore
  const docRef = doc(db, `orgs/samru/mediaLibrary/${item.id}`);
  await deleteDoc(docRef);
}