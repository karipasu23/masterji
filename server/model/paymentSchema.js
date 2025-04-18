const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    orderId: { type: String, required: true },
    paymentId: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    userEmail: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    otp: { type: String, required: true }
});

module.exports = mongoose.model('Payment', paymentSchema); 