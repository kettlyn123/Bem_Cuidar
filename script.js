const medicines = [
  { name: 'Losartana', stock: 30 },
  { name: 'Loratadina', stock: 20 },
  { name: 'Lorazepam', stock: 12 },
  { name: 'Amoxicilina', stock: 30 },
  { name: 'Ibuprofeno', stock: 60 },
  { name: 'Sinvastatina', stock: 20 }
];

const medicineList = document.getElementById('medicineList');
const searchInput = document.getElementById('searchInput');
const template = document.getElementById('medicineCardTemplate');
const dateDisplay = document.getElementById('dateDisplay');
const timeDisplay = document.getElementById('timeDisplay');
const currentDateLabel = document.getElementById('currentDateLabel');
const currentTimeLabel = document.getElementById('currentTimeLabel');
const timeBar = document.getElementById('timeBar');
const weekdayBar = document.getElementById('weekdayBar');
const scheduleMedicineLabel = document.getElementById('scheduleMedicineLabel');
const agendaMonthLabel = document.getElementById('agendaMonthLabel');
const calendar = document.getElementById('calendar');
const selectedDayInfo = document.getElementById('selectedDayInfo');
const navItems = document.querySelectorAll('.nav-item');
const sections = {
  homeSection: document.getElementById('homeSection'),
  profileSection: document.getElementById('profileSection'),
  agendaSection: document.getElementById('agendaSection')
};

function formatDate(date) {
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
}

function formatTime(date) {
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function updateDateTime() {
  const now = new Date();
  dateDisplay.textContent = formatDate(now);
  timeDisplay.textContent = formatTime(now);
  currentDateLabel.textContent = `${now.getDate()} ${now.toLocaleDateString('pt-BR', { weekday: 'long' })}`;
  setTimeout(updateDateTime, 1000);
}

const medicinesByDay = {
  1: ['Losartana'],
  2: ['Loratadina'],
  3: ['Lorazepam'],
  4: ['Amoxicilina'],
  5: ['Ibuprofeno']
};

function updateScheduleForDay(dayValue) {
  const medicines = medicinesByDay[dayValue] || ['Nenhum remédio agendado'];
  scheduleMedicineLabel.textContent = `Remédio do dia: ${medicines.join(', ')}`;
}

function renderTimeBar() {
  const hours = [8, 9, 10, 11, 12];
  const now = new Date();
  const currentHour = now.getHours();
  const activeHour = hours.includes(currentHour) ? currentHour : 10;

  timeBar.innerHTML = '';
  hours.forEach((hour) => {
    const slot = document.createElement('div');
    slot.className = 'time-slot';
    if (hour === activeHour) {
      slot.classList.add('active');
    }
    slot.textContent = `${hour}h`;
    timeBar.appendChild(slot);
  });
}

function renderWeekdayBar() {
  const days = [
    { label: 'Seg', icon: '📅', value: 1 },
    { label: 'Ter', icon: '💊', value: 2 },
    { label: 'Qua', icon: '💊', value: 3 },
    { label: 'Qui', icon: '💊', value: 4 },
    { label: 'Sex', icon: '💊', value: 5 }
  ];

  const today = new Date().getDay();
  const activeDay = days.some((day) => day.value === today) ? today : 3;

  weekdayBar.innerHTML = '';
  days.forEach((day) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'weekday-item';
    if (day.value === activeDay) {
      button.classList.add('active');
    }
    button.innerHTML = `<span>${day.icon}</span><span>${day.label}</span>`;
    button.addEventListener('click', () => {
      document.querySelectorAll('.weekday-item').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      updateScheduleForDay(day.value);
    });
    weekdayBar.appendChild(button);
  });

  updateScheduleForDay(activeDay);
}

function renderMedicines(items) {
  medicineList.innerHTML = '';
  if (items.length === 0) {
    medicineList.innerHTML = '<p class="empty-list">Nenhum remédio encontrado.</p>';
    return;
  }

  items.forEach((medicine) => {
    const clone = template.content.cloneNode(true);
    clone.querySelector('.medicine-name').textContent = medicine.name;
    clone.querySelector('.medicine-stock').textContent = `${medicine.stock} unidades`;
    medicineList.appendChild(clone);
  });
}

function renderCalendar() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthName = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  agendaMonthLabel.textContent = monthName;

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  calendar.innerHTML = '';
  weekdays.forEach((day) => {
    const headerDay = document.createElement('div');
    headerDay.className = 'calendar-header';
    headerDay.textContent = day;
    calendar.appendChild(headerDay);
  });

  for (let blank = 0; blank < firstDay; blank += 1) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'calendar-day';
    emptyCell.textContent = '';
    calendar.appendChild(emptyCell);
  }

  for (let day = 1; day <= lastDate; day += 1) {
    const dayCell = document.createElement('div');
    dayCell.className = 'calendar-day';
    dayCell.textContent = day;
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      dayCell.classList.add('marked-day');
    }
    if (day === now.getDate()) {
      dayCell.classList.add('today');
    }
    dayCell.addEventListener('click', () => showAgendaDetail(date));
    calendar.appendChild(dayCell);
  }

  showAgendaDetail(now);
}

function showAgendaDetail(date) {
  const dayOfWeek = date.getDay();
  const label = date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
  const medicines = medicinesByDay[dayOfWeek] || [];
  const medicineText = medicines.length ? medicines.join(', ') : 'Nenhum remédio disponível';
  selectedDayInfo.innerHTML = `
    <strong>${label}</strong>
    <p>Remédio disponível: ${medicineText}</p>
  `;
}

function showSection(targetId) {
  Object.keys(sections).forEach((key) => {
    sections[key].classList.toggle('hidden', key !== targetId);
  });
  navItems.forEach((button) => {
    button.classList.toggle('active', button.dataset.target === targetId);
  });
}

navItems.forEach((button) => {
  button.addEventListener('click', () => {
    showSection(button.dataset.target);
  });
});

searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = medicines.filter((medicine) =>
    medicine.name.toLowerCase().includes(query)
  );
  renderMedicines(filtered);
});

updateDateTime();
renderWeekdayBar();
renderTimeBar();
renderMedicines(medicines);
renderCalendar();
