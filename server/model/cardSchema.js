const mongoose = require('mongoose');

const cardSchema = mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product_id: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    },
    title: {
        type: String,
        required: true,
    },
    final_price: {
        type: Number,
        required: true,
    },
    initial_price: {
        type: Number,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    images: {
        type: [String],
    },
    brand: {
        type: String,
    },
    category: {
        type: String,
    },
    breadcrumbs: [{
        name: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    }],
    size: {
        type: String,
    },
    color: {
        type: String,
    },
    stock: {
        type: Number,
        default: 1
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Add index for better query performance
cardSchema.index({ 'breadcrumbs.name': 1 });

const Card = mongoose.model('Card', cardSchema);
module.exports = Card;