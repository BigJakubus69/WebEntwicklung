export class QRCodeGenerator {
  constructor (containerId) {
    this.container = document.getElementById(containerId);
  }

  generateAndShow (reservierung) {
    this.container.innerHTML = '';

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'qrModal';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.maxHeight = '80vh';
    modalContent.style.display = 'flex';
    modalContent.style.flexDirection = 'column';

    const closeBtn = document.createElement('span');
    closeBtn.className = 'close';
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = () => {
      modal.style.display = 'none';
    };

    const title = document.createElement('h2');
    title.textContent = 'Ihr QR-Code';
    title.style.marginTop = '0';

    const qrDiv = document.createElement('div');
    qrDiv.className = 'qr-code';
    qrDiv.style.textAlign = 'center';
    qrDiv.style.margin = '1rem 0';

    const qrImg = document.createElement('img');
    qrImg.src = reservierung.qrCode;
    qrImg.alt = 'QR-Code für Reservierung';
    qrImg.style.maxWidth = '200px';
    qrImg.style.width = '100%';
    qrImg.style.height = 'auto';

    // Scrollbarer Container für die Informationen
    const infoContainer = document.createElement('div');
    infoContainer.style.overflowY = 'auto';
    infoContainer.style.maxHeight = '300px';
    infoContainer.style.padding = '0.5rem';
    infoContainer.style.margin = '1rem 0';
    infoContainer.style.border = '1px solid #e0e0e0';
    infoContainer.style.borderRadius = '8px';
    infoContainer.style.backgroundColor = '#f8f9fa';

    const info = document.createElement('div');
    info.className = 'reservierungs-info';
    info.style.margin = '0';
    info.style.padding = '0.5rem';
    info.innerHTML = `
      <p><strong>Film:</strong> ${reservierung.vorstellung.filmName}</p>
      <p><strong>Datum:</strong> ${new Date(reservierung.vorstellung.datumUhrzeit).toLocaleString()}</p>
      <p><strong>Sitzplätze:</strong></p>
      <div style="max-height: 150px; overflow-y: auto; border: 1px solid #ddd; padding: 0.5rem; border-radius: 4px; background: white;">
        ${reservierung.sitzplaetze.map(s => `Reihe ${s.reihe}, Platz ${s.sitz}`).join('<br>')}
      </div>
      <p style="margin-top: 0.5rem;"><strong>Name:</strong> ${reservierung.kundenName}</p>
    `;

    infoContainer.appendChild(info);

    const printBtn = document.createElement('button');
    printBtn.textContent = 'QR-Code drucken';
    printBtn.style.marginTop = '1rem';
    printBtn.style.width = '100%';
    printBtn.onclick = () => this.printQRCode(reservierung);

    // Alles zusammenbauen
    qrDiv.appendChild(qrImg);
    modalContent.appendChild(closeBtn);
    modalContent.appendChild(title);
    modalContent.appendChild(qrDiv);
    modalContent.appendChild(infoContainer);
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

  printQRCode (reservierung) {
    const printWindow = window.open('', '_blank');

    // Formatierte Sitzplatzliste für den Druck
    const sitzplatzListe = reservierung.sitzplaetze
        .map(s => `Reihe ${s.reihe}, Platz ${s.sitz}`)
        .join('<br>');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR-Code Reservierung</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 20px; 
              margin: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
            }
            img { 
              max-width: 250px; 
              width: 100%;
              height: auto;
              margin: 20px 0;
            }
            .info {
              text-align: left;
              background: #f5f5f5;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .sitzliste {
              max-height: none;
              overflow: visible;
              background: white;
              padding: 10px;
              border: 1px solid #ddd;
              border-radius: 4px;
            }
            h1 {
              color: #333;
              margin-bottom: 20px;
            }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Reservierungsbestätigung</h1>
            
            <img src="${reservierung.qrCode}" alt="QR-Code">
            
            <div class="info">
              <p><strong>Film:</strong> ${reservierung.vorstellung.filmName}</p>
              <p><strong>Datum:</strong> ${new Date(reservierung.vorstellung.datumUhrzeit).toLocaleString()}</p>
              <p><strong>Name:</strong> ${reservierung.kundenName}</p>
              <p><strong>Sitzplätze:</strong></p>
              <div class="sitzliste">
                ${sitzplatzListe}
              </div>
            </div>
            
            <p class="no-print">Bitte bewahren Sie diese Bestätigung für den Eintritt auf.</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    // Kurz warten, damit der Inhalt geladen ist
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
}