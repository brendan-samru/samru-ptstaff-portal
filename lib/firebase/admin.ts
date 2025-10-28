// lib/firebase/admin.ts
import 'server-only';
import { getApp, getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage as getAdminStorage } from 'firebase-admin/storage';

// All values must exist at build/runtime on Vercel Project Settings → Environment Variables
const projectId     = process.env.FIREBASE_PROJECT_ID!;
const clientEmail   = process.env.FIREBASE_CLIENT_EMAIL!;
const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY!;

// Handle escaped newlines from env
const privateKey = privateKeyRaw.replace(/\\n/g, '\n');

const app = getApps().length
  ? getApp()
  : initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // optional
    });

export const adminAuth = getAdminAuth(app);
export const adminDb   = getFirestore(app);
export const adminStorage = getAdminStorage(app);
