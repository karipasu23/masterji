const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
// const Razorpay = require('razorpay');
const app = express();
const ErrorHandler = require('./middleware/error-handler')

dotenv.config();

const corsOption = {
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD", "UPDATE"],
    credentials: true,
}
app.use(cors(corsOption));

app.use(express.json());

app.use('/api/auth', require('./authRoute/auth'))
// app.use('/api/payment', require('./authRoute/paymentRoutes'));
app.use('/api/card' , require('./authRoute/cardRoute'));
app.use('/api/review' , require('./authRoute/reviewRoute'));
app.use('/api' , require('./authRoute/imageRoute'));
app.use('/api/dress' , require('./authRoute/dressRoute'));
app.use('/api/tailor' , require('./authRoute/tailorRoute'));
app.use('/api/services' , require('./authRoute/servicesRoute'));
app.use('/api/appointment' , require('./authRoute/appointmentRoute'));
app.use(ErrorHandler);

const port = process.env.PORT;

require('./db/connection');

app.listen(port, () => {
    console.log(`Server is running on port:${port}`);
});