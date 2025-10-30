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
  getDocs // Import new functions
} from "firebase/firestore";
import { ref, listAll, deleteObject, uploadBytesResumable } from "firebase/storage";

// NEW: Exporting the Card type
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

// NEW: Function to list cards for a department
export async function listCards(orgId: string): Promise<Card[]> {
  const cardsRef = collection(db, `orgs/${orgId}/cards`);
  // Query to get cards that are NOT marked as deleted
  const q = query(cardsRef, where("deleted", "!=", true)); 
  
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
}

export async function createCardFromTemplate(orgId: string, templateId: string) {
  const t = (await getDoc(doc(db, `orgs/${orgId}/cardTemplates/${templateId}`))).data()!;
  const refDoc = await addDoc(collection(db, `orgs/${orgId}/cards`), {
    title: t.title, description: t.description, heroImage: t.heroImage || null,
    labelCount: 0, status: "live", lastUpdated: serverTimestamp(), templateId,
  });
  return refDoc.id;
}

export async function disableCard(orgId: string, cardId: string) {
  const cardRef = doc(db, `orgs/${orgId}/cards/${cardId}`);
  await updateDoc(cardRef, {
    status: "disabled",
    disabledAt: serverTimestamp(),
    lastUpdated: serverTimestamp(),
  });
}

/**
 * Soft delete (recommended): sets deleted=true and hides from UI/rules.
 * Pass { hard: true } if you really want to remove the doc and its uploads.
 */
export async function deleteCard(
  orgId: string,
  cardId: string,
  opts: { hard?: boolean } = {}
) {
  if (!opts.hard) {
    const cardRef = doc(db, `orgs/${orgId}/cards/${cardId}`);
    await updateDoc(cardRef, {
      deleted: true,
      deletedAt: serverTimestamp(),
      status: "disabled",
      lastUpdated: serverTimestamp(),
    });
    return;
  }

  // HARD DELETE (careful): remove uploads then delete the doc
  const uploadsRoot = ref(storage, `orgs/${orgId}/cards/${cardId}/uploads`);
  try {
    const listing = await listAll(uploadsRoot);
    await Promise.all(
      listing.items.map((item) => deleteObject(item))
    );
    // (Optional) also walk subfolders in uploadsRoot.prefixes if you use nested dirs.
  } catch {
    // no uploads or storage perms — ignore and proceed
  }

  const cardRef = doc(db, `orgs/${orgId}/cards/${cardId}`);
  await deleteDoc(cardRef);
}

export async function updateCardDesc(orgId: string, cardId: string, description: string) {
  await updateDoc(doc(db, `orgs/${orgId}/cards/${cardId}`), {
    description, lastUpdated: serverTimestamp(),
  });
}

export async function uploadToCard(orgId: string, cardId: string, file: File) {
  const key = crypto.randomUUID();
  const path = `orgs/${orgId}/cards/${cardId}/uploads/${key}/${file.name}`;
  const task = uploadBytesResumable(ref(storage, path), file, { contentType: file.type });
  await new Promise<void>((res, rej) => task.on("state_changed", undefined, rej, () => res()));
  // The Cloud Function will write files/{...} and bump labelCount/lastUpdated.
}