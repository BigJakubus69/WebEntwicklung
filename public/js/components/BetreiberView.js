import { PaginatedList } from './Pagination.js';
import { QRCodeGenerator } from './QRCodeGenerator.js';

export class BetreiberView {
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.kinosaeleList = null;
    this.vorstellungenList = null;
    this.reservierungenList = null;
    this.qrGenerator = null;
  }

  render() {
    const app = document.getElementById('app');
    app.innerHTML = `
            <div class="container">
                <h2>Betreiber-Dashboard</h2>
                
                <div class="section">
                    <h3>Neuen Kinosaal anlegen</h3>
                    <form id="kinosaal-form">
                        <div class="form-group">
                            <label for="saal-name">Name:</label>
                            <input type="text" id="saal-name" required>
                        </div>
                        <div class="form-group">
                            <label for="reihen-anzahl">Anzahl Sitzreihen:</label>
                            <input type="number" id="reihen-anzahl" min="1" required>
                        </div>
                        <div class="form-group">
                            <label for="sitze-pro-reihe">Anzahl Sitze pro Reihe:</label>
                            <input type="number" id="sitze-pro-reihe" min="1" required>
                        </div>
                        <button type="submit">Kinosaal anlegen</button>
                    </form>
                </div>

                <div class="section">
                    <h3>Neue Vorstellung anlegen</h3>
                    <form id="vorstellung-form">
                        <div class="form-group">
                            <label for="film-name">Filmname:</label>
                            <input type="text" id="film-name" required>
                        </div>
                        <div class="form-group">
                            <label for="vorstellung-datum">Datum und Uhrzeit:</label>
                            <input type="datetime-local" id="vorstellung-datum" required>
                        </div>
                        <div class="form-group">
                            <label for="kinosaal-select">Kinosaal:</label>
                            <select id="kinosaal-select" required>
                                <option value="">Bitte wählen...</option>
                            </select>
                        </div>
                        <button type="submit">Vorstellung anlegen</button>
                    </form>
                </div>

                <div class="section">
                    <h3>Kinosäle</h3>
                    <div id="kinosaele-list" class="grid-list"></div>
                </div>

                <div class="section">
                    <h3>Vorstellungen</h3>
                    <div id="vorstellungen-list" class="grid-list"></div>
                </div>

                <div class="section">
                    <h3>Alle Reservierungen</h3>
                    <div id="reservierungen-list" class="grid-list"></div>
                </div>
            </div>
            <div id="qr-container"></div>
        `;

    this.kinosaeleList = new PaginatedList('kinosaele-list', (saal) => this.createKinosaalCard(saal));
    this.vorstellungenList = new PaginatedList('vorstellungen-list', (vorstellung) => this.createVorstellungCard(vorstellung));
    this.reservierungenList = new PaginatedList('reservierungen-list', (reservierung) => this.createReservierungCard(reservierung));
    this.qrGenerator = new QRCodeGenerator('qr-container');

    this.initEventListeners();
    this.loadData();
  }

  initEventListeners() {
    document.getElementById('kinosaal-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.createKinosaal();
    });

    document.getElementById('vorstellung-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.createVorstellung();
    });
  }

  async loadData() {
    try {
      const [kinosaele, vorstellungen, reservierungen] = await Promise.all([
        this.apiClient.getKinosaele(),
        this.apiClient.getVorstellungen(),
        this.apiClient.getReservierungen()
      ]);

      this.kinosaeleList.setItems(kinosaele);
      this.vorstellungenList.setItems(vorstellungen);
      this.reservierungenList.setItems(reservierungen);

      const select = document.getElementById('kinosaal-select');
      select.innerHTML = '<option value="">Bitte wählen...</option>' +
          kinosaele.map(saal =>
              `<option value="${saal._id}">${saal.name}</option>`
          ).join('');
    } catch (error) {
      alert('Fehler beim Laden der Daten: ' + error.message);
    }
  }

  async createKinosaal() {
    try {
      const name = document.getElementById('saal-name').value;
      const anzahlReihen = parseInt(document.getElementById('reihen-anzahl').value);
      const anzahlSitzeProReihe = parseInt(document.getElementById('sitze-pro-reihe').value);

      await this.apiClient.createKinosaal({
        name,
        anzahlReihen,
        anzahlSitzeProReihe
      });

      alert('Kinosaal erfolgreich angelegt!');
      document.getElementById('kinosaal-form').reset();
      this.loadData();
    } catch (error) {
      alert('Fehler beim Anlegen des Kinosaals: ' + error.message);
    }
  }

  async createVorstellung() {
    try {
      const filmName = document.getElementById('film-name').value;
      const datumUhrzeit = document.getElementById('vorstellung-datum').value;
      const kinosaalId = document.getElementById('kinosaal-select').value;

      await this.apiClient.createVorstellung({
        filmName,
        datumUhrzeit,
        kinosaalId
      });

      alert('Vorstellung erfolgreich angelegt!');
      document.getElementById('vorstellung-form').reset();
      this.loadData();
    } catch (error) {
      alert('Fehler beim Anlegen der Vorstellung: ' + error.message);
    }
  }

  // Löschfunktionen
  async deleteKinosaal(id, name) {
    if (confirm(`Sind Sie sicher, dass Sie den Kinosaal "${name}" löschen möchten?`)) {
      try {
        await this.apiClient.deleteKinosaal(id);
        alert('Kinosaal erfolgreich gelöscht!');
        this.loadData();
      } catch (error) {
        alert('Fehler beim Löschen des Kinosaals: ' + error.message);
      }
    }
  }

  async deleteVorstellung(id, filmName) {
    if (confirm(`Sind Sie sicher, dass Sie die Vorstellung "${filmName}" löschen möchten?`)) {
      try {
        await this.apiClient.deleteVorstellung(id);
        alert('Vorstellung erfolgreich gelöscht!');
        this.loadData();
      } catch (error) {
        alert('Fehler beim Löschen der Vorstellung: ' + error.message);
      }
    }
  }

  async deleteReservierung(id, kundenName) {
    if (confirm(`Sind Sie sicher, dass Sie die Reservierung von "${kundenName}" löschen möchten?`)) {
      try {
        await this.apiClient.deleteReservierung(id);
        alert('Reservierung erfolgreich gelöscht!');
        this.loadData();
      } catch (error) {
        alert('Fehler beim Löschen der Reservierung: ' + error.message);
      }
    }
  }

  createKinosaalCard(saal) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
            <h3>${saal.name}</h3>
            <p>Reihen: ${saal.anzahlReihen}</p>
            <p>Sitze pro Reihe: ${saal.anzahlSitzeProReihe}</p>
            <p>Gesamtkapazität: ${saal.anzahlReihen * saal.anzahlSitzeProReihe}</p>
            <button class="delete-btn" data-id="${saal._id}" data-name="${saal.name}">Löschen</button>
        `;

    card.querySelector('.delete-btn').addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      const name = e.target.dataset.name;
      this.deleteKinosaal(id, name);
    });

    return card;
  }

  createVorstellungCard(vorstellung) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
            <h3>${vorstellung.filmName}</h3>
            <p>Datum: ${new Date(vorstellung.datumUhrzeit).toLocaleString()}</p>
            <p>Kinosaal: ${vorstellung.kinosaal?.name || 'Kein Kinosaal'}</p>
            <button class="delete-btn" data-id="${vorstellung._id}" data-name="${vorstellung.filmName}">Löschen</button>
        `;

    card.querySelector('.delete-btn').addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      const name = e.target.dataset.name;
      this.deleteVorstellung(id, name);
    });

    return card;
  }

  createReservierungCard(reservierung) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
            <h3>Reservierung für ${reservierung.kundenName}</h3>
            <p>Film: ${reservierung.vorstellung.filmName}</p>
            <p>Datum: ${new Date(reservierung.vorstellung.datumUhrzeit).toLocaleString()}</p>
            <p>Sitzplätze: ${reservierung.sitzplaetze.map(s => `Reihe ${s.reihe}, Platz ${s.sitz}`).join('; ')}</p>
            <div class="card-actions">
                <button class="show-qr-btn" data-id="${reservierung._id}">QR-Code anzeigen</button>
                <button class="delete-btn" data-id="${reservierung._id}" data-name="${reservierung.kundenName}">Löschen</button>
            </div>
        `;

    card.querySelector('.show-qr-btn').addEventListener('click', () => {
      this.qrGenerator.generateAndShow(reservierung);
    });

    card.querySelector('.delete-btn').addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      const name = e.target.dataset.name;
      this.deleteReservierung(id, name);
    });

    return card;
  }
}