var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};

// public/js/api/apiClient.js
var ApiClient = class {
  constructor(baseURL = "/api") {
    this.baseURL = baseURL;
  }
  async request(endpoint, options = {}) {
    const url = "".concat(this.baseURL).concat(endpoint);
    const response = await fetch(url, __spreadValues({
      headers: __spreadValues({
        "Content-Type": "application/json"
      }, options.headers)
    }, options));
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Ein Fehler ist aufgetreten");
    }
    return response.json();
  }
  // Kinosäle
  async getKinosaele() {
    return this.request("/kinosaele");
  }
  async createKinosaal(data) {
    return this.request("/kinosaele", {
      method: "POST",
      body: JSON.stringify(data)
    });
  }
  // Vorstellungen
  async getVorstellungen() {
    return this.request("/vorstellungen");
  }
  async createVorstellung(data) {
    return this.request("/vorstellungen", {
      method: "POST",
      body: JSON.stringify(data)
    });
  }
  // Reservierungen
  async getReservierungen() {
    return this.request("/reservierungen");
  }
  async getReservierungenFuerVorstellung(vorstellungId) {
    return this.request("/reservierungen/vorstellung/".concat(vorstellungId));
  }
  async createReservierung(data) {
    return this.request("/reservierungen", {
      method: "POST",
      body: JSON.stringify(data)
    });
  }
};

// public/js/utils/paginationHelper.js
var PaginationHelper = class {
  constructor(container, itemsPerPage = 10) {
    this.container = container;
    this.itemsPerPage = itemsPerPage;
    this.currentPage = 1;
    this.items = [];
    this.onPageChange = null;
    this.updateItemsPerPage();
    window.addEventListener("resize", () => {
      this.updateItemsPerPage();
      this.render();
    });
  }
  updateItemsPerPage() {
    var _a;
    const windowHeight = window.innerHeight;
    const headerHeight = ((_a = document.querySelector("header")) == null ? void 0 : _a.offsetHeight) || 0;
    const paginationHeight = 100;
    const itemHeight = 100;
    const availableHeight = windowHeight - headerHeight - paginationHeight - 100;
    this.itemsPerPage = Math.max(1, Math.floor(availableHeight / itemHeight));
  }
  setItems(items) {
    this.items = items;
    this.currentPage = 1;
    this.render();
  }
  getCurrentPageItems() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.items.slice(start, start + this.itemsPerPage);
  }
  getTotalPages() {
    return Math.ceil(this.items.length / this.itemsPerPage);
  }
  nextPage() {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
      this.render();
    }
  }
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.render();
    }
  }
  render() {
    const currentItems = this.getCurrentPageItems();
    const totalPages = this.getTotalPages();
    this.container.innerHTML = "";
    currentItems.forEach((item) => {
      const itemElement = this.createItemElement(item);
      this.container.appendChild(itemElement);
    });
    this.renderPagination(totalPages);
    if (this.onPageChange) {
      this.onPageChange(this.currentPage, totalPages);
    }
  }
  renderPagination(totalPages) {
    const oldPagination = document.querySelector(".pagination");
    if (oldPagination) {
      oldPagination.remove();
    }
    if (totalPages <= 1) return;
    const paginationDiv = document.createElement("div");
    paginationDiv.className = "pagination";
    const prevButton = document.createElement("button");
    prevButton.textContent = "Vorherige";
    prevButton.disabled = this.currentPage === 1;
    prevButton.addEventListener("click", () => this.prevPage());
    const pageInfo = document.createElement("span");
    pageInfo.className = "page-info";
    pageInfo.textContent = "Seite ".concat(this.currentPage, " von ").concat(totalPages);
    const nextButton = document.createElement("button");
    nextButton.textContent = "N\xE4chste";
    nextButton.disabled = this.currentPage === totalPages;
    nextButton.addEventListener("click", () => this.nextPage());
    paginationDiv.appendChild(prevButton);
    paginationDiv.appendChild(pageInfo);
    paginationDiv.appendChild(nextButton);
    this.container.parentNode.insertBefore(paginationDiv, this.container.nextSibling);
  }
  createItemElement(item) {
    const div = document.createElement("div");
    div.textContent = JSON.stringify(item);
    return div;
  }
};

// public/js/components/Pagination.js
var PaginatedList = class {
  constructor(containerId, itemRenderer) {
    this.container = document.getElementById(containerId);
    this.itemRenderer = itemRenderer;
    this.paginationHelper = new PaginationHelper(this.container);
    this.paginationHelper.createItemElement = (item) => this.itemRenderer(item);
  }
  setItems(items) {
    this.paginationHelper.setItems(items);
  }
};

// public/js/components/QRCodeGenerator.js
var QRCodeGenerator = class {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }
  generateAndShow(reservierung) {
    this.container.innerHTML = "";
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.id = "qrModal";
    const modalContent = document.createElement("div");
    modalContent.className = "modal-content";
    const closeBtn = document.createElement("span");
    closeBtn.className = "close";
    closeBtn.innerHTML = "&times;";
    closeBtn.onclick = () => modal.style.display = "none";
    const title = document.createElement("h2");
    title.textContent = "Ihr QR-Code";
    const qrDiv = document.createElement("div");
    qrDiv.className = "qr-code";
    const qrImg = document.createElement("img");
    qrImg.src = reservierung.qrCode;
    qrImg.alt = "QR-Code f\xFCr Reservierung";
    const info = document.createElement("div");
    info.className = "reservierungs-info";
    info.innerHTML = "\n            <p><strong>Film:</strong> ".concat(reservierung.vorstellung.filmName, "</p>\n            <p><strong>Datum:</strong> ").concat(new Date(reservierung.vorstellung.datumUhrzeit).toLocaleString(), "</p>\n            <p><strong>Sitzpl\xE4tze:</strong> ").concat(reservierung.sitzplaetze.map((s) => "Reihe ".concat(s.reihe, ", Platz ").concat(s.sitz)).join("; "), "</p>\n            <p><strong>Name:</strong> ").concat(reservierung.kundenName, "</p>\n        ");
    const printBtn = document.createElement("button");
    printBtn.textContent = "QR-Code drucken";
    printBtn.onclick = () => this.printQRCode(reservierung);
    qrDiv.appendChild(qrImg);
    modalContent.appendChild(closeBtn);
    modalContent.appendChild(title);
    modalContent.appendChild(qrDiv);
    modalContent.appendChild(info);
    modalContent.appendChild(printBtn);
    modal.appendChild(modalContent);
    this.container.appendChild(modal);
    modal.style.display = "block";
    window.onclick = (event) => {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    };
  }
  printQRCode(reservierung) {
    const printWindow = window.open("", "_blank");
    printWindow.document.write('\n            <html>\n                <head>\n                    <title>QR-Code Reservierung</title>\n                    <style>\n                        body { text-align: center; padding: 20px; }\n                        img { max-width: 300px; }\n                    </style>\n                </head>\n                <body>\n                    <h1>Reservierungsbest\xE4tigung</h1>\n                    <img src="'.concat(reservierung.qrCode, '" alt="QR-Code">\n                    <p><strong>Film:</strong> ').concat(reservierung.vorstellung.filmName, "</p>\n                    <p><strong>Datum:</strong> ").concat(new Date(reservierung.vorstellung.datumUhrzeit).toLocaleString(), "</p>\n                    <p><strong>Sitzpl\xE4tze:</strong> ").concat(reservierung.sitzplaetze.map((s) => "Reihe ".concat(s.reihe, ", Platz ").concat(s.sitz)).join("; "), "</p>\n                    <p><strong>Name:</strong> ").concat(reservierung.kundenName, "</p>\n                </body>\n            </html>\n        "));
    printWindow.print();
  }
};

// public/js/components/BetreiberView.js
var BetreiberView = class {
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.kinosaeleList = new PaginatedList("kinosaele-list", (saal) => this.createKinosaalCard(saal));
    this.vorstellungenList = new PaginatedList("vorstellungen-list", (vorstellung) => this.createVorstellungCard(vorstellung));
    this.reservierungenList = new PaginatedList("reservierungen-list", (reservierung) => this.createReservierungCard(reservierung));
    this.qrGenerator = new QRCodeGenerator("qr-container");
  }
  render() {
    const app = document.getElementById("app");
    app.innerHTML = '\n            <div class="container">\n                <h2>Betreiber-Dashboard</h2>\n                \n                <div class="section">\n                    <h3>Neuen Kinosaal anlegen</h3>\n                    <form id="kinosaal-form">\n                        <div class="form-group">\n                            <label for="saal-name">Name:</label>\n                            <input type="text" id="saal-name" required>\n                        </div>\n                        <div class="form-group">\n                            <label for="reihen-anzahl">Anzahl Sitzreihen:</label>\n                            <input type="number" id="reihen-anzahl" min="1" required>\n                        </div>\n                        <div class="form-group">\n                            <label for="sitze-pro-reihe">Anzahl Sitze pro Reihe:</label>\n                            <input type="number" id="sitze-pro-reihe" min="1" required>\n                        </div>\n                        <button type="submit">Kinosaal anlegen</button>\n                    </form>\n                </div>\n\n                <div class="section">\n                    <h3>Neue Vorstellung anlegen</h3>\n                    <form id="vorstellung-form">\n                        <div class="form-group">\n                            <label for="film-name">Filmname:</label>\n                            <input type="text" id="film-name" required>\n                        </div>\n                        <div class="form-group">\n                            <label for="vorstellung-datum">Datum und Uhrzeit:</label>\n                            <input type="datetime-local" id="vorstellung-datum" required>\n                        </div>\n                        <div class="form-group">\n                            <label for="kinosaal-select">Kinosaal:</label>\n                            <select id="kinosaal-select" required>\n                                <option value="">Bitte w\xE4hlen...</option>\n                            </select>\n                        </div>\n                        <button type="submit">Vorstellung anlegen</button>\n                    </form>\n                </div>\n\n                <div class="section">\n                    <h3>Kinos\xE4le</h3>\n                    <div id="kinosaele-list" class="grid-list"></div>\n                </div>\n\n                <div class="section">\n                    <h3>Vorstellungen</h3>\n                    <div id="vorstellungen-list" class="grid-list"></div>\n                </div>\n\n                <div class="section">\n                    <h3>Alle Reservierungen</h3>\n                    <div id="reservierungen-list" class="grid-list"></div>\n                </div>\n            </div>\n            <div id="qr-container"></div>\n        ';
    this.initEventListeners();
    this.loadData();
  }
  initEventListeners() {
    document.getElementById("kinosaal-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      await this.createKinosaal();
    });
    document.getElementById("vorstellung-form").addEventListener("submit", async (e) => {
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
      const select = document.getElementById("kinosaal-select");
      select.innerHTML = '<option value="">Bitte w\xE4hlen...</option>' + kinosaele.map(
        (saal) => '<option value="'.concat(saal._id, '">').concat(saal.name, "</option>")
      ).join("");
    } catch (error) {
      alert("Fehler beim Laden der Daten: " + error.message);
    }
  }
  async createKinosaal() {
    try {
      const name = document.getElementById("saal-name").value;
      const anzahlReihen = parseInt(document.getElementById("reihen-anzahl").value);
      const anzahlSitzeProReihe = parseInt(document.getElementById("sitze-pro-reihe").value);
      await this.apiClient.createKinosaal({
        name,
        anzahlReihen,
        anzahlSitzeProReihe
      });
      alert("Kinosaal erfolgreich angelegt!");
      document.getElementById("kinosaal-form").reset();
      this.loadData();
    } catch (error) {
      alert("Fehler beim Anlegen des Kinosaals: " + error.message);
    }
  }
  async createVorstellung() {
    try {
      const filmName = document.getElementById("film-name").value;
      const datumUhrzeit = document.getElementById("vorstellung-datum").value;
      const kinosaalId = document.getElementById("kinosaal-select").value;
      await this.apiClient.createVorstellung({
        filmName,
        datumUhrzeit,
        kinosaalId
      });
      alert("Vorstellung erfolgreich angelegt!");
      document.getElementById("vorstellung-form").reset();
      this.loadData();
    } catch (error) {
      alert("Fehler beim Anlegen der Vorstellung: " + error.message);
    }
  }
  createKinosaalCard(saal) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = "\n            <h3>".concat(saal.name, "</h3>\n            <p>Reihen: ").concat(saal.anzahlReihen, "</p>\n            <p>Sitze pro Reihe: ").concat(saal.anzahlSitzeProReihe, "</p>\n            <p>Gesamtkapazit\xE4t: ").concat(saal.anzahlReihen * saal.anzahlSitzeProReihe, "</p>\n        ");
    return card;
  }
  createVorstellungCard(vorstellung) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = "\n            <h3>".concat(vorstellung.filmName, "</h3>\n            <p>Datum: ").concat(new Date(vorstellung.datumUhrzeit).toLocaleString(), "</p>\n            <p>Kinosaal: ").concat(vorstellung.kinosaal.name, "</p>\n        ");
    return card;
  }
  createReservierungCard(reservierung) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = "\n            <h3>Reservierung f\xFCr ".concat(reservierung.kundenName, "</h3>\n            <p>Film: ").concat(reservierung.vorstellung.filmName, "</p>\n            <p>Datum: ").concat(new Date(reservierung.vorstellung.datumUhrzeit).toLocaleString(), "</p>\n            <p>Sitzpl\xE4tze: ").concat(reservierung.sitzplaetze.map((s) => "Reihe ".concat(s.reihe, ", Platz ").concat(s.sitz)).join("; "), '</p>\n            <button class="show-qr-btn" data-id="').concat(reservierung._id, '">QR-Code anzeigen</button>\n        ');
    card.querySelector(".show-qr-btn").addEventListener("click", () => {
      this.qrGenerator.generateAndShow(reservierung);
    });
    return card;
  }
};

// public/js/components/KundeView.js
var KundeView = class {
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.vorstellungenList = new PaginatedList("vorstellungen-list", (vorstellung) => this.createVorstellungCard(vorstellung));
    this.qrGenerator = new QRCodeGenerator("qr-container");
    this.currentVorstellung = null;
    this.ausgewaehlteSitze = /* @__PURE__ */ new Set();
  }
  render() {
    const app = document.getElementById("app");
    app.innerHTML = '\n            <div class="container">\n                <h2>Kundenbereich</h2>\n                \n                <div class="section">\n                    <h3>Verf\xFCgbare Vorstellungen</h3>\n                    <div id="vorstellungen-list" class="grid-list"></div>\n                </div>\n\n                <div id="sitzplatz-auswahl" style="display: none;">\n                    <h3>Sitzplatzauswahl f\xFCr <span id="aktueller-film"></span></h3>\n                    <div id="sitzplan"></div>\n                    \n                    <div class="form-group">\n                        <label for="kunden-name">Ihr Name:</label>\n                        <input type="text" id="kunden-name" required>\n                    </div>\n                    \n                    <button id="reservieren-btn">Reservieren</button>\n                    <button id="zurueck-btn">Zur\xFCck zur Auswahl</button>\n                </div>\n            </div>\n            <div id="qr-container"></div>\n        ';
    this.loadVorstellungen();
    this.initEventListeners();
  }
  initEventListeners() {
    var _a, _b;
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("sitz") && e.target.classList.contains("verfuegbar")) {
        this.toggleSitz(e.target);
      }
    });
    (_a = document.getElementById("reservieren-btn")) == null ? void 0 : _a.addEventListener("click", () => this.reservieren());
    (_b = document.getElementById("zurueck-btn")) == null ? void 0 : _b.addEventListener("click", () => this.zurueckZurAuswahl());
  }
  async loadVorstellungen() {
    try {
      const vorstellungen = await this.apiClient.getVorstellungen();
      this.vorstellungenList.setItems(vorstellungen);
    } catch (error) {
      alert("Fehler beim Laden der Vorstellungen: " + error.message);
    }
  }
  createVorstellungCard(vorstellung) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = "\n            <h3>".concat(vorstellung.filmName, "</h3>\n            <p>Datum: ").concat(new Date(vorstellung.datumUhrzeit).toLocaleString(), "</p>\n            <p>Kinosaal: ").concat(vorstellung.kinosaal.name, '</p>\n            <button class="select-show-btn" data-id="').concat(vorstellung._id, '">Sitzpl\xE4tze ausw\xE4hlen</button>\n        ');
    card.querySelector(".select-show-btn").addEventListener("click", () => {
      this.showSitzplatzAuswahl(vorstellung);
    });
    return card;
  }
  async showSitzplatzAuswahl(vorstellung) {
    this.currentVorstellung = vorstellung;
    this.ausgewaehlteSitze.clear();
    document.getElementById("vorstellungen-list").parentElement.style.display = "none";
    document.getElementById("sitzplatz-auswahl").style.display = "block";
    document.getElementById("aktueller-film").textContent = vorstellung.filmName;
    try {
      const reservierungen = await this.apiClient.getReservierungenFuerVorstellung(vorstellung._id);
      this.renderSitzplan(vorstellung, reservierungen);
    } catch (error) {
      alert("Fehler beim Laden der Sitzpl\xE4tze: " + error.message);
    }
  }
  renderSitzplan(vorstellung, reservierungen) {
    const sitzplan = document.getElementById("sitzplan");
    sitzplan.innerHTML = "";
    sitzplan.className = "sitzplan";
    const reservierteSitze = /* @__PURE__ */ new Set();
    reservierungen.forEach((res) => {
      res.sitzplaetze.forEach((sitz) => {
        reservierteSitze.add("".concat(sitz.reihe, "-").concat(sitz.sitz));
      });
    });
    for (let reihe = 1; reihe <= vorstellung.kinosaal.anzahlReihen; reihe++) {
      const reiheDiv = document.createElement("div");
      reiheDiv.className = "reihe";
      reiheDiv.innerHTML = "<span>Reihe ".concat(reihe, "</span>");
      for (let sitz = 1; sitz <= vorstellung.kinosaal.anzahlSitzeProReihe; sitz++) {
        const sitzDiv = document.createElement("div");
        sitzDiv.className = "sitz";
        sitzDiv.dataset.reihe = reihe;
        sitzDiv.dataset.sitz = sitz;
        sitzDiv.textContent = sitz;
        const sitzKey = "".concat(reihe, "-").concat(sitz);
        if (reservierteSitze.has(sitzKey)) {
          sitzDiv.classList.add("reserviert");
        } else {
          sitzDiv.classList.add("verfuegbar");
        }
        reiheDiv.appendChild(sitzDiv);
      }
      sitzplan.appendChild(reiheDiv);
    }
  }
  toggleSitz(sitzElement) {
    const reihe = sitzElement.dataset.reihe;
    const sitz = sitzElement.dataset.sitz;
    const sitzKey = "".concat(reihe, "-").concat(sitz);
    if (this.ausgewaehlteSitze.has(sitzKey)) {
      this.ausgewaehlteSitze.delete(sitzKey);
      sitzElement.classList.remove("ausgewaehlt");
    } else {
      this.ausgewaehlteSitze.add(sitzKey);
      sitzElement.classList.add("ausgewaehlt");
    }
  }
  async reservieren() {
    const kundenName = document.getElementById("kunden-name").value;
    if (!kundenName) {
      alert("Bitte geben Sie Ihren Namen ein");
      return;
    }
    if (this.ausgewaehlteSitze.size === 0) {
      alert("Bitte w\xE4hlen Sie mindestens einen Sitzplatz aus");
      return;
    }
    const sitzplaetze = Array.from(this.ausgewaehlteSitze).map((key) => {
      const [reihe, sitz] = key.split("-").map(Number);
      return { reihe, sitz };
    });
    try {
      const reservierung = await this.apiClient.createReservierung({
        vorstellungId: this.currentVorstellung._id,
        sitzplaetze,
        kundenName
      });
      alert("Reservierung erfolgreich!");
      this.qrGenerator.generateAndShow(reservierung);
      this.zurueckZurAuswahl();
    } catch (error) {
      alert("Fehler bei der Reservierung: " + error.message);
    }
  }
  zurueckZurAuswahl() {
    document.getElementById("vorstellungen-list").parentElement.style.display = "block";
    document.getElementById("sitzplatz-auswahl").style.display = "none";
    this.currentVorstellung = null;
    this.ausgewaehlteSitze.clear();
    this.loadVorstellungen();
  }
};

// public/js/app.js
var App = class {
  constructor() {
    this.apiClient = new ApiClient();
    this.betreiberView = new BetreiberView(this.apiClient);
    this.kundeView = new KundeView(this.apiClient);
    this.currentRole = "betreiber";
    this.init();
  }
  init() {
    this.initRoleSelector();
    this.renderCurrentView();
  }
  initRoleSelector() {
    const roleButtons = document.querySelectorAll(".role-btn");
    roleButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        roleButtons.forEach((b) => b.classList.remove("active"));
        e.target.classList.add("active");
        this.currentRole = e.target.dataset.role;
        this.renderCurrentView();
      });
    });
  }
  renderCurrentView() {
    if (this.currentRole === "betreiber") {
      this.betreiberView.render();
    } else {
      this.kundeView.render();
    }
  }
};
document.addEventListener("DOMContentLoaded", () => {
  new App();
});
//# sourceMappingURL=bundle.js.map
