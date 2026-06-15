// ========== LÓGICA DA PÁGINA DE AGENDA ==========

const agendaLabel = document.getElementById('agendaLabel');
const upcomingMedicines = document.getElementById('upcomingMedicines');
const medicinesList = document.getElementById('medicinesList');

function renderUpcomingMedicines() {
  const now = new Date();
  const currentDay = now.getDay();
  const medicines = db.getAllMedicines();

  // Filtrar medicamentos para hoje
  const todayMedicines = medicines.filter(m => 
    m.daysOfWeek.includes(currentDay)
  );

  agendaLabel.textContent = formatDate(now);

  if (todayMedicines.length === 0) {
    upcomingMedicines.innerHTML = '<p class="empty-list">Nenhum medicamento agendado para hoje.</p>';
  } else {
    upcomingMedicines.innerHTML = '';
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

  return card;
}

function renderAllMedicines() {
  const medicines = db.getAllMedicines();
  
  if (medicines.length === 0) {
    medicinesList.innerHTML = '<p class="empty-list">Nenhum medicamento cadastrado.</p>';
    return;
  }

  medicinesList.innerHTML = '';
  medicines.forEach(medicine => {
    const card = document.createElement('div');
    card.className = 'medicine-card';

    const daysRemaining = db.getDaysRemaining(medicine);
    const daysOfWeekText = medicine.daysOfWeek
      .map(day => dayNamesShort[day])
      .join(', ');

    let statusClass = '';
    let statusText = '';
    if (db.isOutOfStock(medicine)) {
      statusClass = 'out-of-stock';
      statusText = 'SEM ESTOQUE';
    } else if (db.isRunningLow(medicine)) {
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
          <span class="label">Dias:</span> 
          <span class="value">${daysOfWeekText}</span>
        </p>
        <p class="card-info">
          <span class="label">Estoque:</span> 
          <span class="value">${medicine.stock} unidades</span>
        </p>
      </div>
    `;

    medicinesList.appendChild(card);
  });
}

// ========== INICIALIZAÇÃO ==========

updateDateTime();
renderUpcomingMedicines();
renderAllMedicines();

// Atualizar a cada minuto
setInterval(() => {
  renderUpcomingMedicines();
}, 60000);
