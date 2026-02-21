import mongoose from 'mongoose';

const vorstellungSchema = new mongoose.Schema({
    datumUhrzeit: {
        type: Date,
        required: true
    },
    kinosaal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Kinosaal',
        required: true
    },
    filmName: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.model('Vorstellung', vorstellungSchema);