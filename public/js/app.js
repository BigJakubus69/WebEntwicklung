import { ApiClient } from './api/apiClient.js';
import { BetreiberView } from './components/BetreiberView.js';
import { KundeView } from './components/KundeView.js';

class App {
  constructor () {
    this.apiClient = new ApiClient();
    this.betreiberView = new BetreiberView(this.apiClient);
    this.kundeView = new KundeView(this.apiClient);
    this.currentRole = 'betreiber';

    this.init();
  }

  init () {
    this.initRoleSelector();
    this.renderCurrentView();
  }

  initRoleSelector () {
    const roleButtons = document.querySelectorAll('.role-btn');
    roleButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        roleButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.currentRole = e.target.dataset.role;
        this.renderCurrentView();
      });
    });
  }

  renderCurrentView () {
    if (this.currentRole === 'betreiber') {
      this.betreiberView.render();
    } else {
      this.kundeView.render();
    }
  }
}

// App starten
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
