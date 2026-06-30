// ========== LÓGICA DA PÁGINA INICIAL (com Firebase + Auth) ==========

import {
  db,
  formatDate,
  formatDateShort,
  updateDateTime,
  dayNames,
  dayNamesShort,
  showNotification,
  showLoader,
  initProtectedPage
} from './shared.js';

import { logoutUser } from './auth.js';

// ========== REFERÊNCIAS DO DOM ==========
const medicineList         = document.getElementById('medicineList');
const searchInput          = document.getElementById('searchInput');
const addMedicineBtn       = document.getElementById('addMedicineBtn');
const medicineModal        = document.getElementById('medicineModal');
const detailsModal         = document.getElementById('detailsModal');
const medicineForm         = document.getElementById('medicineForm');
const modalTitle           = document.getElementById('modalTitle');
const closeModalBtn        = document.getElementById('closeModalBtn');
const closeDetailsBtn      = document.getElementById('closeDetailsBtn');
const cancelBtn            = document.getElementById('cancelBtn');
const deleteBtn            = document.getElementById('deleteBtn');
const deleteFromDetailsBtn = document.getElementById('deleteFromDetailsBtn');
const editBtn              = document.getElementById('editBtn');
const consumeBtn           = document.getElementById('consumeBtn');
const logoutBtn            = document.getElementById('logoutBtn');

// Inputs do formulário
const medicineName      = document.getElementById('medicineName');
const medicineStock     = document.getElementById('medicineStock');
const medicineDosage    = document.getElementById('medicineDosage');
const medicineTime      = document.getElementById('medicineTime');
const medicineDaysToTake = document.getElementById('medicineDaysToTake');
const dayCheckboxes     = document.querySelectorAll('.day-checkbox');

let currentMedicineId = null;
let allMedicinesCache = [];

// ========== INICIALIZAÇÃO COM GUARD DE AUTH ==========
initProtectedPage(() => {
  updateDateTime();

  // Listener em tempo real — só inicia após auth confirmada
  db.onMedicinesChange((medicines) => {
    allMedicinesCache = medicines;
    renderMedicineListFromCache(searchInput.value);
    renderUpcomingMedicinesFromCache();
  });
});

// ========== LOGOUT ==========
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    if (confirm('Deseja sair da sua conta?')) {
      await logoutUser();
    }
  });
}

// ========== RENDER DA LISTA ==========

function renderMedicineListFromCache(filterText = '') {
  if (!medicineList) return;
  medicineList.innerHTML = '';
  const filtered = allMedicinesCache.filter(m =>
    m.name.toLowerCase().includes(filterText.toLowerCase())
  );
  if (filtered.length === 0) {
    medicineList.innerHTML = '<p class="empty-list">Nenhum remédio adicionado. Clique em "+ Adicionar" para começar.</p>';
    return;
  }
  filtered.forEach(medicine => medicineList.appendChild(createMedicineCard(medicine)));
}

function renderUpcomingMedicinesFromCache() {
  const upcomingMedicines = document.getElementById('upcomingMedicines');
  const todayLabel = document.getElementById('todayLabel');
  if (!upcomingMedicines) return;

  const now = new Date();
  const todayMedicines = allMedicinesCache.filter(m => m.daysOfWeek.includes(now.getDay()));

  if (todayLabel) todayLabel.textContent = formatDate(now);

  if (todayMedicines.length === 0) {
    upcomingMedicines.innerHTML = '<p class="empty-list">Nenhum medicamento agendado para hoje.</p>';
  } else {
    upcomingMedicines.innerHTML = '';
    todayMedicines.sort((a, b) => a.time.localeCompare(b.time));
    todayMedicines.forEach(m => upcomingMedicines.appendChild(createUpcomingCard(m)));
  }
}

// ========== CARDS ==========

function createUpcomingCard(medicine) {
  const card = document.createElement('div');
  card.className = 'medicine-card';
  const daysRemaining = db.getDaysRemaining(medicine);
  const isLow = db.isRunningLow(medicine);
  const isOut = db.isOutOfStock(medicine);
  let statusClass = '', statusText = '';
  if (isOut)       { statusClass = 'out-of-stock'; statusText = 'SEM ESTOQUE'; }
  else if (isLow)  { statusClass = 'running-low';  statusText = 'ACABANDO'; }
  else             { statusClass = 'ok';            statusText = `${daysRemaining}d`; }
  card.innerHTML = `
    <div class="card-header">
      <h3>${medicine.name}</h3>
      <span class="status ${statusClass}">${statusText}</span>
    </div>
    <div class="card-body">
      <p class="card-info"><span class="label">Horário:</span><span class="value">${medicine.time}</span></p>
      <p class="card-info"><span class="label">Dose:</span><span class="value">${medicine.dosage} un.</span></p>
      <p class="card-info"><span class="label">Estoque:</span><span class="value">${medicine.stock} un.</span></p>
    </div>`;
  card.addEventListener('click', () => openDetailsModal(medicine));
  return card;
}

function createMedicineCard(medicine) {
  const card = document.createElement('div');
  card.className = 'medicine-card';
  const daysRemaining = db.getDaysRemaining(medicine);
  const isLow = db.isRunningLow(medicine);
  const isOut = db.isOutOfStock(medicine);
  let statusClass = '', statusText = '';
  if (isOut)       { statusClass = 'out-of-stock'; statusText = 'SEM ESTOQUE'; }
  else if (isLow)  { statusClass = 'running-low';  statusText = `ACABANDO (${daysRemaining}d)`; }
  else             { statusClass = 'ok';            statusText = `${daysRemaining} dias`; }
  const endDate = db.calculateEndDate(medicine);
  const daysOfWeekText = medicine.daysOfWeek.map(d => dayNamesShort[d]).join(', ');
  card.innerHTML = `
    <div class="card-header">
      <h3>${medicine.name}</h3>
      <span class="status ${statusClass}">${statusText}</span>
    </div>
    <div class="card-body">
      <p class="card-info"><span class="label">Estoque:</span><span class="value">${medicine.stock} un.</span></p>
      <p class="card-info"><span class="label">Dose:</span><span class="value">${medicine.dosage} un.</span></p>
      <p class="card-info"><span class="label">Horário:</span><span class="value">${medicine.time}</span></p>
      <p class="card-info"><span class="label">Dias:</span><span class="value">${daysOfWeekText}</span></p>
      <p class="card-info"><span class="label">Previsão:</span><span class="value">${formatDateShort(endDate)}</span></p>
    </div>`;
  card.addEventListener('click', () => openDetailsModal(medicine));
  return card;
}

// ========== MODAL DE DETALHES ==========

function openDetailsModal(medicine) {
  currentMedicineId = medicine.id;
  document.getElementById('detailsTitle').textContent = medicine.name;
  const daysRemaining  = db.getDaysRemaining(medicine);
  const endDate        = db.calculateEndDate(medicine);
  const daysOfWeekText = medicine.daysOfWeek.map(d => dayNames[d]).join(', ');
  document.getElementById('medicineDetails').innerHTML = `
    <div class="detail-item"><span class="label">Estoque Atual:</span><span class="value">${medicine.stock} unidades</span></div>
    <div class="detail-item"><span class="label">Dose por Tomada:</span><span class="value">${medicine.dosage} unidade(s)</span></div>
    <div class="detail-item"><span class="label">Horário:</span><span class="value">${medicine.time}</span></div>
    <div class="detail-item"><span class="label">Dias da Semana:</span><span class="value">${daysOfWeekText}</span></div>
    <div class="detail-item"><span class="label">Dias Restantes:</span><span class="value">${daysRemaining} dias</span></div>
    <div class="detail-item"><span class="label">Previsão de Término:</span><span class="value">${formatDateShort(endDate)}</span></div>`;
  detailsModal.classList.remove('hidden');
}

function closeDetailsModal() {
  detailsModal.classList.add('hidden');
  currentMedicineId = null;
}

// ========== MODAL DE ADICIONAR/EDITAR ==========

function openAddModal() {
  currentMedicineId = null;
  modalTitle.textContent = 'Adicionar Remédio';
  deleteBtn.style.display = 'none';
  medicineForm.reset();
  medicineTime.value = '08:00';
  dayCheckboxes.forEach(cb => cb.checked = false);
  medicineModal.classList.remove('hidden');
  medicineName.focus();
}

function openEditModal(id) {
  closeDetailsModal();
  const medicine = allMedicinesCache.find(m => m.id === String(id));
  if (!medicine) return;
  currentMedicineId = id;
  modalTitle.textContent = 'Editar Remédio';
  deleteBtn.style.display = 'block';
  medicineName.value       = medicine.name;
  medicineStock.value      = medicine.stock;
  medicineDosage.value     = medicine.dosage;
  medicineTime.value       = medicine.time;
  medicineDaysToTake.value = medicine.daysToTake || '';
  dayCheckboxes.forEach(cb => { cb.checked = medicine.daysOfWeek.includes(parseInt(cb.value)); });
  medicineModal.classList.remove('hidden');
  medicineName.focus();
}

function closeAddModal() {
  medicineModal.classList.add('hidden');
  currentMedicineId = null;
}

// ========== SALVAR REMÉDIO ==========

medicineForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const selectedDays = Array.from(dayCheckboxes).filter(cb => cb.checked).map(cb => parseInt(cb.value));
  if (selectedDays.length === 0) { alert('Selecione pelo menos um dia da semana!'); return; }
  const medicine = {
    id: currentMedicineId || String(Date.now()),
    name: medicineName.value,
    stock: parseInt(medicineStock.value),
    dosage: parseInt(medicineDosage.value),
    time: medicineTime.value,
    daysOfWeek: selectedDays,
    daysToTake: medicineDaysToTake.value ? parseInt(medicineDaysToTake.value) : null
  };
  showLoader(true);
  try {
    await db.saveMedicine(medicine);
    closeAddModal();
    showNotification('Remédio salvo com sucesso! ✅');
  } catch { showNotification('Erro ao salvar. Verifique a conexão.'); }
  finally { showLoader(false); }
});

// ========== DELETAR ==========

deleteBtn.addEventListener('click', async () => {
  if (!confirm('Tem certeza que deseja deletar este remédio?')) return;
  showLoader(true);
  try { await db.deleteMedicine(currentMedicineId); closeAddModal(); showNotification('Remédio deletado! 🗑️'); }
  catch { showNotification('Erro ao deletar.'); }
  finally { showLoader(false); }
});

deleteFromDetailsBtn.addEventListener('click', async () => {
  const medicine = allMedicinesCache.find(m => m.id === String(currentMedicineId));
  if (!medicine) return;
  const msg = medicine.stock === 0
    ? `"${medicine.name}" está sem estoque. Excluir definitivamente?`
    : `Excluir "${medicine.name}"? Esta ação não pode ser desfeita.`;
  if (!confirm(msg)) return;
  showLoader(true);
  try { await db.deleteMedicine(currentMedicineId); closeDetailsModal(); showNotification(`"${medicine.name}" excluído! 🗑️`); }
  catch { showNotification('Erro ao excluir.'); }
  finally { showLoader(false); }
});

// ========== CONSUMIR DOSE ==========

consumeBtn.addEventListener('click', async () => {
  const medicine = allMedicinesCache.find(m => m.id === String(currentMedicineId));
  if (!medicine) return;
  if (medicine.stock < medicine.dosage) { alert('Estoque insuficiente!'); return; }
  showLoader(true);
  try {
    medicine.stock -= medicine.dosage;
    await db.saveMedicine(medicine);
    closeDetailsModal();
    showNotification(`Dose registrada! ${medicine.stock} unidades restantes. 💊`);
  } catch { showNotification('Erro ao registrar dose.'); }
  finally { showLoader(false); }
});

// ========== BUSCA ==========
searchInput.addEventListener('input', () => renderMedicineListFromCache(searchInput.value));

// ========== EVENT LISTENERS ==========
addMedicineBtn.addEventListener('click', openAddModal);
closeModalBtn.addEventListener('click', closeAddModal);
closeDetailsBtn.addEventListener('click', closeDetailsModal);
cancelBtn.addEventListener('click', closeAddModal);
editBtn.addEventListener('click', () => openEditModal(currentMedicineId));
