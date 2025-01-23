import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDKgmm97leUvsdeC9SdGCUhikbFpv48PgI",
  authDomain: "pasajesboletoscontrol.firebaseapp.com",
  projectId: "pasajesboletoscontrol",
  storageBucket: "pasajesboletoscontrol.firebasestorage.app",
  messagingSenderId: "593018397568",
  appId: "1:593018397568:web:f88f99e11e82723b5f1765"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
