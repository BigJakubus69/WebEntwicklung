import express from 'express';
import Kinosaal from '../models/Kinosaal.js';

const router = express.Router();

// Alle Kinosäle abrufen
router.get('/', async (req, res) => {
    try {
        const kinosaele = await Kinosaal.find();
        res.json(kinosaele);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Einen bestimmten Kinosaal abrufen
router.get('/:id', async (req, res) => {
    try {
        const kinosaal = await Kinosaal.findById(req.params.id);
        if (!kinosaal) {
            return res.status(404).json({ message: 'Kinosaal nicht gefunden' });
        }
        res.json(kinosaal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Neuen Kinosaal anlegen
router.post('/', async (req, res) => {
    try {
        const kinosaal = new Kinosaal({
            name: req.body.name,
            anzahlReihen: req.body.anzahlReihen,
            anzahlSitzeProReihe: req.body.anzahlSitzeProReihe
        });

        const neuerKinosaal = await kinosaal.save();
        res.status(201).json(neuerKinosaal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;