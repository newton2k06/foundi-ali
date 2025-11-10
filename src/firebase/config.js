import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; 
import { setPersistence, browserLocalPersistence } from 'firebase/auth'; // ← AJOUT setPersistence ici

const firebaseConfig = {
  apiKey: "AIzaSyAOptbcTQtcOPhmKWqqYQ-54oAaX23goUg",
  authDomain: "foundi-ali.firebaseapp.com",
  projectId: "foundi-ali",
  storageBucket: "foundi-ali.firebasestorage.app",
  messagingSenderId: "94956573023",
  appId: "1:94956573023:web:fc290ee61ec502e962e6ea",
  measurementId: "G-JF5G5TBXMB"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Exporter les services dont on a besoin
export const auth = getAuth(app);
// 🔥 AJOUTE LA PERSISTANCE 
setPersistence(auth, browserLocalPersistence)
  .then(() => {
  })
  .catch((error) => {
    console.error("❌ Erreur persistance:", error);
  });
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;