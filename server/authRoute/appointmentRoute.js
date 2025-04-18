const express = require('express');
const router = express.Router();
const authUserMiddleware = require('../middleware/authUser-middleware');
const {
    createAppointment,
    getCustomerAppointments,
    getTailorAppointments,
    updateAppointmentStatus,
    cancelAppointment,
    getAppointmentDetails,
    updateMeasurements
} = require('../auth-controller/appointment-controller');

// Public routes - none

// Protected routes - all require authentication
router.use(authUserMiddleware);

// Create new appointment
router.post('/create', createAppointment);

// Get appointments
router.get('/customer', getCustomerAppointments);
router.get('/tailor', getTailorAppointments);
router.get('/:appointmentId', getAppointmentDetails);

// Update appointments
router.patch('/:appointmentId/status', updateAppointmentStatus);
router.patch('/:appointmentId/measurements', updateMeasurements);

// Cancel appointment
router.patch('/:appointmentId/cancel', cancelAppointment);

module.exports = router;