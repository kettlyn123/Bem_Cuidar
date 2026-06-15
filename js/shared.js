// ========== BANCO DE DADOS COM LOCALSTORAGE ==========

const userProfile = {
  name: 'John Doe',
  plan: 'Padrão',
  phone: '+55 11 99999-9999'
};

// Inicializar dados padrão
const defaultMedicines = [
  { 
    id: 1,
    name: 'Losartana', 
    stock: 30,
    dosage: 1,
    daysToTake: 30,
    daysOfWeek: [1, 2, 3, 4, 5],
    time: '08:00',
    lastUpdated: new Date().toISOString()
  },
  { 
    id: 2,
    name: 'Loratadina', 
    stock: 20,
    dosage: 1,
    daysToTake: 15,
    daysOfWeek: [1, 3, 5],
    time: '09:00',
    lastUpdated: new Date().toISOString()
  }
];

// Sistema de armazenamento
class MedicineDatabase {
  constructor() {
    this.storageKey = 'bem_cuidar_medicines';
    this.notificationsKey = 'bem_cuidar_notifications';
    this.initializeStorage();
  }

  initializeStorage() {
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify(defaultMedicines));
    }
  }

  getAllMedicines() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey)) || [];
    } catch (e) {
      console.error('Erro ao carregar medicamentos:', e);
      return [];
    }
  }

  getMedicineById(id) {
    const medicines = this.getAllMedicines();
    return medicines.find(m => m.id === id);
  }

  saveMedicine(medicine) {
    const medicines = this.getAllMedicines();
    medicine.lastUpdated = new Date().toISOString();
    
    const index = medicines.findIndex(m => m.id === medicine.id);
    if (index > -1) {
      medicines[index] = medicine;
    } else {
      medicine.id = Date.now();
      medicines.push(medicine);
    }
    
    localStorage.setItem(this.storageKey, JSON.stringify(medicines));
    return medicine;
  }

  deleteMedicine(id) {
    const medicines = this.getAllMedicines();
    const filtered = medicines.filter(m => m.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(filtered));
  }

  // Calcular próxima data de término
  calculateEndDate(medicine) {
    const now = new Date();
    const daysPerWeek = medicine.daysOfWeek.length;
    const dosesPerWeek = daysPerWeek; // 1 dose por dia nos dias marcados
    const weeksNeeded = Math.ceil((medicine.stock / medicine.dosage) / dosesPerWeek);
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + (weeksNeeded * 7));
    return endDate;
  }

  // Calcular dias restantes
  getDaysRemaining(medicine) {
    const endDate = this.calculateEndDate(medicine);
    const now = new Date();
    const diff = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }

  // Verificar se está acabando (menos de 7 dias)
  isRunningLow(medicine) {
    const daysRemaining = this.getDaysRemaining(medicine);
    return daysRemaining <= 7 && daysRemaining > 0;
  }

  // Verificar se acabou
  isOutOfStock(medicine) {
    return medicine.stock <= 0;
  }
}

const db = new MedicineDatabase();

// ========== FUNÇÕES DE FORMATAÇÃO ==========

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

function formatDateShort(date) {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function updateDateTime() {
  const dateDisplay = document.getElementById('dateDisplay');
  const timeDisplay = document.getElementById('timeDisplay');
  
  if (dateDisplay && timeDisplay) {
    const now = new Date();
    dateDisplay.textContent = formatDate(now);
    timeDisplay.textContent = formatTime(now);
    setTimeout(updateDateTime, 1000);
  }
}

// ========== NOMES DOS DIAS ==========

const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const dayNamesShort = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
