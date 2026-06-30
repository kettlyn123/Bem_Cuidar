// ========== BANCO DE DADOS COM FIREBASE FIRESTORE (por usuário) ==========

import {
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
} from './firebase.js';

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ========== CLASSE DO BANCO DE DADOS ==========

class MedicineDatabase {
  // Retorna a coleção do usuário logado: users/{uid}/medicines
  _getCollection() {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado.');
    return collection(firestoreDB, 'users', user.uid, 'medicines');
  }

  // Buscar todos os medicamentos do usuário
  async getAllMedicines() {
    try {
      const col = this._getCollection();
      const q = query(col, orderBy('lastUpdated', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.error('Erro ao carregar medicamentos:', e);
      return [];
    }
  }

  // Buscar medicamento por ID
  async getMedicineById(id) {
    try {
      const user = auth.currentUser;
      if (!user) return null;
      const docRef = doc(firestoreDB, 'users', user.uid, 'medicines', String(id));
      const snap = await getDoc(docRef);
      if (snap.exists()) return { id: snap.id, ...snap.data() };
      return null;
    } catch (e) {
      console.error('Erro ao buscar medicamento:', e);
      return null;
    }
  }

  // Salvar ou atualizar medicamento
  async saveMedicine(medicine) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Usuário não autenticado.');
      const id = medicine.id ? String(medicine.id) : String(Date.now());
      const docRef = doc(firestoreDB, 'users', user.uid, 'medicines', id);

      const data = {
        name:       medicine.name,
        stock:      medicine.stock,
        dosage:     medicine.dosage,
        time:       medicine.time,
        daysOfWeek: medicine.daysOfWeek,
        daysToTake: medicine.daysToTake ?? null,
        lastUpdated: serverTimestamp()
      };

      await setDoc(docRef, data, { merge: true });
      return { id, ...data };
    } catch (e) {
      console.error('Erro ao salvar medicamento:', e);
      throw e;
    }
  }

  // Deletar medicamento
  async deleteMedicine(id) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Usuário não autenticado.');
      const docRef = doc(firestoreDB, 'users', user.uid, 'medicines', String(id));
      await deleteDoc(docRef);
    } catch (e) {
      console.error('Erro ao deletar medicamento:', e);
      throw e;
    }
  }

  // Escutar mudanças em tempo real (retorna unsubscribe fn)
  onMedicinesChange(callback) {
    const user = auth.currentUser;
    if (!user) return () => {};
    const col = collection(firestoreDB, 'users', user.uid, 'medicines');
    const q = query(col, orderBy('lastUpdated', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const medicines = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      callback(medicines);
    });
  }

  // ========== CÁLCULOS LOCAIS ==========

  calculateEndDate(medicine) {
    const now = new Date();
    const daysPerWeek = medicine.daysOfWeek.length;
    const weeksNeeded = Math.ceil((medicine.stock / medicine.dosage) / daysPerWeek);
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + (weeksNeeded * 7));
    return endDate;
  }

  getDaysRemaining(medicine) {
    const endDate = this.calculateEndDate(medicine);
    const now = new Date();
    return Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));
  }

  isRunningLow(medicine) {
    const d = this.getDaysRemaining(medicine);
    return d <= 7 && d > 0;
  }

  isOutOfStock(medicine) {
    return medicine.stock <= 0;
  }
}

const db = new MedicineDatabase();

// ========== FUNÇÕES DE FORMATAÇÃO ==========

function formatDate(date) {
  return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
}
function formatTime(date) {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}
function formatDateShort(date) {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function updateDateTime() {
  const dateDisplay  = document.getElementById('dateDisplay');
  const timeDisplay  = document.getElementById('timeDisplay');
  const statusBarTime = document.getElementById('statusBarTime');
  const todayLabel   = document.getElementById('todayLabel');
  const now = new Date();
  if (dateDisplay)   dateDisplay.textContent   = formatDate(now);
  if (timeDisplay)   timeDisplay.textContent   = formatTime(now);
  if (statusBarTime) statusBarTime.textContent = formatTime(now);
  if (todayLabel)    todayLabel.textContent    = formatDate(now);
  setTimeout(updateDateTime, 1000);
}

// ========== NOMES DOS DIAS ==========
const dayNames      = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const dayNamesShort = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// ========== NOTIFICAÇÃO EM TELA ==========
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.classList.add('show'), 10);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ========== LOADER GLOBAL ==========
function showLoader(visible) {
  let loader = document.getElementById('globalLoader');
  if (!loader) {
    loader = document.createElement('div');
    loader.id = 'globalLoader';
    loader.style.cssText = `
      position:fixed; top:0; left:0; right:0; bottom:0;
      background:rgba(0,0,0,0.4); display:flex; align-items:center;
      justify-content:center; z-index:9999; backdrop-filter:blur(4px);
    `;
    loader.innerHTML = `<div style="
      background:#fff; color:#1b2737;
      padding:24px 32px; border-radius:16px; text-align:center;
      box-shadow:0 8px 32px rgba(0,0,0,0.15);
    ">
      <div style="font-size:28px; margin-bottom:10px;">⏳</div>
      <p style="margin:0; font-size:14px; font-weight:600;">Carregando...</p>
    </div>`;
    document.body.appendChild(loader);
  }
  loader.style.display = visible ? 'flex' : 'none';
}

// ========== INJETAR NOME DO USUÁRIO NO HEADER ==========
function injectUserHeader() {
  const user = auth.currentUser;
  if (!user) return;

  // Iniciais para o avatar
  const avatarEl = document.querySelector('.avatar');
  const nameEl   = document.querySelector('.profile h1');
  const greetEl  = document.querySelector('.profile p');

  const name     = user.displayName || user.email;
  const initials = name.split(' ').slice(0, 2).map(n => n[0].toUpperCase()).join('');

  if (avatarEl) avatarEl.textContent = initials;
  if (nameEl)   nameEl.textContent   = user.displayName || 'Usuário';
  if (greetEl)  greetEl.textContent  = `Olá, bem-vindo(a) 👋`;
}

// ========== GUARD DE AUTENTICAÇÃO + INICIALIZAR APP ==========
function initProtectedPage(onReady) {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = 'login.html';
      return;
    }
    injectUserHeader();
    onReady(user);
  });
}

export {
  db,
  formatDate,
  formatTime,
  formatDateShort,
  updateDateTime,
  dayNames,
  dayNamesShort,
  showNotification,
  showLoader,
  injectUserHeader,
  initProtectedPage
};
