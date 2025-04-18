const express = require('express');
const { checkout , verifyPayment } = require('../auth-controller/paymentController');
const router = express.Router();

router.post('/create-order', checkout);
router.post('/verify-payment', verifyPayment);
// router.post('/place-order', placeOrder);
// router.post('/generate-otp', generateAndSendOtp);

module.exports = router;
