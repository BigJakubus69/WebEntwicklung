export class PaginationHelper {
    constructor(container, itemsPerPage = 10) {
        this.container = container;
        this.itemsPerPage = itemsPerPage;
        this.currentPage = 1;
        this.items = [];
        this.onPageChange = null;

        this.updateItemsPerPage();

        // Event-Listener für Fenstergrößenänderung
        window.addEventListener('resize', () => {
            this.updateItemsPerPage();
            this.render();
        });
    }

    updateItemsPerPage() {
        const windowHeight = window.innerHeight;
        const headerHeight = document.querySelector('header')?.offsetHeight || 0;
        const paginationHeight = 100; // Geschätzte Höhe der Paginierung
        const itemHeight = 100; // Geschätzte Höhe pro Eintrag

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

        // Container leeren
        this.container.innerHTML = '';

        // Items rendern
        currentItems.forEach(item => {
            const itemElement = this.createItemElement(item);
            this.container.appendChild(itemElement);
        });

        // Paginierung rendern
        this.renderPagination(totalPages);

        if (this.onPageChange) {
            this.onPageChange(this.currentPage, totalPages);
        }
    }

    renderPagination(totalPages) {
        // Entferne alte Paginierung
        const oldPagination = document.querySelector('.pagination');
        if (oldPagination) {
            oldPagination.remove();
        }

        if (totalPages <= 1) return;

        const paginationDiv = document.createElement('div');
        paginationDiv.className = 'pagination';

        const prevButton = document.createElement('button');
        prevButton.textContent = 'Vorherige';
        prevButton.disabled = this.currentPage === 1;
        prevButton.addEventListener('click', () => this.prevPage());

        const pageInfo = document.createElement('span');
        pageInfo.className = 'page-info';
        pageInfo.textContent = `Seite ${this.currentPage} von ${totalPages}`;

        const nextButton = document.createElement('button');
        nextButton.textContent = 'Nächste';
        nextButton.disabled = this.currentPage === totalPages;
        nextButton.addEventListener('click', () => this.nextPage());

        paginationDiv.appendChild(prevButton);
        paginationDiv.appendChild(pageInfo);
        paginationDiv.appendChild(nextButton);

        this.container.parentNode.insertBefore(paginationDiv, this.container.nextSibling);
    }

    createItemElement(item) {
        // Diese Methode sollte überschrieben werden
        const div = document.createElement('div');
        div.textContent = JSON.stringify(item);
        return div;
    }
}