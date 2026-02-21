export class ApiClient {
    constructor(baseURL = '/api') {
        this.baseURL = baseURL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Ein Fehler ist aufgetreten');
        }

        return response.json();
    }

    // Kinosäle
    async getKinosaele() {
        return this.request('/kinosaele');
    }

    async createKinosaal(data) {
        return this.request('/kinosaele', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // Vorstellungen
    async getVorstellungen() {
        return this.request('/vorstellungen');
    }

    async createVorstellung(data) {
        return this.request('/vorstellungen', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // Reservierungen
    async getReservierungen() {
        return this.request('/reservierungen');
    }

    async getReservierungenFuerVorstellung(vorstellungId) {
        return this.request(`/reservierungen/vorstellung/${vorstellungId}`);
    }

    async createReservierung(data) {
        return this.request('/reservierungen', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
}