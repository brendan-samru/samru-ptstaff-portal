// admin.ts (server)
import { getApp, getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage as getAdminStorage } from 'firebase-admin/storage';

const app = getApps().length
  ? getApp()
  : initializeApp({
      credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON!)),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    });

export const adminAuth = getAdminAuth(app);
export const adminDb = getFirestore(app);
export const adminBucket = getAdminStorage().bucket();
