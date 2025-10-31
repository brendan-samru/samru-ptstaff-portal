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

// MODIFICATION: SubCard type now includes type and fileUrl
export type SubCard = {
  id: string;
  type: 'subcard' | 'file'; // Distinguish between a subcard and a simple file
  title: string;
  description?: string | null;
  heroImage?: string | null; // For type 'subcard'
  fileUrl?: string | null;   // For type 'file'
  fileType?: string | null;  // e.g., 'pdf', 'video', 'doc'
  createdAt?: any;
};

// --- Top-Level Card Functions ---

export async function listCards(orgId: string): Promise<Card[]> {
  const cardsRef = collection(db, `orgs/${orgId}/cards`);
  const q = query(cardsRef, where("deleted", "==", false)); 
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
}

export async function listActiveCards(orgId: string): Promise<Card[]> {
  const col = collection(db, `orgs/${orgId}/cards`);
  const q = query(col, 
    where("status", "==", "active"),
    where("deleted", "==", false)
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
    status: "active",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastUpdated: serverTimestamp(),
  });
  return refDoc.id;
}

export async function deleteCard(orgId: string, cardId: string) {
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

// --- NEW: Disable / Enable Helpers ---

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

// --- Sub-Content Functions ---

const subContentCollection = (orgId: string, cardId: string) => 
  collection(db, `orgs/${orgId}/cards/${cardId}/subcards`);

// MODIFICATION: Renamed to listSubContent
export async function listSubContent(orgId: string, cardId: string): Promise<SubCard[]> {
  const snap = await getDocs(subContentCollection(orgId, cardId));
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
}

// MODIFICATION: This function now creates a 'file' type document
export async function uploadToCard(orgId: string, cardId: string, file: File) {
  // 1. Upload the file
  const key = crypto.randomUUID();
  const path = `orgs/${orgId}/cards/${cardId}/uploads/${key}/${file.name}`;
  const storageRef = ref(storage, path);
  const task = uploadBytesResumable(storageRef, file, { contentType: file.type });
  await new Promise<void>((res, rej) => task.on("state_changed", undefined, rej, () => res()));
  const downloadURL = await getDownloadURL(storageRef);

  // 2. Determine file type
  const fileType = file.type.startsWith('video/') ? 'video' 
    : file.type.includes('pdf') ? 'pdf' 
    : file.type.includes('presentation') ? 'ppt'
    : file.type.includes('sheet') ? 'xls'
    : file.type.includes('document') ? 'doc'
    : 'file';

  // 3. Create the 'file' document in the subcards collection
  await addDoc(subContentCollection(orgId, cardId), {
    type: 'file',
    title: file.name,
    fileUrl: downloadURL,
    fileType: fileType,
    createdAt: serverTimestamp(),
  });

  // 4. Update parent card timestamp
  await updateDoc(doc(db, `orgs/${orgId}/cards/${cardId}`), {
    updatedAt: serverTimestamp(),
    lastUpdated: serverTimestamp()
  });
}

// MODIFICATION: This function now creates a 'subcard' type document
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

  // Update parent card timestamp
  await updateDoc(doc(db, `orgs/${orgId}/cards/${cardId}`), {
    updatedAt: serverTimestamp(),
    lastUpdated: serverTimestamp()
  });
}

// MODIFICATION: Renamed and updated to handle file/image deletion
export async function deleteSubContent(
  orgId: string, 
  cardId: string, 
  subCard: SubCard
) {
  // 1. Delete the Firestore document
  await deleteDoc(doc(db, `orgs/${orgId}/cards/${cardId}/subcards/${subCard.id}`));

  // 2. Determine which URL to delete from Storage
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