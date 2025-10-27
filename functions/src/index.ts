/**
 * SAMRU Portal Cloud Functions (v2)
 * - setUserRole (callable): superadmins assign roles
 * - onChildWrite (firestore trigger): recompute card.labelCount + lastUpdated
 * - onUploadFinalize (storage trigger): create FileItem doc on upload
 */

import * as admin from "firebase-admin";
import { setGlobalOptions } from "firebase-functions/v2";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { onObjectFinalized } from "firebase-functions/v2/storage";

admin.initializeApp();

// sensible defaults; adjust region if you like
setGlobalOptions({ region: "us-west1", maxInstances: 10 });

/** Helpers */
const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

/** Recompute labelCount for a card (live subcards + live files) */
async function recomputeLabelCount(orgId: string, cardId: string) {
  const base = `orgs/${orgId}/cards/${cardId}`;
  const [subcardsSnap, filesSnap] = await Promise.all([
    db.collection(`${base}/subcards`).where("status", "==", "live").get(),
    db.collection(`${base}/files`).where("status", "==", "live").get(),
  ]);

  await db.doc(base).update({
    labelCount: subcardsSnap.size + filesSnap.size,
    lastUpdated: FieldValue.serverTimestamp(),
  });
}

/** 1) Callable: setUserRole — superadmin only */
export const setUserRole = onCall<{ uid: string; role: "manager" | "superadmin" }>(
  async (req) => {
    const caller = req.auth;
    if (!caller || caller.token.role !== "superadmin") {
      throw new HttpsError("permission-denied", "Superadmin role required.");
    }
    const { uid, role } = req.data ?? ({} as any);
    if (!uid || !role) {
      throw new HttpsError("invalid-argument", "uid and role are required.");
    }
    await admin.auth().setCustomUserClaims(uid, { role });
    return { ok: true };
  }
);

/** 2) Firestore trigger: any child change under a card updates counts + timestamp */
interface ChildWriteParams {
  orgId: string;
  cardId: string;
  childCol: string;
  childId: string;
}

export const onChildWrite = onDocumentWritten(
  // Matches both subcards and files subcollections
  { region: "northamerica-northeast2", document: "orgs/{orgId}/cards/{cardId}/{childCol}/{childId}" },
  async (event: { params: ChildWriteParams }) => {
    const { orgId, cardId } = event.params;
    // no-op if the card doc was deleted
    const cardRef: admin.firestore.DocumentReference = db.doc(`orgs/${orgId}/cards/${cardId}`);
    const card: admin.firestore.DocumentSnapshot = await cardRef.get();
    if (!card.exists) return;
    await recomputeLabelCount(orgId, cardId);
  }
);

/** 3) Storage trigger: create a FileItem doc when a file upload finalizes */
export const onUploadFinalize = onObjectFinalized(
  { region: "us-west1", bucket: "samru-portal.firebasestorage.app" }, // 👈 set bucket explicitly
  async (event) => {
  const obj = event.data;
  const path = obj.name || "";
  // Expect: orgs/{orgId}/cards/{cardId}/uploads/.../filename
  const m = path.match(/^orgs\/([^/]+)\/cards\/([^/]+)\/uploads\/.+\/([^/]+)$/);
  if (!m) return;

  const [, orgId, cardId, filename] = m;
  const storagePath = `gs://${obj.bucket}/${path}`;
  const filesCol = db.collection(`orgs/${orgId}/cards/${cardId}/files`);

  // avoid dupes on retries
  const existing = await filesCol.where("storagePath", "==", storagePath).limit(1).get();
  if (!existing.empty) return;

  await filesCol.add({
    name: filename,
    storagePath,
    size: obj.size || 0,
    contentType: obj.contentType || "application/octet-stream",
    status: "live",
    lastUpdated: FieldValue.serverTimestamp(),
  });

  // ensure parent labelCount/lastUpdated stay fresh
  await recomputeLabelCount(orgId, cardId);
});
