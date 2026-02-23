import express from 'express';
import Reservierung from '../models/Reservierung.js';
import Vorstellung from '../models/Vorstellung.js';
import QRCode from 'qrcode';
import mongoose from 'mongoose';

const router = express.Router();

// Alle Reservierungen abrufen
router.get('/', async (req, res) => {
  try {
    const reservierungen = await Reservierung.find().populate({
      path: 'vorstellung',
      populate: { path: 'kinosaal' }
    });
    res.json(reservierungen);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bestimmte Reservierung abrufen
router.get('/:id', async (req, res) => {
  try {
    const reservierung = await Reservierung.findById(req.params.id).populate({
      path: 'vorstellung',
      populate: { path: 'kinosaal' }
    });
    if (!reservierung) {
      return res.status(404).json({ message: 'Reservierung nicht gefunden' });
    }
    res.json(reservierung);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reservierungen für eine Vorstellung abrufen
router.get('/vorstellung/:vorstellungId', async (req, res) => {
  try {
    const reservierungen = await Reservierung.find({
      vorstellung: req.params.vorstellungId
    });
    res.json(reservierungen);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Neue Reservierung anlegen
router.post('/', async (req, res) => {
  try {
    const vorstellung = await Vorstellung.findById(req.body.vorstellungId).populate('kinosaal');
    if (!vorstellung) {
      return res.status(404).json({ message: 'Vorstellung nicht gefunden' });
    }

    const kinosaal = vorstellung.kinosaal;
    const ungueltigePlaetze = req.body.sitzplaetze.filter(
      sitz => sitz.reihe > kinosaal.anzahlReihen || sitz.sitz > kinosaal.anzahlSitzeProReihe
    );

    if (ungueltigePlaetze.length > 0) {
      return res.status(400).json({ message: 'Ungültige Sitzplätze' });
    }

    const bestehendeReservierungen = await Reservierung.find({
      vorstellung: req.body.vorstellungId,
      $or: req.body.sitzplaetze.map(sitz => ({
        'sitzplaetze.reihe': sitz.reihe,
        'sitzplaetze.sitz': sitz.sitz
      }))
    });

    if (bestehendeReservierungen.length > 0) {
      return res.status(400).json({ message: 'Einige Sitzplätze sind bereits reserviert' });
    }

    const reservierungsDaten = {
      id: new mongoose.Types.ObjectId(),
      vorstellung: vorstellung._id,
      film: vorstellung.filmName,
      datum: vorstellung.datumUhrzeit,
      sitzplaetze: req.body.sitzplaetze,
      kunde: req.body.kundenName
    };

    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(reservierungsDaten));

    const reservierung = new Reservierung({
      vorstellung: req.body.vorstellungId,
      sitzplaetze: req.body.sitzplaetze,
      kundenName: req.body.kundenName,
      qrCode: qrCodeDataURL
    });

    const neueReservierung = await reservierung.save();
    await neueReservierung.populate({
      path: 'vorstellung',
      populate: { path: 'kinosaal' }
    });

    res.status(201).json(neueReservierung);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Reservierung löschen
router.delete('/:id', async (req, res) => {
  try {
    const reservierung = await Reservierung.findByIdAndDelete(req.params.id);
    if (!reservierung) {
      return res.status(404).json({ message: 'Reservierung nicht gefunden' });
    }
    res.json({ message: 'Reservierung erfolgreich gelöscht' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
