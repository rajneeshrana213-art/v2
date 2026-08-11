import * as admin from "firebase-admin";

// Singleton — re-use across hot-reloads in Next.js dev mode
if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
    console.warn(
      "[FCM] Firebase Admin SDK not initialised — missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL or FIREBASE_PRIVATE_KEY env vars. Push notifications will be disabled."
    );
  } else {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId:   process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    });
    console.log("[FCM] Firebase Admin SDK initialised ✅");
  }
}

export default admin;
export const messaging = admin.apps.length ? admin.messaging() : null;
