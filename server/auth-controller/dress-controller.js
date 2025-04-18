const express = require('express');
const Dress = require('../model/dressSchema');
const nodemailer = require('nodemailer');
const Appo = require('../model/appointmentSchema');

const addDressDetails = async (req, res) => {
    try {
        const {
            shopName,
            shopAddress,
            shopMobile,
            measurements,
            productId,
            productName,
            productImage,
            price
        } = req.body;

        if (!shopName || !shopAddress || !shopMobile || !measurements || !productId || !productName || !productImage || !price) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            });
        }

        if (!measurements.waist || !measurements.bust || !measurements.hip) {
            return res.status(400).json({
                success: false,
                message: "Please provide all measurements (waist, bust, hip)"
            });
        }


        const dressOrder = await Dress.create({
            shopName,
            shopAddress,
            shopMobile,
            customer: req.user._id,
            customerName: req.user.username,
            measurements: {
                waist: measurements.waist,
                bust: measurements.bust,
                hip: measurements.hip
            },
            productId,
            productName,
            productImage,
            price
        });

        res.status(201).json({
            success: true,
            message: "Dress order created successfully",
            data: dressOrder
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error creating dress order",
            error: error.message
        });
    }
};

const getDressDetails = async (req, res) => {
    try {
        const dressOrders = await Dress.find({ customer: req.user._id });

        res.status(200).json({
            success: true,
            data: dressOrders
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error fetching dress orders",
            error: error.message
        });
    }
};



const bookAppointment = async (req, res) => {
    try {
        const { customerName, mobileNumber, appointmentDate, storeName, storeAddress, storeMobileNumber } = req.body;

        if (!customerName || !mobileNumber || !appointmentDate || !storeName || !storeAddress || !storeMobileNumber) {
            return res.status(400).json({
                success: false,
                message: "Please provide customer name, mobile number and appointment date"
            });
        }

        const appointment = await Appo.create({
            customerName,
            customer: req.user._id,
            mobileNumber,
            appointmentDate,
            storeName,
            storeAddress,
            storeMobileNumber
        });


        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.Email_AUTH,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_SENDER,
            subject: 'New Appointment Booking',
            text: `
                New appointment booking details:
                
                Customer Name: ${customerName}
                Mobile Number: ${mobileNumber}
                Appointment Date: ${new Date(appointmentDate).toLocaleString()}
            `
        };

        await transporter.sendMail(mailOptions).catch((error) => {
            console.error('Email error:', error);
            throw new Error('Failed to send email');
        });

        res.status(200).json({
            success: true,
            message: "Appointment booked successfully",
            data: appointment
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error booking appointment",
            error: error.message
        });
    }
};

const getAppointment = async (req, res) => {
    try {
        const dressOrders = await Appo.find({ customer: req.user._id });

        res.status(200).json({
            success: true,
            data: dressOrders
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error fetching dress orders",
            error: error.message
        });
    }
};




module.exports = {
    addDressDetails,
    getDressDetails,
    bookAppointment,
    getAppointment
};
