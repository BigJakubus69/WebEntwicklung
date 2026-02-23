/* global alert */

import { PaginatedList } from './Pagination.js';
import { QRCodeGenerator } from './QRCodeGenerator.js';

export class KundeView {
  constructor (apiClient) {
    this.apiClient = apiClient;
    // Instanzen werden erst nach dem Rendern erstellt
    this.vorstellungenList = null;
    this.qrGenerator = null;
    this.currentVorstellung = null;
    this.ausgewaehlteSitze = new Set();
  }

  render () {
    const app = document.getElementById('app');
    app.innerHTML = `
            <div class="container">
                <h2>Kundenbereich</h2>
                
                <div class="section">
                    <h3>Verfügbare Vorstellungen</h3>
                    <div id="vorstellungen-list" class="grid-list"></div>
                </div>

                <div id="sitzplatz-auswahl" style="display: none;">
                    <h3>Sitzplatzauswahl für <span id="aktueller-film"></span></h3>
                    <div id="sitzplan"></div>
                    
                    <div class="form-group">
                        <label for="kunden-name">Ihr Name:</label>
                        <input type="text" id="kunden-name" required>
                    </div>
                    
                    <button id="reservieren-btn">Reservieren</button>
                    <button id="zurueck-btn">Zurück zur Auswahl</button>
                </div>
            </div>
            <div id="qr-container"></div>
        `;

    // Jetzt existieren die Container im DOM - hier werden die Instanzen erstellt
    this.vorstellungenList = new PaginatedList('vorstellungen-list', (vorstellung) => this.createVorstellungCard(vorstellung));
    this.qrGenerator = new QRCodeGenerator('qr-container');

    this.loadVorstellungen();
    this.initEventListeners();
  }

  initEventListeners () {
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('sitz') && e.target.classList.contains('verfuegbar')) {
        this.toggleSitz(e.target);
      }
    });

    document.getElementById('reservieren-btn')?.addEventListener('click', () => this.reservieren());
    document.getElementById('zurueck-btn')?.addEventListener('click', () => this.zurueckZurAuswahl());
  }

  async loadVorstellungen () {
    try {
      const vorstellungen = await this.apiClient.getVorstellungen();
      this.vorstellungenList.setItems(vorstellungen);
    } catch (error) {
      alert('Fehler beim Laden der Vorstellungen: ' + error.message);
    }
  }

  createVorstellungCard (vorstellung) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
            <h3>${vorstellung.filmName}</h3>
            <p>Datum: ${new Date(vorstellung.datumUhrzeit).toLocaleString()}</p>
            <p>Kinosaal: ${vorstellung.kinosaal.name}</p>
            <button class="select-show-btn" data-id="${vorstellung._id}">Sitzplätze auswählen</button>
        `;

    card.querySelector('.select-show-btn').addEventListener('click', () => {
      this.showSitzplatzAuswahl(vorstellung);
    });

    return card;
  }

  async showSitzplatzAuswahl (vorstellung) {
    this.currentVorstellung = vorstellung;
    this.ausgewaehlteSitze.clear();

    document.getElementById('vorstellungen-list').parentElement.style.display = 'none';
    document.getElementById('sitzplatz-auswahl').style.display = 'block';
    document.getElementById('aktueller-film').textContent = vorstellung.filmName;

    try {
      const reservierungen = await this.apiClient.getReservierungenFuerVorstellung(vorstellung._id);
      this.renderSitzplan(vorstellung, reservierungen);
    } catch (error) {
      alert('Fehler beim Laden der Sitzplätze: ' + error.message);
    }
  }

  renderSitzplan (vorstellung, reservierungen) {
    const sitzplan = document.getElementById('sitzplan');
    sitzplan.innerHTML = '';
    sitzplan.className = 'sitzplan';

    const reservierteSitze = new Set();
    reservierungen.forEach(res => {
      res.sitzplaetze.forEach(sitz => {
        reservierteSitze.add(`${sitz.reihe}-${sitz.sitz}`);
      });
    });

    for (let reihe = 1; reihe <= vorstellung.kinosaal.anzahlReihen; reihe++) {
      const reiheDiv = document.createElement('div');
      reiheDiv.className = 'reihe';
      reiheDiv.innerHTML = `<span>Reihe ${reihe}</span>`;

      for (let sitz = 1; sitz <= vorstellung.kinosaal.anzahlSitzeProReihe; sitz++) {
        const sitzDiv = document.createElement('div');
        sitzDiv.className = 'sitz';
        sitzDiv.dataset.reihe = reihe;
        sitzDiv.dataset.sitz = sitz;
        sitzDiv.textContent = sitz;

        const sitzKey = `${reihe}-${sitz}`;
        if (reservierteSitze.has(sitzKey)) {
          sitzDiv.classList.add('reserviert');
        } else {
          sitzDiv.classList.add('verfuegbar');
        }

        reiheDiv.appendChild(sitzDiv);
      }

      sitzplan.appendChild(reiheDiv);
    }
  }

  toggleSitz (sitzElement) {
    const reihe = sitzElement.dataset.reihe;
    const sitz = sitzElement.dataset.sitz;
    const sitzKey = `${reihe}-${sitz}`;

    if (this.ausgewaehlteSitze.has(sitzKey)) {
      this.ausgewaehlteSitze.delete(sitzKey);
      sitzElement.classList.remove('ausgewaehlt');
    } else {
      this.ausgewaehlteSitze.add(sitzKey);
      sitzElement.classList.add('ausgewaehlt');
    }
  }

  async reservieren () {
    const kundenName = document.getElementById('kunden-name').value;

    if (!kundenName) {
      alert('Bitte geben Sie Ihren Namen ein');
      return;
    }

    if (this.ausgewaehlteSitze.size === 0) {
      alert('Bitte wählen Sie mindestens einen Sitzplatz aus');
      return;
    }

    const sitzplaetze = Array.from(this.ausgewaehlteSitze).map(key => {
      const [reihe, sitz] = key.split('-').map(Number);
      return { reihe, sitz };
    });

    try {
      const reservierung = await this.apiClient.createReservierung({
        vorstellungId: this.currentVorstellung._id,
        sitzplaetze,
        kundenName
      });

      alert('Reservierung erfolgreich!');
      this.qrGenerator.generateAndShow(reservierung);
      this.zurueckZurAuswahl();
    } catch (error) {
      alert('Fehler bei der Reservierung: ' + error.message);
    }
  }

  zurueckZurAuswahl () {
    document.getElementById('vorstellungen-list').parentElement.style.display = 'block';
    document.getElementById('sitzplatz-auswahl').style.display = 'none';
    this.currentVorstellung = null;
    this.ausgewaehlteSitze.clear();
    this.loadVorstellungen();
  }
}
