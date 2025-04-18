const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Stitching', 'Alterations', 'Design', 'Repair']
    },
    description: {
        type: String,
        required: true
    },
    estimatedDays: {
        type: Number,
        required: true
    },
    tailor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tailor',
        required: true
    }
}, { timestamps: true });

const Service = mongoose.model('Service', serviceSchema);
module.exports = Service;