// app.js
// Semplice applicazione Vue 3 (principiante) organizzata secondo il paradigma MVC:
// - MODEL: dati in `events` e `dates` (persistiti in localStorage)
// - VIEW: il template in index.html utilizza direttive Vue (v-for, v-model, v-if)
// - CONTROLLER: metodi e hook (addEvent, openNewEvent, created)

const { createApp } = Vue;

createApp({
	data() {
		return {
			// proprietario dell'app (salvato in localStorage dal login)
			owner: localStorage.getItem('calendar_owner') || '',

			// lista delle date del mese corrente (MODEL)
			dates: [],

			// eventi: oggetto con chiave ISO date (YYYY-MM-DD) -> array di eventi
			events: {},

			// stato della "modal" per creare evento
			showModal: false,
			modalDate: null,

			// modello per il nuovo evento (v-model nel form)
			newEvent: {
				name: '',
				place: '',
				time: '',
				description: '',
				color: '#4CAF50',
				owner: '' // verrà impostato automaticamente
			}
		};
	},
	computed: {
		// display leggibile della data del modal
		modalDateDisplay() {
			if (!this.modalDate) return '';
			const d = new Date(this.modalDate);
			return d.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' });
		}
	},
	created() {
		// Hook lifecycle: eseguito quando l'app è inizializzata
		// 1) verifica se esiste owner, altrimenti reindirizza a login
		if (!this.owner) {
			window.location.href = 'login.html';
			return;
		}

		// carica gli eventi dal localStorage (MODEL persistenza)
		this.loadEventsFromStorage();

		// costruisce la lista di date del mese corrente (MODEL)
		this.buildDatesForCurrentMonth();
	},
	methods: {
		// Costruisce l'array `dates` con { iso, display }
		buildDatesForCurrentMonth() {
			const now = new Date();
			const year = now.getFullYear();
			const month = now.getMonth(); // 0-based
			const first = new Date(year, month, 1);
			const last = new Date(year, month + 1, 0);
			const days = last.getDate();
			this.dates = [];
			for (let d = 1; d <= days; d++) {
				const dt = new Date(year, month, d);
				const iso = dt.toISOString().slice(0, 10); // YYYY-MM-DD
				const display = dt.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' });
				this.dates.push({ iso, display });
			}
		},

		// Ritorna array di eventi per una data (se non ci sono, ritorna [])
		getEventsFor(isoDate) {
			return this.events[isoDate] || [];
		},

		// Apre la modal per una data selezionata
		openNewEvent(isoDate) {
			this.modalDate = isoDate;
			this.newEvent = {
				name: '',
				place: '',
				time: '',
				description: '',
				color: '#4CAF50',
				owner: this.owner
			};
			this.showModal = true;
		},

		// Chiude la modal
		closeModal() {
			this.showModal = false;
			this.modalDate = null;
		},

		// Aggiunge l'evento al MODEL e lo salva nello storage
		addEvent() {
			if (!this.newEvent.name.trim()) {
				alert('Inserisci il nome dell\'evento.');
				return;
			}
			const iso = this.modalDate;
			if (!this.events[iso]) this.events[iso] = [];
			// Copia dei dati dell'evento (immutabilità semplice)
			const ev = {
				name: this.newEvent.name,
				place: this.newEvent.place,
				time: this.newEvent.time,
				description: this.newEvent.description,
				color: this.newEvent.color,
				owner: this.newEvent.owner || this.owner
			};
			this.events[iso].push(ev);
			// Persistenza
			this.saveEventsToStorage();
			// Chiude modal
			this.closeModal();
		},

		// Salva events in localStorage
		saveEventsToStorage() {
			try {
				localStorage.setItem('calendar_events', JSON.stringify(this.events));
			} catch (e) {
				console.error('Impossibile salvare gli eventi', e);
			}
		},

		// Carica events da localStorage
		loadEventsFromStorage() {
			try {
				const raw = localStorage.getItem('calendar_events');
				if (raw) this.events = JSON.parse(raw);
			} catch (e) {
				console.error('Errore caricamento eventi', e);
				this.events = {};
			}
		},

		// Logout: rimuove owner e manda a login
		logout() {
			localStorage.removeItem('calendar_owner');
			window.location.href = 'login.html';
		}
	}
}).mount('#app');

// NOTE per lo studente (commenti didattici):
// - v-model usa il two-way binding per tenere sincronizzati i campi del form con `newEvent`.
// - v-for viene usato per mostrare le date e per mostrare gli eventi di ogni data.
// - created è un lifecycle hook che inizializza i dati quando l'app parte.
// - localStorage è usato come persistenza semplice (simula un MODEL permanente tra refresh).

