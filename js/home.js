// ========== LÓGICA DA PÁGINA INICIAL ==========

const medicineList = document.getElementById('medicineList');
const searchInput = document.getElementById('searchInput');
const addMedicineBtn = document.getElementById('addMedicineBtn');
const medicineModal = document.getElementById('medicineModal');
const detailsModal = document.getElementById('detailsModal');
const medicineForm = document.getElementById('medicineForm');
const modalTitle = document.getElementById('modalTitle');
const closeModalBtn = document.getElementById('closeModalBtn');
const closeDetailsBtn = document.getElementById('closeDetailsBtn');
const cancelBtn = document.getElementById('cancelBtn');
const deleteBtn = document.getElementById('deleteBtn');
const editBtn = document.getElementById('editBtn');
const consumeBtn = document.getElementById('consumeBtn');

// Inputs do formulário
const medicineName = document.getElementById('medicineName');
const medicineStock = document.getElementById('medicineStock');
const medicineDosage = document.getElementById('medicineDosage');
const medicineTime = document.getElementById('medicineTime');
const medicineDaysToTake = document.getElementById('medicineDaysToTake');
const dayCheckboxes = document.querySelectorAll('.day-checkbox');

let currentMedicineId = null;

// ========== RENDER DA LISTA ==========

function renderMedicines(filterText = '') {
  medicineList.innerHTML = '';
  const medicines = db.getAllMedicines();
  const filtered = medicines.filter(m => 
    m.name.toLowerCase().includes(filterText.toLowerCase())
  );

  if (filtered.length === 0) {
    medicineList.innerHTML = '<p class="empty-list">Nenhum remédio adicionado. Clique em "+ Adicionar" para começar.</p>';
    return;
  }

  filtered.forEach(medicine => {
    const card = createMedicineCard(medicine);
    medicineList.appendChild(card);
  });
}

function createMedicineCard(medicine) {
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
    statusText = `ACABANDO (${daysRemaining}d)`;
  } else {
    statusClass = 'ok';
    statusText = `${daysRemaining} dias`;
  }

  const endDate = db.calculateEndDate(medicine);
  const daysOfWeekText = medicine.daysOfWeek
    .map(day => dayNamesShort[day])
    .join(', ');

  card.innerHTML = `
    <div class="card-header">
      <h3>${medicine.name}</h3>
      <span class="status ${statusClass}">${statusText}</span>
    </div>
    <div class="card-body">
      <p class="card-info">
        <span class="label">Estoque:</span> 
        <span class="value">${medicine.stock} unidades</span>
      </p>
      <p class="card-info">
        <span class="label">Dose:</span> 
        <span class="value">${medicine.dosage} un. por tomada</span>
      </p>
      <p class="card-info">
        <span class="label">Horário:</span> 
        <span class="value">${medicine.time}</span>
      </p>
      <p class="card-info">
        <span class="label">Dias:</span> 
        <span class="value">${daysOfWeekText}</span>
      </p>
      <p class="card-info">
        <span class="label">Previsão:</span> 
        <span class="value">${formatDateShort(endDate)}</span>
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

  detailsTitle.textContent = medicine.name;

  const daysRemaining = db.getDaysRemaining(medicine);
  const endDate = db.calculateEndDate(medicine);
  const daysOfWeekText = medicine.daysOfWeek
    .map(day => dayNames[day])
    .join(', ');

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
  const medicine = db.getMedicineById(id);
  if (!medicine) return;

  currentMedicineId = id;
  modalTitle.textContent = 'Editar Remédio';
  deleteBtn.style.display = 'block';

  medicineName.value = medicine.name;
  medicineStock.value = medicine.stock;
  medicineDosage.value = medicine.dosage;
  medicineTime.value = medicine.time;
  medicineDaysToTake.value = medicine.daysToTake || '';

  dayCheckboxes.forEach(cb => {
    cb.checked = medicine.daysOfWeek.includes(parseInt(cb.value));
  });

  medicineModal.classList.remove('hidden');
  medicineName.focus();
}

function closeAddModal() {
  medicineModal.classList.add('hidden');
  currentMedicineId = null;
}

// ========== SALVAR REMÉDIO ==========

medicineForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const selectedDays = Array.from(dayCheckboxes)
    .filter(cb => cb.checked)
    .map(cb => parseInt(cb.value));

  if (selectedDays.length === 0) {
    alert('Selecione pelo menos um dia da semana!');
    return;
  }

  const medicine = {
    id: currentMedicineId || Date.now(),
    name: medicineName.value,
    stock: parseInt(medicineStock.value),
    dosage: parseInt(medicineDosage.value),
    time: medicineTime.value,
    daysOfWeek: selectedDays,
    daysToTake: medicineDaysToTake.value ? parseInt(medicineDaysToTake.value) : null,
    lastUpdated: new Date().toISOString()
  };

  db.saveMedicine(medicine);
  closeAddModal();
  renderMedicines(searchInput.value);
  showNotification('Remédio salvo com sucesso!');
});

// ========== DELETAR REMÉDIO ==========

deleteBtn.addEventListener('click', () => {
  if (confirm('Tem certeza que deseja deletar este remédio?')) {
    db.deleteMedicine(currentMedicineId);
    closeAddModal();
    renderMedicines(searchInput.value);
    showNotification('Remédio deletado!');
  }
});

// ========== CONSUMIR DOSE ==========

consumeBtn.addEventListener('click', () => {
  const medicine = db.getMedicineById(currentMedicineId);
  if (medicine && medicine.stock >= medicine.dosage) {
    medicine.stock -= medicine.dosage;
    db.saveMedicine(medicine);
    closeDetailsModal();
    renderMedicines(searchInput.value);
    showNotification(`1 dose consumida! ${medicine.stock} unidades restantes.`);
  } else {
    alert('Estoque insuficiente!');
  }
});

// ========== BUSCA ==========

searchInput.addEventListener('input', () => {
  renderMedicines(searchInput.value);
});

// ========== NOTIFICAÇÕES ==========

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

// ========== EVENT LISTENERS ==========

addMedicineBtn.addEventListener('click', openAddModal);
closeModalBtn.addEventListener('click', closeAddModal);
closeDetailsBtn.addEventListener('click', closeDetailsModal);
cancelBtn.addEventListener('click', closeAddModal);
editBtn.addEventListener('click', () => openEditModal(currentMedicineId));

// ========== INICIALIZAÇÃO ==========

updateDateTime();
renderMedicines();
