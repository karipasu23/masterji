const mongoose = require('mongoose');

const tailorSchema = mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Changed from true to false
    },
    shopName: {
        type: String,
        required: true
    },
    location: {
        area: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        pincode: {
            type: String,
            required: true
        }
    },
    contact: {
        phone: {
            type: String,
            required: true
        },
        whatsapp: String,
        email: String
    },
    shopImages: {
        type: [String],
        validate: [arrayLimit, 'Cannot exceed 5 shop images']
    },
    rating: {
        average: {
            type: Number,
            default: 0
        },
        count: {
            type: Number,
            default: 0
        }
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }],
    workingHours: {
        monday: { open: String, close: String },
        tuesday: { open: String, close: String },
        wednesday: { open: String, close: String },
        thursday: { open: String, close: String },
        friday: { open: String, close: String },
        saturday: { open: String, close: String },
        sunday: { open: String, close: String }
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    experience: {
        type: Number,
        required: true
    },
    specializations: [{
        type: String
    }]
}, { timestamps: true });

function arrayLimit(val) {
    return val.length <= 5;
}

// Indexes for better query performance
tailorSchema.index({ 'location.area': 1, 'location.city': 1 });
tailorSchema.index({ 'rating.average': -1 });

const Tailor = mongoose.model('Tailor', tailorSchema);
module.exports = Tailor;