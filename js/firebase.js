// ========== CONFIGURAÇÃO CENTRAL DO FIREBASE ==========

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getAuth
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCUgh5_E98fyIF8Z8PqoXO30OOsC-tbNcg",
  authDomain: "bem-cuidar-b7aa0.firebaseapp.com",
  projectId: "bem-cuidar-b7aa0",
  storageBucket: "bem-cuidar-b7aa0.firebasestorage.app",
  messagingSenderId: "16276783940",
  appId: "1:16276783940:web:1ea3f6e01e3d0102d90d11",
  measurementId: "G-QWJNDGQD8G"
};

// Evita múltiplas inicializações ao importar em vários módulos
const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0];

const firestoreDB = getFirestore(app);
const auth        = getAuth(app);

export {
  app,
  firestoreDB,
  auth,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy
};
