import admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";

const firebaseServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

let auth = null;

if (!firebaseServiceAccount) {
  console.warn(
    "FIREBASE_SERVICE_ACCOUNT is not loaded. Firebase admin will not be initialized.",
  );
} else {
  const serviceAccount = JSON.parse(firebaseServiceAccount);

  if (!admin.getApps().length) {
    admin.initializeApp({
      credential: admin.cert(serviceAccount),
    });
  }

  auth = getAuth();
}

export { auth };
export default admin;
