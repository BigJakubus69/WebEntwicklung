import express from 'express';
import Vorstellung from '../models/Vorstellung.js';
import Kinosaal from '../models/Kinosaal.js';

const router = express.Router();

// Alle Vorstellungen abrufen
router.get('/', async (req, res) => {
  try {
    const vorstellungen = await Vorstellung.find().populate('kinosaal');
    res.json(vorstellungen);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bestimmte Vorstellung abrufen
router.get('/:id', async (req, res) => {
  try {
    const vorstellung = await Vorstellung.findById(req.params.id).populate('kinosaal');
    if (!vorstellung) {
      return res.status(404).json({ message: 'Vorstellung nicht gefunden' });
    }
    res.json(vorstellung);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Neue Vorstellung anlegen
router.post('/', async (req, res) => {
  try {
    // Prüfen, ob Kinosaal existiert
    console.log('BODY:', req.body);
    const kinosaal = await Kinosaal.findById(req.body.kinosaalId);
    if (!kinosaal) {
      return res.status(404).json({ message: 'Kinosaal nicht gefunden' });
    }

    const vorstellung = new Vorstellung({
      datumUhrzeit: new Date(req.body.datumUhrzeit),
      kinosaal: req.body.kinosaalId,
      filmName: req.body.filmName
    });

    const neueVorstellung = await vorstellung.save();
    await neueVorstellung.populate('kinosaal');
    res.status(201).json(neueVorstellung);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
