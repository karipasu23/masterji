const express = require('express');
const router = express.Router();
const signup = require('../auth-validator/auth-validator')
const validate = require('../middleware/auth-middleware')
const authUserMiddleware = require('../middleware/authUser-middleware')
const {Login, register , getUser, registerTailor} = require('../auth-controller/auth-controller')

router.post('/register', validate(signup), register);
router.post('/register-tailor', registerTailor);
router.post('/login', Login)
router.get('/getUser' ,authUserMiddleware, getUser );


module.exports = router