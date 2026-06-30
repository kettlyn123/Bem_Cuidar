// ========== SISTEMA DE NOTIFICAÇÕES E LEMBRETES ==========

class NotificationManager {
  constructor() {
    this.storageKey = 'bem_cuidar_notifications';
    this.requestPermission();
    this.startNotificationCheck();
  }

  requestPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  // Verificar a cada minuto se algum remédio está próximo da hora
  startNotificationCheck() {
    setInterval(() => {
      this.checkUpcomingMedicines();
    }, 60000); // Verificar a cada minuto

    // Verificar também na inicialização
    this.checkUpcomingMedicines();
  }

  checkUpcomingMedicines() {
    if (Notification.permission !== 'granted') return;

    const now = new Date();
    const currentDay = now.getDay();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const medicines = db.getAllMedicines();

    medicines.forEach(medicine => {
      // Verificar se é um dia que deve tomar
      if (!medicine.daysOfWeek.includes(currentDay)) return;

      // Extrair hora e minuto do medicamento
      const [medHour, medMinute] = medicine.time.split(':').map(Number);

      // Se está dentro de 5 minutos da hora agendada, notificar
      if (medHour === currentHour && medMinute - currentMinute <= 5 && medMinute - currentMinute >= 0) {
        this.showNotification(medicine);
      }

      // Se está faltando, também notificar
      if (medicine.stock <= medicine.dosage * 3) {
        this.showStockWarning(medicine);
      }
    });
  }

  showNotification(medicine) {
    const notificationKey = `notified_${medicine.id}_${new Date().toDateString()}`;
    
    if (localStorage.getItem(notificationKey)) {
      return; // Já foi notificado hoje
    }

    const notification = new Notification('Hora de tomar o medicamento!', {
      body: `${medicine.name} às ${medicine.time}`,
      icon: '💊',
      tag: `medicine_${medicine.id}`,
      requireInteraction: true
    });

    localStorage.setItem(notificationKey, 'true');

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }

  showStockWarning(medicine) {
    const warningKey = `warned_${medicine.id}_${new Date().toDateString()}`;
    
    if (localStorage.getItem(warningKey)) {
      return;
    }

    const notification = new Notification('Atenção! Remédio acabando', {
      body: `${medicine.name} - Estoque: ${medicine.stock} unidades`,
      icon: '⚠️',
      tag: `warning_${medicine.id}`
    });

    localStorage.setItem(warningKey, 'true');
  }
}

// Inicializar gerenciador de notificações
const notificationManager = new NotificationManager();
