// In Vue 3 prendiamo la funzione createApp dall'oggetto Vue
const { createApp } = Vue;

/* 
   COMPONENTE SEMPLICE PER UN GIORNO DEL CALENDARIO
   Questo è un piccolo "pezzo di interfaccia"
   Lo usiamo per mostrare i numeri dei giorni.
*/
const DayCell = {
  // props = dati che arrivano dal "genitore"
  props: ["dayNumber", "isSelected"],
  // template = parte grafica solo di questo giorno
  template: `
    <button
      class="day-cell"
      :class="{ selected: isSelected }"
      @click="$emit('select-day', dayNumber)"
    >
      {{ dayNumber }}
    </button>
  `
};

// QUI CREIAMO LA NOSTRA APP VUE (MVC dentro Vue)

// createApp riceve un oggetto con:
// MODEL → data()
// VIEW → template
// CONTROLLER → methods
createApp({
  // MODEL: qui teniamo tutti i dati (stato dell'app)
  data() {
    return {
      // anno e mese che stiamo guardando
      currentYear: new Date().getFullYear(),
      currentMonth: new Date().getMonth(), // 0 = gennaio, 11 = dicembre

      // giorno selezionato (numero, es. 1, 2, 3...)
      selectedDay: null,

      // testo dell'evento che vogliamo aggiungere
      newEventText: "",

      /* 
         events è il nostro MODEL delle attività.
         È un oggetto dove la chiave è una data in formato "YYYY-MM-DD"
         e il valore è un array di stringhe (gli eventi di quel giorno).
         Esempio:
         {
           "2025-11-18": ["compito di mate", "allenamento"]
         }
      */
      events: {}
    };
  },

  // Registriamo il componente per un singolo giorno
  components: {
    DayCell
  },

  // VIEW: template = la parte HTML che l'utente vede
  // Usando le "parentesi graffe" {{ }} e le direttive Vue (v-for, v-if, v-model...)
  template: `
    <div class="calendar-app">
      <h1>Calendario super semplice con Vue</h1>

      <!-- intestazione con mese e anno -->
      <div class="header">
        <button @click="prevMonth">◀</button>
        <span>{{ monthName }} {{ currentYear }}</span>
        <button @click="nextMonth">▶</button>
      </div>

      <!-- giorni della settimana (solo testo, molto semplice) -->
      <div class="week-row">
        <span>Lun</span>
        <span>Mar</span>
        <span>Mer</span>
        <span>Gio</span>
        <span>Ven</span>
        <span>Sab</span>
        <span>Dom</span>
      </div>

      <!-- griglia dei giorni del mese -->
      <!-- usiamo v-for per ripetere il componente DayCell -->
      <div class="days-grid">
        <DayCell
          v-for="day in daysInMonth"
          :key="day"
          :dayNumber="day"
          :isSelected="day === selectedDay"
          @select-day="selectDay"
        />
      </div>

      <!-- se nessun giorno è selezionato -->
      <p v-if="!selectedDay" class="info">
        Clicca su un giorno per vedere o aggiungere eventi.
      </p>

      <!-- se un giorno è selezionato, facciamo vedere la sezione eventi -->
      <div v-if="selectedDay" class="events-panel">
        <h2>Eventi del giorno: {{ selectedDateKey }}</h2>

        <!-- elenco eventi per quel giorno -->
        <!-- eventsForSelectedDay è una proprietà computata (computed) -->
        <ul v-if="eventsForSelectedDay.length > 0">
          <li v-for="(ev, index) in eventsForSelectedDay" :key="index">
            {{ ev }}
            <button @click="deleteEvent(index)">X</button>
          </li>
        </ul>
        <p v-else>Nessun evento per questo giorno.</p>

        <!-- form per aggiungere un nuovo evento -->
        <!-- v-model collega input ⇄ dato (two-way binding) -->
        <div class="add-event">
          <input
            type="text"
            v-model="newEventText"
            placeholder="Scrivi il tuo evento qui"
          />
          <button @click="addEvent">Aggiungi evento</button>
        </div>
      </div>
    </div>
  `,

  // CONTROLLER: qui mettiamo le funzioni che comandano la nostra app
  methods: {
    // cambia giorno selezionato quando clicchiamo su un DayCell
    selectDay(dayNumber) {
      this.selectedDay = dayNumber;
      // resettiamo la casella di testo quando scegliamo un nuovo giorno
      this.newEventText = "";
    },

    // aggiunge un evento al giorno selezionato
    addEvent() {
      // se il testo è vuoto, non facciamo niente
      if (!this.newEventText.trim()) {
        return;
      }

      // se per questa data non esiste ancora un array, lo creiamo
      if (!this.events[this.selectedDateKey]) {
        this.events[this.selectedDateKey] = [];
      }

      // aggiungiamo il nuovo evento all'array
      this.events[this.selectedDateKey].push(this.newEventText.trim());

      // puliamo l'input
      this.newEventText = "";
    },

    // elimina un evento in base all'indice
    deleteEvent(index) {
      this.events[this.selectedDateKey].splice(index, 1);
    },

    // vai al mese precedente
    prevMonth() {
      this.currentMonth--;
      if (this.currentMonth < 0) {
        this.currentMonth = 11;
        this.currentYear--;
      }
      // quando cambio mese tolgo il giorno selezionato
      this.selectedDay = null;
    },

    // vai al mese successivo
    nextMonth() {
      this.currentMonth++;
      if (this.currentMonth > 11) {
        this.currentMonth = 0;
        this.currentYear++;
      }
      this.selectedDay = null;
    }
  },

  // computed = valori calcolati automaticamente a partire dai dati
  computed: {
    // nome del mese in italiano (VIEW leggibile)
    monthName() {
      // qui usiamo l'oggetto Date solo per ottenere il nome del mese
      const data = new Date(this.currentYear, this.currentMonth, 1);
      return data.toLocaleString("it-IT", { month: "long" });
    },

    // array con tutti i giorni del mese (1,2,3,...)
    daysInMonth() {
      // ultimo giorno del mese: mettiamo giorno 0 del mese successivo
      const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

      // creiamo un array di numeri [1, 2, 3, ..., lastDay]
      const days = [];
      for (let i = 1; i <= lastDay; i++) {
        days.push(i);
      }
      return days;
    },

    // chiave data in formato "YYYY-MM-DD" per il giorno selezionato
    selectedDateKey() {
      if (!this.selectedDay) {
        return "";
      }

      // mese e giorno con due cifre (es. 03, 12, ...)
      const month = String(this.currentMonth + 1).padStart(2, "0");
      const day = String(this.selectedDay).padStart(2, "0");

      return this.currentYear + "-" + month + "-" + day;
    },

    // lista degli eventi per il giorno selezionato
    eventsForSelectedDay() {
      if (!this.selectedDateKey) {
        return [];
      }
      // se non ci sono eventi per quella data, restituiamo array vuoto
      return this.events[this.selectedDateKey] || [];
    }
  },

  // watch = "osserva" un dato e reagisce se cambia
  watch: {
    // ogni volta che cambia il giorno selezionato, eseguiamo questa funzione
    selectedDay(newValue, oldValue) {
      console.log("Giorno cambiato da", oldValue, "a", newValue);
      // questo è solo per far vedere che sappiamo usare watch
    }
  }
})
// montiamo l'app dentro il div con id="app" (VIEW)
.mount("#app");
