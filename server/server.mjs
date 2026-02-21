import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import kinoSaalRoutes from './routes/kinoSaalRoutes.js';
import vorstellungRoutes from './routes/vorstellungRoutes.js';
import reservierungRoutes from './routes/reservierungRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kinoverwaltung';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Routen
app.use('/api/kinosaele', kinoSaalRoutes);
app.use('/api/vorstellungen', vorstellungRoutes);
app.use('/api/reservierungen', reservierungRoutes);

// MongoDB Verbindung
mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('MongoDB verbunden');

      // Server starten
      app.listen(PORT, () => {
        console.log(`Server läuft auf Port ${PORT}`);
      });
    })
    .catch(err => {
      console.error('MongoDB Verbindungsfehler:', err);
      process.exit(1);
    });

// 404 Handler
app.use((req, res) => {
  res.status(404).send('Seite nicht gefunden');
});