const mongoose = require('mongoose');

const dressSchema = new mongoose.Schema({

    shopName: {
        type: String,
        required: true
    },
    shopAddress: {
        type: String,
        required: true
    },
    shopMobile: {
        type: String,
        required: true
    },

    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    customerName: {
        type: String,
        required: true
    },

    measurements: {
        waist: {
            type: Number,
            required: true
        },
        bust: {
            type: Number,
            required: true
        },
        hip: {
            type: Number,
            required: true
        }
    },

    productId: {
        type: String,
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    productImage: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Dress', dressSchema);
