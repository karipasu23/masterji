const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../model/userSchema');
const nodemailer = require('nodemailer');
const Payment = require('../model/paymentSchema');
const otpGenerator = require('otp-generator');
const twilio = require('twilio');

// const razorpayInstance = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// const twilioClient = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
// const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const checkout = async (req, res) => {
    const { amount } = req.body;
    if (!amount) {
        return res.status(400).json({ error: "amount is required" });
    }

    const options = {
        amount: amount * 100,
        currency: "INR",
        receipt: "receipt_order_" + Math.random().toString(36).substring(7),
    }
    try {
        const order = await razorpayInstance.orders.create(options);
        res.status(200).json({ orederId: order.id });

    } catch (error) {
        res.status(500).json({ error: "Error creating order" });
    }
    console.log(req.body);
}

const verifyPayment = async (req, res) => {
    // const { orderId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    console.log(await req.body);

    // const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    // shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`); 

    // const generatedSignature = shasum.digest('hex'); 

    // console.log("Generated Signature:", generatedSignature);
    // console.log("Razorpay Signature:", razorpay_signature);

    // if (generatedSignature === razorpay_signature) {
    res.status(200).json({ success: true });
    // } else {
    //     console.log("Signature verification failed");
    //     res.status(400).json({
    //         success: false,
    //         message: "Payment verification failed",
    //         details: {
    //             generatedSignature,
    //             razorpay_signature,
    //             orderId
    //         }
    //     });
    // }
}

const sendOtp = async (mobileNumber, otp) => {
    const message = `Your OTP for payment verification is: ${otp}`;
    try {
        await twilioClient.messages.create({
            body: message,
            from: twilioPhoneNumber,
            to: mobileNumber
        });
    } catch (error) {
        console.error("Error sending OTP:", error);
        throw error;
    }
};

// const verifyOtp = (inputOtp, storedOtp) => {
//     return inputOtp === storedOtp;
// };

// const placeOrder = async (req, res) => {
//     try {
//         const { orderId, razorpay_payment_id, razorpay_order_id, razorpay_signature, amount, mobileNumber } = req.body;

//         // Verify the payment signature
//         const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
//         shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
//         const generatedSignature = shasum.digest('hex');

//         if (generatedSignature !== razorpay_signature) {
//             return res.status(400).json({ error: "Invalid payment signature" });
//         }

//         // Verify OTP
//         const payment = await Payment.findOne({ orderId });
//         if (!verifyOtp(otp, payment.otp)) {
//             return res.status(400).json({ error: "Invalid OTP" });
//         }

//         // Get user details from the authenticated user
//         const user = await User.findById(req.user._id);
//         const username = user.username;
//         const userEmail = user.email;

//         // Update the user's order history
//         user.orders.push({
//             orderId,
//             paymentId: razorpay_payment_id,
//             amount,
//             date: new Date()
//         });
//         await user.save();

//         // Save payment details to the database
//         const paymentData = new Payment({
//             orderId,
//             paymentId: razorpay_payment_id,
//             amount,
//             userId: req.user._id,
//             username,
//             userEmail,
//             mobileNumber,
//             otp
//         });
//         await paymentData.save();

//         // Send order confirmation email
//         const transporter = nodemailer.createTransport({
//             service: 'gmail',
//             auth: {
//                 user: process.env.EMAIL_USER,
//                 pass: process.env.EMAIL_PASSWORD
//             }
//         });

//         const mailOptions = {
//             from: process.env.EMAIL_USER,
//             to: userEmail,
//             subject: 'Order Confirmation',
//             text: `Your order with ID ${orderId} has been successfully placed. Amount paid: Rs. ${amount}`
//         };

//         await transporter.sendMail(mailOptions);
        
//         res.status(200).json({ success: true, message: "Order placed successfully" });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "Error placing order" });
//     }
// };

// const generateAndSendOtp = async (req, res) => {
//     const { mobileNumber } = req.body;
//     const otp = otpGenerator.generate(8, { digits: true, alphabets: false, upperCase: false, specialChars: false });
//     if (!mobileNumber) {
//         return res.status(400).json({ error: "Mobile number is required" });
//     }

//     await sendOtp(mobileNumber, otp);



//     // const payment = new Payment({ mobileNumber, otp });
//     // await payment.save();

//     res.status(200).json({ success: true, message: "OTP sent successfully" });
// };

module.exports = {checkout, verifyPayment };