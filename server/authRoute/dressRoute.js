const express = require('express');
const { addDressDetails , getDressDetails , bookAppointment, getAppointment} = require('../auth-controller/dress-controller');
const authUserMiddleware = require('../middleware/authUser-middleware');
const router = express.Router();

router.post('/addDress',authUserMiddleware, addDressDetails);
router.get('/getDress',authUserMiddleware, getDressDetails);
router.post('/book', authUserMiddleware, bookAppointment);
router.get('/getbook', authUserMiddleware,  getAppointment);

module.exports = router;