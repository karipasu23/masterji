const express = require('express');
const bcrypt = require('bcrypt');
const app = express();
const User = require('../model/userSchema');
const Tailor = require('../model/tailorSchema');
const jwt = require('jsonwebtoken');
require('../db/connection')

// Add this helper function at the top
const generateToken = (user) => {
    return jwt.sign(
        { 
            _id: user._id,
            email: user.email,
            role: user.role
        }, 
        process.env.SECRET_KEY,
        { 
            expiresIn: '24h',
            algorithm: 'HS256'
        }
    );
};

// Modify register function
const register = async (req, res) => {
    try {
        const { username, email, phone, password } = req.body;

        if(!username || !email || !phone || !password) {
            return res.status(422).json({ error: "Please fill all the fields" });
        }

        const userExist = await User.findOne({email: email});

        if(userExist) {
            return res.status(422).json({ error: "User already exists" });
        }

        const userCreated = await User.create({
            username, 
            email, 
            phone, 
            password,
            role: 'user'
        });

        const token = generateToken(userCreated);

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                username,
                email,
                role: 'user'
            },
            token
        });
    } catch (err) {
        console.error("Registration error:", err);
        return res.status(500).json({
            success: false,
            error: "Registration failed"
        });
    }
}

// Modify login function
const Login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const userData = await User.findOne({ email })
            .select('+password'); // Only include password for comparison
        
        if (!userData) {
            return res.status(401).json({
                success: false,
                error: "Invalid credentials"
            });
        }
        
        const isMatch = await userData.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: "Invalid credentials"
            });
        }

        const token = generateToken(userData);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                email: userData.email,
                role: userData.role
            },
            token
        });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({
            success: false,
            error: "Login failed"
        });
    }
}


const registerTailor = async (req, res) => {
    try {
        const { username, email, phone, password, shopDetails } = req.body;

        if (!username || !email || !phone || !password) {
            return res.status(422).json({ error: "Please fill all the fields" });
        }

        const userExist = await User.findOne({email: email});

        if (userExist) {
            return res.status(422).json({ error: "User already exists" });
        }

        // Create user with tailor role
        const userCreated = await User.create({
            username, 
            email, 
            phone, 
            password,
            role: 'tailor', // Add tailor role
            isTailor: true  // Add tailor flag
        });

        // Create tailor profile and link it to user
        const tailor = await Tailor.create({
            ...shopDetails,
            owner: userCreated._id
        });

        return res.status(200).json({
            message: "Tailor registered successfully",
            user: username,
            email: email,
            token: await userCreated.generateAuthToken()
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Registration failed" });
    }
}

const getUser = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                message: "Authentication required" 
            });
        }

        // If user is a tailor, populate with tailor details
        if (req.user.isTailor) {
            const tailor = await Tailor.findOne({ owner: req.user._id })
                .select('-__v');

            if (!tailor) {
                return res.status(404).json({
                    success: false,
                    message: "Tailor profile not found"
                });
            }

            return res.status(200).json({
                success: true,
                userData: {
                    ...req.user.toObject(),
                    tailorProfile: tailor
                }
            });
        }

        // For regular users
        return res.status(200).json({
            success: true,
            userData: req.user
        });

    } catch (err) {
        console.error("Get user error:", err);
        return res.status(500).json({
            success: false,
            message: "Error fetching user data",
            error: err.message
        });
    }
}

module.exports = {Login , register, registerTailor , getUser}