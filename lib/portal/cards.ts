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

// MODIFICATION: Merged Card type with new status and timestamps
export type Card = {
  id: string;
  title: string | null;
  description?: string | null;
  heroImage?: string | null;
  labelCount?: number;
  status?: "active" | "disabled" | "archived" | "draft" | "live"; // Merged statuses
  lastUpdated?: any;
  updatedAt?: any; // Added
  createdAt?: any; // Added
  templateId?: string;
  deleted?: boolean;
  disabledAt?: any;
  disabledBy?: string;
  disabledReason?: string | null;
  enabledAt?: any;
  enabledBy?: string;
};

// SubCard type (unchanged)
export type SubCard = {
  id: string;
  title: string;
  description?: string | null;
  heroImage?: string | null;
  createdAt?: any;
};

// --- Top-Level Card Functions ---

// This function lists *all* non-deleted cards (good for a full admin view)
export async function listCards(orgId: string): Promise<Card[]> {
  const cardsRef = collection(db, `orgs/${orgId}/cards`);
  const q = query(cardsRef, where("deleted", "==", false)); 
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
}

// NEW: Function to list *only* active cards (for staff portal)
export async function listActiveCards(orgId: string): Promise<Card[]> {
  const col = collection(db, `orgs/${orgId}/cards`);
  const q = query(col, 
    where("status", "==", "active"),
    where("deleted", "==", false) // Also check for deleted
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Card, "id">) }));
}


export async function createCardFromTemplate(orgId: string, templateId: string) {
  const masterTemplateOrg = "samru";
  const t = (await getDoc(doc(db, `orgs/${masterTemplateOrg}/cardTemplates/${templateId}`))).data()!;
  
  const refDoc = await addDoc(collection(db, `orgs/${orgId}/cards`), {
    title: t.title, description: t.description, heroImage: t.heroImage || null,
    labelCount: 0, 
    templateId,
    deleted: false,
    // MODIFICATION: Added status and timestamps
    status: "active",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastUpdated: serverTimestamp(), // Keep this for compatibility
  });
  return refDoc.id;
}

// ... deleteCard, updateCardDesc, uploadToCard functions (unchanged) ...

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
    updatedAt: serverTimestamp(),
    lastUpdated: serverTimestamp(),
  });
}

export async function updateCardDesc(orgId: string, cardId: string, description: string) {
  await updateDoc(doc(db, `orgs/${orgId}/cards/${cardId}`), {
    description, 
    updatedAt: serverTimestamp(),
    lastUpdated: serverTimestamp(),
  });
}

export async function uploadToCard(orgId: string, cardId: string, file: File) {
  const key = crypto.randomUUID();
  const path = `orgs/${orgId}/cards/${cardId}/uploads/${key}/${file.name}`;
  const task = uploadBytesResumable(ref(storage, path), file, { contentType: file.type });
  await new Promise<void>((res, rej) => task.on("state_changed", undefined, rej, () => res()));
}


// --- NEW: Disable / Enable Helpers ---

/** Hide a card without deleting it */
export async function disableCard(orgId: string, cardId: string, by?: string, reason?: string) {
  const ref = doc(db, `orgs/${orgId}/cards/${cardId}`);
  await updateDoc(ref, {
    status: "disabled",
    disabledAt: serverTimestamp(),
    disabledBy: by ?? "system",
    disabledReason: reason ?? null,
    updatedAt: serverTimestamp(),
  });
}

/** Bring a disabled card back */
export async function enableCard(orgId: string, cardId: string, by?: string) {
  const ref = doc(db, `orgs/${orgId}/cards/${cardId}`);
  await updateDoc(ref, {
    status: "active",
    enabledAt: serverTimestamp(),
    enabledBy: by ?? "system",
    updatedAt: serverTimestamp(),
  });
}


// --- SubCard Functions (unchanged) ---

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

  if (imageFile) {
    const key = crypto.randomUUID();
    const path = `orgs/${orgId}/cards/${cardId}/subcards/${key}/${imageFile.name}`;
    const storageRef = ref(storage, path);
    const task = uploadBytesResumable(storageRef, imageFile, { contentType: imageFile.type });
    await new Promise<void>((res, rej) => task.on("state_changed", undefined, rej, () => res()));
    imageUrl = await getDownloadURL(storageRef);
  }

  const subCardData = {
    ...data,
    heroImage: imageUrl,
    createdAt: serverTimestamp(),
  };
  await addDoc(subCardCollection(orgId, cardId), subCardData);
  // Also update the parent card's timestamp
  await updateDoc(doc(db, `orgs/${orgId}/cards/${cardId}`), {
    updatedAt: serverTimestamp(),
    lastUpdated: serverTimestamp()
  });
}

export async function deleteSubCard(orgId: string, cardId: string, subCardId: string, heroImage: string | null) {
  await deleteDoc(doc(db, `orgs/${orgId}/cards/${cardId}/subcards/${subCardId}`));

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