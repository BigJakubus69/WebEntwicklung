export class QRCodeGenerator {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    generateAndShow(reservierung) {
        this.container.innerHTML = '';

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'qrModal';

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';

        const closeBtn = document.createElement('span');
        closeBtn.className = 'close';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => modal.style.display = 'none';

        const title = document.createElement('h2');
        title.textContent = 'Ihr QR-Code';

        const qrDiv = document.createElement('div');
        qrDiv.className = 'qr-code';

        const qrImg = document.createElement('img');
        qrImg.src = reservierung.qrCode;
        qrImg.alt = 'QR-Code für Reservierung';

        const info = document.createElement('div');
        info.className = 'reservierungs-info';
        info.innerHTML = `
            <p><strong>Film:</strong> ${reservierung.vorstellung.filmName}</p>
            <p><strong>Datum:</strong> ${new Date(reservierung.vorstellung.datumUhrzeit).toLocaleString()}</p>
            <p><strong>Sitzplätze:</strong> ${reservierung.sitzplaetze.map(s => `Reihe ${s.reihe}, Platz ${s.sitz}`).join('; ')}</p>
            <p><strong>Name:</strong> ${reservierung.kundenName}</p>
        `;

        const printBtn = document.createElement('button');
        printBtn.textContent = 'QR-Code drucken';
        printBtn.onclick = () => this.printQRCode(reservierung);

        qrDiv.appendChild(qrImg);
        modalContent.appendChild(closeBtn);
        modalContent.appendChild(title);
        modalContent.appendChild(qrDiv);
        modalContent.appendChild(info);
        modalContent.appendChild(printBtn);
        modal.appendChild(modalContent);

        this.container.appendChild(modal);
        modal.style.display = 'block';

        // Schließen bei Klick außerhalb
        window.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };
    }

    printQRCode(reservierung) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>QR-Code Reservierung</title>
                    <style>
                        body { text-align: center; padding: 20px; }
                        img { max-width: 300px; }
                    </style>
                </head>
                <body>
                    <h1>Reservierungsbestätigung</h1>
                    <img src="${reservierung.qrCode}" alt="QR-Code">
                    <p><strong>Film:</strong> ${reservierung.vorstellung.filmName}</p>
                    <p><strong>Datum:</strong> ${new Date(reservierung.vorstellung.datumUhrzeit).toLocaleString()}</p>
                    <p><strong>Sitzplätze:</strong> ${reservierung.sitzplaetze.map(s => `Reihe ${s.reihe}, Platz ${s.sitz}`).join('; ')}</p>
                    <p><strong>Name:</strong> ${reservierung.kundenName}</p>
                </body>
            </html>
        `);
        printWindow.print();
    }
}