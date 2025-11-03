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

// Card type (top-level card) - Complete
export type Card = {
  id: string;
  title: string | null;
  description?: string | null;
  heroImage?: string | null;
  labelCount?: number;
  status?: "active" | "disabled" | "archived" | "draft" | "live";
  lastUpdated?: any;
  updatedAt?: any;
  createdAt?: any;
  templateId?: string;
  deleted?: boolean;
  disabledAt?: any;
  disabledBy?: string;
  disabledReason?: string | null;
  enabledAt?: any;
  enabledBy?: string;
};

// SubCard type
export type SubCard = {
  id: string;
  type: 'subcard' | 'file';
  title: string;
  description?: string | null;
  heroImage?: string | null;
  fileUrl?: string | null;
  fileType?: string | null;
  createdAt?: any;
};

// --- Top-Level Card Functions ---

// Updates the core details of a top-level card
export async function updateCardDetails(
  orgId: string, 
  cardId: string, 
  data: { title: string, description: string | null }
) {
  const ref = doc(db, `orgs/${orgId}/cards/${cardId}`);
  await updateDoc(ref, {
    title: data.title,
    description: data.description,
    updatedAt: serverTimestamp(),
    lastUpdated: serverTimestamp(),
  });
}
// --- END OF NEW FUNCTION ---

// Fetches *all* non-deleted cards (draft & active) for the admin page
export async function listAllCards(orgId: string): Promise<Card[]> {
  const cardsRef = collection(db, `orgs/${orgId}/cards`);
  const q = query(
    cardsRef, 
    where("deleted", "==", false),
    where("status", "in", ["active", "draft", "live"]) // Show active, draft, and old "live" cards
  ); 
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
}

// Fetches *only* active cards for the staff portal
export async function listActiveCards(orgId: string): Promise<Card[]> {
  const col = collection(db, `orgs/${orgId}/cards`);
  const q = query(col, 
    where("status", "==", "active"),
    where("deleted", "==", false)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Card, "id">) }));
}

// Creates a new card from a template, status defaults to "draft"
export async function createCardFromTemplate(orgId: string, templateId: string) {
  const masterTemplateOrg = "samru";
  const t = (await getDoc(doc(db, `orgs/${masterTemplateOrg}/cardTemplates/${templateId}`))).data()!;
  
  const refDoc = await addDoc(collection(db, `orgs/${orgId}/cards`), {
    title: t.title, description: t.description, heroImage: t.heroImage || null,
    labelCount: 0, 
    templateId,
    deleted: false,
    status: "draft", // Default to "draft"
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastUpdated: serverTimestamp(),
  });
  return refDoc.id;
}

// Soft-deletes a card
export async function deleteCard(orgId: string, cardId: string) {
  const cardRef = doc(db, `orgs/${orgId}/cards/${cardId}`);
  await updateDoc(cardRef, {
    deleted: true,
    deletedAt: serverTimestamp(),
    status: "disabled", // or "archived"
    updatedAt: serverTimestamp(),
    lastUpdated: serverTimestamp(),
  });
}

// Publish/Unpublish function
export async function updateCardStatus(
  orgId: string, 
  cardId: string, 
  status: "active" | "draft"
) {
  const ref = doc(db, `orgs/${orgId}/cards/${cardId}`);
  await updateDoc(ref, {
    status: status,
    updatedAt: serverTimestamp(),
    lastUpdated: serverTimestamp(),
  });
}

// --- ADDED THIS FUNCTION BACK ---
export async function updateCardDesc(orgId: string, cardId: string, description: string) {
  await updateDoc(doc(db, `orgs/${orgId}/cards/${cardId}`), {
    description, 
    updatedAt: serverTimestamp(),
    lastUpdated: serverTimestamp(),
  });
}

// --- ADDED THESE FUNCTIONS BACK ---
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
export async function enableCard(orgId: string, cardId: string, by?: string) {
  const ref = doc(db, `orgs/${orgId}/cards/${cardId}`);
  await updateDoc(ref, {
    status: "active",
    enabledAt: serverTimestamp(),
    enabledBy: by ?? "system",
    updatedAt: serverTimestamp(),
  });
}
// --- END OF ADDED FUNCTIONS ---


// --- Sub-Content Functions ---

const subContentCollection = (orgId: string, cardId: string) => 
  collection(db, `orgs/${orgId}/cards/${cardId}/subcards`);

// Lists all sub-content (files and subcards)
export async function listSubContent(orgId: string, cardId: string): Promise<SubCard[]> {
  const snap = await getDocs(subContentCollection(orgId, cardId));
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
}

// Uploads a file and creates a 'file' type document
export async function uploadToCard(orgId: string, cardId: string, file: File) {
  const key = crypto.randomUUID();
  const path = `orgs/${orgId}/cards/${cardId}/uploads/${key}/${file.name}`;
  const storageRef = ref(storage, path);
  const task = uploadBytesResumable(storageRef, file, { contentType: file.type });
  await new Promise<void>((res, rej) => task.on("state_changed", undefined, rej, () => res()));
  const downloadURL = await getDownloadURL(storageRef);

  // Correctly tag 'image' file types
  const fileType = file.type.startsWith('image/') ? 'image' 
    : file.type.startsWith('video/') ? 'video' 
    : file.type.includes('pdf') ? 'pdf' 
    : file.type.includes('presentation') ? 'ppt'
    : file.type.includes('sheet') ? 'xls'
    : file.type.includes('document') ? 'doc'
    : 'file';

  await addDoc(subContentCollection(orgId, cardId), {
    type: 'file',
    title: file.name,
    fileUrl: downloadURL,
    fileType: fileType,
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, `orgs/${orgId}/cards/${cardId}`), {
    updatedAt: serverTimestamp(),
    lastUpdated: serverTimestamp()
  });
}

// Creates a 'subcard' type document
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
    type: 'subcard',
    heroImage: imageUrl,
    createdAt: serverTimestamp(),
  };
  await addDoc(subContentCollection(orgId, cardId), subCardData);

  await updateDoc(doc(db, `orgs/${orgId}/cards/${cardId}`), {
    updatedAt: serverTimestamp(),
    lastUpdated: serverTimestamp()
  });
}

// Deletes any sub-content (file or subcard)
export async function deleteSubContent(
  orgId: string, 
  cardId: string, 
  subCard: SubCard
) {
  await deleteDoc(doc(db, `orgs/${orgId}/cards/${cardId}/subcards/${subCard.id}`));
  const urlToDelete = subCard.type === 'file' ? subCard.fileUrl : subCard.heroImage;

  if (urlToDelete) {
    try {
      await deleteObject(ref(storage, urlToDelete));
    } catch (error: any) {
      if (error.code === 'storage/object-not-found') {
        console.warn("Storage object not found, deleting doc only.");
      } else {
        console.error("Error deleting storage file:", error);
      }
    }
  }
}