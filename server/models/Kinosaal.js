import mongoose from 'mongoose';

const kinosaalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  anzahlReihen: {
    type: Number,
    required: true,
    min: 1
  },
  anzahlSitzeProReihe: {
    type: Number,
    required: true,
    min: 1
  }
}, {
  timestamps: true
});

export default mongoose.model('Kinosaal', kinosaalSchema);
