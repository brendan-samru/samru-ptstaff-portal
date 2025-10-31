import { db, storage } from "@/lib/firebase/client";
import { 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  collection, 
  doc, 
  getDoc, 
  serverTimestamp,
  query,
  where,
  getDocs 
} from "firebase/firestore";
import { ref, listAll, deleteObject, uploadBytesResumable, getDownloadURL } from "firebase/storage";

// Card type (top-level card)
export type Card = {
  id: string;
  title: string | null;
  description?: string | null;
  heroImage?: string | null;
  labelCount?: number;
  status?: "live" | "disabled" | "draft";
  lastUpdated?: any;
  templateId?: string;
  deleted?: boolean;
};

// NEW: SubCard type
export type SubCard = {
  id: string;
  title: string;
  description?: string | null;
  heroImage?: string | null;
  createdAt?: any;
};

// --- Top-Level Card Functions ---

export async function listCards(orgId: string): Promise<Card[]> {
  const cardsRef = collection(db, `orgs/${orgId}/cards`);
  const q = query(cardsRef, where("deleted", "==", false)); 
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
}

export async function createCardFromTemplate(orgId: string, templateId: string) {
  const masterTemplateOrg = "samru";
  const t = (await getDoc(doc(db, `orgs/${masterTemplateOrg}/cardTemplates/${templateId}`))).data()!;
  
  const refDoc = await addDoc(collection(db, `orgs/${orgId}/cards`), {
    title: t.title, description: t.description, heroImage: t.heroImage || null,
    labelCount: 0, status: "live", lastUpdated: serverTimestamp(), templateId,
    deleted: false 
  });
  return refDoc.id;
}

export async function deleteCard(
  orgId: string,
  cardId: string,
  opts: { hard?: boolean } = {}
) {
  // Soft delete by default
  const cardRef = doc(db, `orgs/${orgId}/cards/${cardId}`);
  await updateDoc(cardRef, {
    deleted: true,
    deletedAt: serverTimestamp(),
    status: "disabled",
    lastUpdated: serverTimestamp(),
  });
  // Note: We're not doing hard deletes for this simple implementation
}

export async function updateCardDesc(orgId: string, cardId: string, description: string) {
  await updateDoc(doc(db, `orgs/${orgId}/cards/${cardId}`), {
    description, lastUpdated: serverTimestamp(),
  });
}

// This function is for uploading simple files (PDF, DOC, etc.)
export async function uploadToCard(orgId: string, cardId: string, file: File) {
  const key = crypto.randomUUID();
  const path = `orgs/${orgId}/cards/${cardId}/uploads/${key}/${file.name}`;
  const task = uploadBytesResumable(ref(storage, path), file, { contentType: file.type });
  await new Promise<void>((res, rej) => task.on("state_changed", undefined, rej, () => res()));
  // TODO: This should probably also create a "file" doc in a subcollection
  // For now, it just uploads the file.
}

// --- NEW: SubCard Functions ---

const subCardCollection = (orgId: string, cardId: string) => 
  collection(db, `orgs/${orgId}/cards/${cardId}/subcards`);

export async function listSubCards(orgId: string, cardId: string): Promise<SubCard[]> {
  const snap = await getDocs(subCardCollection(orgId, cardId));
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
}

export async function createSubCard(
  orgId: string, 
  cardId: string, 
  data: { title: string, description: string | null },
  imageFile: File | null
) {
  let imageUrl: string | null = null;

  // 1. If an image is provided, upload it first
  if (imageFile) {
    const key = crypto.randomUUID();
    const path = `orgs/${orgId}/cards/${cardId}/subcards/${key}/${imageFile.name}`;
    const storageRef = ref(storage, path);
    const task = uploadBytesResumable(storageRef, imageFile, { contentType: imageFile.type });
    await new Promise<void>((res, rej) => task.on("state_changed", undefined, rej, () => res()));
    imageUrl = await getDownloadURL(storageRef);
  }

  // 2. Create the SubCard document in Firestore
  const subCardData = {
    ...data,
    heroImage: imageUrl,
    createdAt: serverTimestamp(),
  };
  await addDoc(subCardCollection(orgId, cardId), subCardData);
}

export async function deleteSubCard(orgId: string, cardId: string, subCardId: string, heroImage: string | null) {
  // 1. Delete the Firestore document
  await deleteDoc(doc(db, `orgs/${orgId}/cards/${cardId}/subcards/${subCardId}`));

  // 2. If it had an image, delete it from Storage
  if (heroImage) {
    try {
      await deleteObject(ref(storage, heroImage));
    } catch (error: any) {
      if (error.code === 'storage/object-not-found') {
        console.warn("Storage object not found, deleting doc only.");
      } else {
        console.error("Error deleting storage file:", error);
      }
    }
  }
}