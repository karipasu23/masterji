const jwt = require('jsonwebtoken');
const User = require('../model/userSchema');

const authUserMiddleware = async (req, res, next) => {
    try {
        // Get token and check if exists
        const authHeader = req.header('Authorization');
        // console.log('Full Authorization header:', authHeader);

        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ 
                message: 'Authentication required. Please provide a valid token.' 
            });
        }

        // Clean and validate token
        const token = authHeader.split(' ')[1];
        // console.log('Extracted token:', token);

        // Changed token validation to check for null string
        if (!token || token === 'null' || token === 'undefined') {
            return res.status(401).json({ 
                message: 'No token provided' 
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        // console.log('Decoded token:', decoded);

        // Find user with both email and _id
        const user = await User.findOne({ 
            email: decoded.email,
            // _id: decoded._id 
        });

        if (!user) {
            return res.status(401).json({ 
                message: 'User not found' 
            });
        }

        // Attach user and token to request
        req.user = user;
        req.token = token;

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                message: 'Invalid token',
                error: error.message 
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                message: 'Token expired',
                error: error.message 
            });
        }

        res.status(500).json({ 
            message: 'Authentication failed',
            error: error.message 
        });
    }
};

module.exports = authUserMiddleware;