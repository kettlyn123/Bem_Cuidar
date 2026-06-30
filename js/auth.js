// ========== AUTENTICAÇÃO FIREBASE ==========

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
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

// Evita inicializar o app duas vezes se já existir
const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0];

const auth = getAuth(app);

// ========== CADASTRO ==========
async function registerUser(name, email, password) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  // Salva o nome no perfil do Firebase Auth
  await updateProfile(credential.user, { displayName: name });
  return credential.user;
}

// ========== LOGIN ==========
async function loginUser(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

// ========== LOGOUT ==========
async function logoutUser() {
  await signOut(auth);
  window.location.href = 'login.html';
}

// ========== GUARD: redireciona para login se não autenticado ==========
function requireAuth(callback) {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = 'login.html';
    } else {
      callback(user);
    }
  });
}

// ========== GUARD: redireciona para home se JÁ estiver logado ==========
function redirectIfLoggedIn() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      window.location.href = 'index.html';
    }
  });
}

// ========== USUÁRIO ATUAL ==========
function getCurrentUser() {
  return auth.currentUser;
}

export {
  auth,
  registerUser,
  loginUser,
  logoutUser,
  requireAuth,
  redirectIfLoggedIn,
  getCurrentUser
};
