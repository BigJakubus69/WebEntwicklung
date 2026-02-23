import mongoose from 'mongoose';

const reservierungSchema = new mongoose.Schema({
  vorstellung: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vorstellung',
    required: true
  },
  sitzplaetze: [{
    reihe: Number,
    sitz: Number
  }],
  kundenName: {
    type: String,
    required: true
  },
  qrCode: {
    type: String
  }
}, {
  timestamps: true
});

// Stellen Sie sicher, dass ein Sitzplatz nicht doppelt reserviert wird
reservierungSchema.index({ vorstellung: 1, 'sitzplaetze.reihe': 1, 'sitzplaetze.sitz': 1 }, { unique: true });

export default mongoose.model('Reservierung', reservierungSchema);
