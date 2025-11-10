const { createApp } = Vue;

/*
  Correzione bug di selezione data: evitare uso di toISOString() per ricavare la data
  perché converte in UTC e può spostare il giorno. Usiamo una funzione che formatta
  la data in base al locale (YYYY-MM-DD) usando getFullYear/getMonth/getDate.
*/
createApp({
  data() {
    const today = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    const todayLocal = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`;

    return {
      user: localStorage.getItem("user") || "",
      // caricheremo e normalizzeremo gli eventi in created()
      events: [],
      month: today.getMonth(),
      year: today.getFullYear(),
      selectedDate: todayLocal,
      newEvent: { title: "", time: "", place: "", color: "#87CEEB" }
    };
  },
  created() {
    if (!this.user) {
      window.location.href = "login.html";
      return;
    }

    // Carica eventi dal localStorage e normalizza le date al formato locale YYYY-MM-DD
    const raw = JSON.parse(localStorage.getItem(`events_${this.user}`)) || [];
    this.events = raw.map(e => {
      const dateStr = this.formatDateLocal(new Date(e.date));
      const color = e.color || '#87CEEB';
      return { ...e, date: dateStr, color, textColor: this.getContrastColor(color) };
    });
  },
  computed: {
    monthNames() {
      return [
        "Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno",
        "Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"
      ];
    },
    weekDays() {
      return ["Dom","Lun","Mar","Mer","Gio","Ven","Sab"];
    },
    calendarCells() {
      const firstDay = new Date(this.year, this.month, 1).getDay(); // 0 = domenica
      const daysInMonth = new Date(this.year, this.month + 1, 0).getDate();
      const cells = [];

      for (let i = 0; i < firstDay; i++) {
        cells.push({ key: `empty-${i}`, day: null, fullDate: null, isToday: false });
      }

      for (let d = 1; d <= daysInMonth; d++) {
        const dt = new Date(this.year, this.month, d);
        const isoLocal = this.formatDateLocal(dt);
        const isToday = isoLocal === this.formatDateLocal(new Date());
        cells.push({ key: `day-${d}`, day: d, fullDate: isoLocal, isToday });
      }

      return cells;
    }
  },
  methods: {
    // Calcola il colore del testo (bianco o nero) in base alla luminosità del colore di sfondo
    getContrastColor(hex) {
      if (!hex) return '#000';
      // rimuove il # se presente
      const h = hex.replace('#','');
      // supporta shorthand rgb (#fff)
      const fullHex = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
      const r = parseInt(fullHex.substring(0,2), 16);
      const g = parseInt(fullHex.substring(2,4), 16);
      const b = parseInt(fullHex.substring(4,6), 16);
      // Calcola luminanza percepita
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      // Se luce alta => testo scuro
      return lum > 180 ? '#000' : '#fff';
    },
    // formatta una Date in YYYY-MM-DD usando valori locali (evita spostamenti UTC)
    formatDateLocal(date) {
      if (!(date instanceof Date) || isNaN(date)) return null;
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    },
    selectDate(cell) {
      if (!cell || !cell.fullDate) return;
      // assegna la data formattata localmente
      this.selectedDate = cell.fullDate;
    },
    eventsForDate(date) {
      if (!date) return [];
      // confrontiamo normalizzando le date degli eventi (nel caso fossero caricate in formati diversi)
      return this.events.filter(e => this.formatDateLocal(new Date(e.date)) === date && e.user === this.user);
    },
    addEvent() {
      if (!this.newEvent.title) {
        alert('Inserisci il titolo dell\'evento');
        return;
      }
      const event = {
        id: Date.now(),
        title: this.newEvent.title,
        date: this.selectedDate,
        time: this.newEvent.time || '',
        place: this.newEvent.place || '',
        color: this.newEvent.color || '#87CEEB',
        textColor: this.getContrastColor(this.newEvent.color || '#87CEEB'),
        user: this.user
      };

      this.events.push(event);
      this.saveEvents();

      this.newEvent = { title: "", time: "", place: "", color: "#87CEEB" };
    },
    deleteEventById(id) {
      const idx = this.events.findIndex(e => e.id === id);
      if (idx !== -1) {
        this.events.splice(idx, 1);
        this.saveEvents();
      }
    },
    saveEvents() {
      localStorage.setItem(`events_${this.user}`, JSON.stringify(this.events));
    },
    logout() {
      localStorage.removeItem('user');
      window.location.href = 'login.html';
    },
    prevMonth() {
      if (this.month === 0) { this.month = 11; this.year -= 1; }
      else this.month -= 1;
    },
    nextMonth() {
      if (this.month === 11) { this.month = 0; this.year += 1; }
      else this.month += 1;
    }
  }
}).mount('#app');
