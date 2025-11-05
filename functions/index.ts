import * as functions from "firebase-functions";
import *S admin from "firebase-admin";

// Initialize the Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

/**
 * Trigger: on-create-user
 * Listens for any new user created in Firebase Authentication
 * and creates a corresponding document in the 'users' collection.
 */
export const createNewUserDocument = functions.auth.user()
  .onCreate(async (user) => {
    
    // Get the user's details
    const { uid, email } = user;

    // Create the new document in the 'users' collection
    // The Document ID will be the same as the user's UID
    const userDocRef = db.collection("users").doc(uid);

    try {
      await userDocRef.set({
        email: email,
        role: "staff",       // Set a default role
        department: "samru",   // Set a default department
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`Successfully created user document for: ${email}`);
    } catch (error) {
      console.error(`Error creating user document for: ${email}`, error);
    }
  });