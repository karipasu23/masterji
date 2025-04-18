const mongoose = require('mongoose');

const appointmentSchema = mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tailor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tailor',
        required: true
    },
    service: {
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        }
    },
    appointmentDate: {
        type: Date,
        required: true
    },
    measurements: {
        bust: Number,
        waist: Number,
        hip: Number,
        shoulderLength: Number,
        armLength: Number,
        notes: String
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending'
    }
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;