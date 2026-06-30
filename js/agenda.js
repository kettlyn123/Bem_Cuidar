// ========== LÓGICA DA AGENDA (com Firebase + Auth) ==========

import {
  db,
  formatDate,
  formatDateShort,
  updateDateTime,
  dayNames,
  showNotification,
  showLoader,
  initProtectedPage
} from './shared.js';

import { logoutUser } from './auth.js';

// ========== REFERÊNCIAS DO DOM ==========
const calendarContainer = document.getElementById('calendarContainer');
const calendarMonthYear = document.getElementById('calendarMonthYear');
const prevWeekBtn       = document.getElementById('prevWeekBtn');
const nextWeekBtn       = document.getElementById('nextWeekBtn');
const upcomingMedicines = document.getElementById('upcomingMedicines');
const agendaTitle       = document.getElementById('agendaTitle');
const agendaLabel       = document.getElementById('agendaLabel');
const detailsModal      = document.getElementById('detailsModal');
const closeDetailsBtn   = document.getElementById('closeDetailsBtn');
const consumeBtn        = document.getElementById('consumeBtn');
const logoutBtn         = document.getElementById('logoutBtn');

let selectedDate = new Date();
let currentMedicineId = null;
let allMedicinesCache = [];

// ========== INICIALIZAÇÃO COM GUARD DE AUTH ==========
initProtectedPage(() => {
  updateDateTime();
  db.onMedicinesChange((medicines) => {
    allMedicinesCache = medicines;
    renderCalendar();
    renderAgendaForSelectedDate();
  });
});

// ========== LOGOUT ==========
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    if (confirm('Deseja sair da sua conta?')) await logoutUser();
  });
}

// ========== CALENDÁRIO ==========

function renderCalendar() {
  if (!calendarContainer) return;
  calendarContainer.innerHTML = '';
  const startOfWeek = new Date(selectedDate);
  startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
  const monthName = selectedDate.toLocaleDateString('pt-BR', { month: 'long' });
  if (calendarMonthYear) {
    calendarMonthYear.textContent = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${selectedDate.getFullYear()}`;
  }
  const calendarGrid = document.createElement('div');
  calendarGrid.className = 'calendar';
  ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].forEach(d => {
    const h = document.createElement('div');
    h.className = 'calendar-header';
    h.textContent = d;
    calendarGrid.appendChild(h);
  });
  const today = new Date();
  const isSameDay = (d1, d2) =>
    d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(startOfWeek);
    dayDate.setDate(startOfWeek.getDate() + i);
    const btn = document.createElement('button');
    btn.className = 'calendar-day';
    const span = document.createElement('span');
    span.textContent = dayDate.getDate();
    btn.appendChild(span);
    if (isSameDay(dayDate, today))        btn.classList.add('today');
    if (isSameDay(dayDate, selectedDate)) btn.classList.add('active');
    if (allMedicinesCache.some(m => m.daysOfWeek.includes(dayDate.getDay()))) btn.classList.add('marked-day');
    btn.addEventListener('click', () => { selectedDate = new Date(dayDate); renderCalendar(); renderAgendaForSelectedDate(); });
    calendarGrid.appendChild(btn);
  }
  calendarContainer.appendChild(calendarGrid);
}

function renderAgendaForSelectedDate() {
  if (!upcomingMedicines) return;
  upcomingMedicines.innerHTML = '';
  const todayMedicines = allMedicinesCache.filter(m => m.daysOfWeek.includes(selectedDate.getDay()));
  const today = new Date();
  const isSameDay = (d1, d2) =>
    d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
  if (agendaTitle) agendaTitle.textContent = isSameDay(selectedDate, today) ? 'Medicamentos de Hoje' : 'Medicamentos do Dia';
  if (agendaLabel) agendaLabel.textContent = formatDate(selectedDate);
  if (todayMedicines.length === 0) {
    upcomingMedicines.innerHTML = '<p class="empty-list">Nenhum remédio agendado para este dia.</p>';
  } else {
    todayMedicines.sort((a, b) => a.time.localeCompare(b.time));
    todayMedicines.forEach(m => upcomingMedicines.appendChild(createUpcomingCard(m)));
  }
}

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

function openDetailsModal(medicine) {
  currentMedicineId = medicine.id;
  const daysRemaining  = db.getDaysRemaining(medicine);
  const endDate        = db.calculateEndDate(medicine);
  const daysOfWeekText = medicine.daysOfWeek.map(d => dayNames[d]).join(', ');
  document.getElementById('detailsTitle').textContent = medicine.name;
  document.getElementById('medicineDetails').innerHTML = `
    <div class="detail-item"><span class="label">Estoque Atual:</span><span class="value">${medicine.stock} unidades</span></div>
    <div class="detail-item"><span class="label">Dose por Tomada:</span><span class="value">${medicine.dosage} unidade(s)</span></div>
    <div class="detail-item"><span class="label">Horário:</span><span class="value">${medicine.time}</span></div>
    <div class="detail-item"><span class="label">Dias da Semana:</span><span class="value">${daysOfWeekText}</span></div>
    <div class="detail-item"><span class="label">Dias Restantes:</span><span class="value">${daysRemaining} dias</span></div>
    <div class="detail-item"><span class="label">Previsão de Término:</span><span class="value">${formatDateShort(endDate)}</span></div>`;
  if (detailsModal) detailsModal.classList.remove('hidden');
}

function closeDetailsModal() {
  if (detailsModal) detailsModal.classList.add('hidden');
  currentMedicineId = null;
}

// ========== EVENT LISTENERS ==========
if (prevWeekBtn) prevWeekBtn.addEventListener('click', () => { selectedDate.setDate(selectedDate.getDate() - 7); renderCalendar(); renderAgendaForSelectedDate(); });
if (nextWeekBtn) nextWeekBtn.addEventListener('click', () => { selectedDate.setDate(selectedDate.getDate() + 7); renderCalendar(); renderAgendaForSelectedDate(); });
if (closeDetailsBtn) closeDetailsBtn.addEventListener('click', closeDetailsModal);

if (consumeBtn) {
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
}
