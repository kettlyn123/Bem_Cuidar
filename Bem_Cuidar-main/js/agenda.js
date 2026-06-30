// ========== LÓGICA DA PÁGINA DE AGENDA COM CALENDÁRIO ==========

const calendarContainer = document.getElementById('calendarContainer');
const calendarMonthYear = document.getElementById('calendarMonthYear');
const prevWeekBtn = document.getElementById('prevWeekBtn');
const nextWeekBtn = document.getElementById('nextWeekBtn');
const upcomingMedicines = document.getElementById('upcomingMedicines');
const agendaTitle = document.getElementById('agendaTitle');
const agendaLabel = document.getElementById('agendaLabel');

const detailsModal = document.getElementById('detailsModal');
const closeDetailsBtn = document.getElementById('closeDetailsBtn');
const consumeBtn = document.getElementById('consumeBtn');

let selectedDate = new Date();
let currentMedicineId = null;

function renderCalendar() {
  if (!calendarContainer) return;
  calendarContainer.innerHTML = '';

  // Encontrar o domingo da semana atual da selectedDate
  const startOfWeek = new Date(selectedDate);
  const dayOfWeek = selectedDate.getDay(); // 0 (Domingo) a 6 (Sábado)
  startOfWeek.setDate(selectedDate.getDate() - dayOfWeek);

  // Definir título do Mês/Ano (ex: Junho de 2026)
  const monthName = selectedDate.toLocaleDateString('pt-BR', { month: 'long' });
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
  const year = selectedDate.getFullYear();
  if (calendarMonthYear) {
    calendarMonthYear.textContent = `${capitalizedMonth} ${year}`;
  }

  // Criar o grid do calendário
  const calendarGrid = document.createElement('div');
  calendarGrid.className = 'calendar';

  // Adicionar cabeçalho (Dias da semana: Dom, Seg, Ter, Qua, Qui, Sex, Sáb)
  const shortDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  shortDays.forEach(day => {
    const header = document.createElement('div');
    header.className = 'calendar-header';
    header.textContent = day;
    calendarGrid.appendChild(header);
  });

  // Adicionar os 7 dias da semana
  const today = new Date();
  const medicines = db.getAllMedicines();

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(startOfWeek);
    dayDate.setDate(startOfWeek.getDate() + i);

    const dayBtn = document.createElement('button');
    dayBtn.className = 'calendar-day';

    // Número do dia
    const dayNumSpan = document.createElement('span');
    dayNumSpan.textContent = dayDate.getDate();
    dayBtn.appendChild(dayNumSpan);

    // Classes de status
    const isSameDay = (d1, d2) => 
      d1.getDate() === d2.getDate() && 
      d1.getMonth() === d2.getMonth() && 
      d1.getFullYear() === d2.getFullYear();

    if (isSameDay(dayDate, today)) {
      dayBtn.classList.add('today');
    }

    if (isSameDay(dayDate, selectedDate)) {
      dayBtn.classList.add('active');
    }

    // Verificar se tem remédio agendado para o dia da semana
    const dayOfWeekIndex = dayDate.getDay();
    const hasMedicines = medicines.some(m => m.daysOfWeek.includes(dayOfWeekIndex));
    if (hasMedicines) {
      dayBtn.classList.add('marked-day');
    }

    dayBtn.addEventListener('click', () => {
      selectedDate = dayDate;
      renderCalendar();
      renderAgendaForSelectedDate();
    });

    calendarGrid.appendChild(dayBtn);
  }

  calendarContainer.appendChild(calendarGrid);
}

function renderAgendaForSelectedDate() {
  if (!upcomingMedicines) return;
  upcomingMedicines.innerHTML = '';

  const dayOfWeekIndex = selectedDate.getDay();
  const medicines = db.getAllMedicines();

  // Filtrar medicamentos para o dia selecionado
  const todayMedicines = medicines.filter(m => 
    m.daysOfWeek.includes(dayOfWeekIndex)
  );

  // Definir título e label
  const today = new Date();
  const isSameDay = (d1, d2) => 
    d1.getDate() === d2.getDate() && 
    d1.getMonth() === d2.getMonth() && 
    d1.getFullYear() === d2.getFullYear();

  const isTodaySelected = isSameDay(selectedDate, today);

  if (agendaTitle) {
    agendaTitle.textContent = isTodaySelected ? 'Medicamentos de Hoje' : 'Medicamentos do Dia';
  }

  if (agendaLabel) {
    agendaLabel.textContent = formatDate(selectedDate);
  }

  if (todayMedicines.length === 0) {
    upcomingMedicines.innerHTML = '<p class="empty-list">Nenhum remédio agendado para este dia.</p>';
  } else {
    todayMedicines.sort((a, b) => a.time.localeCompare(b.time));
    todayMedicines.forEach(medicine => {
      const card = createUpcomingCard(medicine);
      upcomingMedicines.appendChild(card);
    });
  }
}

function createUpcomingCard(medicine) {
  const card = document.createElement('div');
  card.className = 'medicine-card';

  const daysRemaining = db.getDaysRemaining(medicine);
  const isLow = db.isRunningLow(medicine);
  const isOut = db.isOutOfStock(medicine);

  let statusClass = '';
  let statusText = '';
  if (isOut) {
    statusClass = 'out-of-stock';
    statusText = 'SEM ESTOQUE';
  } else if (isLow) {
    statusClass = 'running-low';
    statusText = `ACABANDO`;
  } else {
    statusClass = 'ok';
    statusText = `${daysRemaining}d`;
  }

  card.innerHTML = `
    <div class="card-header">
      <h3>${medicine.name}</h3>
      <span class="status ${statusClass}">${statusText}</span>
    </div>
    <div class="card-body">
      <p class="card-info">
        <span class="label">Horário:</span> 
        <span class="value">${medicine.time}</span>
      </p>
      <p class="card-info">
        <span class="label">Dose:</span> 
        <span class="value">${medicine.dosage} unidade(s)</span>
      </p>
      <p class="card-info">
        <span class="label">Estoque:</span> 
        <span class="value">${medicine.stock} unidades</span>
      </p>
    </div>
  `;

  card.addEventListener('click', () => openDetailsModal(medicine));
  return card;
}

// ========== MODAL DE DETALHES ==========

function openDetailsModal(medicine) {
  currentMedicineId = medicine.id;
  const detailsTitle = document.getElementById('detailsTitle');
  const detailsContent = document.getElementById('medicineDetails');

  if (detailsTitle) detailsTitle.textContent = medicine.name;

  const daysRemaining = db.getDaysRemaining(medicine);
  const endDate = db.calculateEndDate(medicine);
  const daysOfWeekText = medicine.daysOfWeek
    .map(day => dayNames[day])
    .join(', ');

  if (detailsContent) {
    detailsContent.innerHTML = `
      <div class="detail-item">
        <span class="label">Estoque Atual:</span>
        <span class="value">${medicine.stock} unidades</span>
      </div>
      <div class="detail-item">
        <span class="label">Dose por Tomada:</span>
        <span class="value">${medicine.dosage} unidade(s)</span>
      </div>
      <div class="detail-item">
        <span class="label">Horário:</span>
        <span class="value">${medicine.time}</span>
      </div>
      <div class="detail-item">
        <span class="label">Dias da Semana:</span>
        <span class="value">${daysOfWeekText}</span>
      </div>
      <div class="detail-item">
        <span class="label">Dias Restantes:</span>
        <span class="value">${daysRemaining} dias</span>
      </div>
      <div class="detail-item">
        <span class="label">Previsão de Término:</span>
        <span class="value">${formatDateShort(endDate)}</span>
      </div>
    `;
  }

  if (detailsModal) detailsModal.classList.remove('hidden');
}

function closeDetailsModal() {
  if (detailsModal) detailsModal.classList.add('hidden');
  currentMedicineId = null;
}

// ========== EVENT LISTENERS NAV SEMANA ==========

if (prevWeekBtn) {
  prevWeekBtn.addEventListener('click', () => {
    selectedDate.setDate(selectedDate.getDate() - 7);
    renderCalendar();
    renderAgendaForSelectedDate();
  });
}

if (nextWeekBtn) {
  nextWeekBtn.addEventListener('click', () => {
    selectedDate.setDate(selectedDate.getDate() + 7);
    renderCalendar();
    renderAgendaForSelectedDate();
  });
}

if (closeDetailsBtn) {
  closeDetailsBtn.addEventListener('click', closeDetailsModal);
}

if (consumeBtn) {
  consumeBtn.addEventListener('click', () => {
    const medicine = db.getMedicineById(currentMedicineId);
    if (medicine && medicine.stock >= medicine.dosage) {
      medicine.stock -= medicine.dosage;
      db.saveMedicine(medicine);
      closeDetailsModal();
      renderAgendaForSelectedDate();
      renderCalendar();
      showNotification(`1 dose consumida! ${medicine.stock} unidades restantes.`);
    } else {
      alert('Estoque insuficiente!');
    }
  });
}

// ========== INICIALIZAÇÃO ==========

updateDateTime();
renderCalendar();
renderAgendaForSelectedDate();
