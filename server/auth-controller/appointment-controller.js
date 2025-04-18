const Appointment = require('../model/appointmentSchema');
const Tailor = require('../model/tailorSchema');
const Service = require('../model/serviceSchema');

// Create a new appointment
const createAppointment = async (req, res) => {
    try {
        const { tailorId, serviceId, appointmentDate, measurements } = req.body;

        // Verify tailor and service exist
        const tailor = await Tailor.findById(tailorId);
        const service = await Service.findById(serviceId);

        if (!tailor || !service) {
            return res.status(404).json({ 
                message: 'Tailor or service not found' 
            });
        }

        const newAppointment = new Appointment({
            customer: req.user._id,
            tailor: tailorId,
            service: {
                name: service.name,
                price: service.price
            },
            appointmentDate,
            measurements,
            status: 'pending'
        });

        await newAppointment.save();
        res.status(201).json({ 
            message: 'Appointment created successfully', 
            appointment: newAppointment 
        });
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({ 
            message: 'Error creating appointment', 
            error: error.message 
        });
    }
};

// Get all appointments for a customer
const getCustomerAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ customer: req.user._id })
            .populate('tailor', 'shopName location contact')
            .sort({ appointmentDate: -1 });

        res.status(200).json({ appointments });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ 
            message: 'Error fetching appointments', 
            error: error.message 
        });
    }
};

// Get all appointments for a tailor
const getTailorAppointments = async (req, res) => {
    try {
        // First find the tailor document using the logged-in user's ID
        const tailor = await Tailor.findOne({ owner: req.user._id });
        
        if (!tailor) {
            return res.status(404).json({
                message: 'Tailor profile not found'
            });
        }

        // console.log('Tailor ID:', tailor._id); // Debug log

        // Now use the tailor's ID to find appointments
        const appointments = await Appointment.find({ tailor: tailor._id })
            .populate('customer', 'username email')
            .populate('service', 'name price')
            .sort({ appointmentDate: -1 });

        res.status(200).json({ appointments });
    } catch (error) {
        console.error('Error fetching tailor appointments:', error);
        res.status(500).json({ 
            message: 'Error fetching appointments', 
            error: error.message 
        });
    }
};

// Update appointment status
const updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { appointmentId } = req.params;
        
        // First find the tailor document
        const tailor = await Tailor.findOne({ owner: req.user._id });
        
        if (!tailor) {
            return res.status(404).json({
                message: 'Tailor profile not found'
            });
        }

        const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                message: 'Invalid status' 
            });
        }

        // Use tailor._id instead of req.user._id
        const appointment = await Appointment.findOneAndUpdate(
            { _id: appointmentId, tailor: tailor._id },
            { status },
            { new: true }
        ).populate('customer', 'username email')
         .populate('service', 'name price');

        if (!appointment) {
            return res.status(404).json({ 
                message: 'Appointment not found' 
            });
        }

        res.status(200).json({ 
            message: 'Appointment status updated', 
            appointment 
        });
    } catch (error) {
        console.error('Error updating appointment:', error);
        res.status(500).json({ 
            message: 'Error updating appointment', 
            error: error.message 
        });
    }
};

// Cancel appointment
const cancelAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ 
                message: 'Appointment not found' 
            });
        }

        // Check if user is either the customer or tailor
        if (appointment.customer.toString() !== req.user._id.toString() && 
            appointment.tailor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ 
                message: 'Not authorized to cancel this appointment' 
            });
        }

        appointment.status = 'cancelled';
        await appointment.save();

        res.status(200).json({ 
            message: 'Appointment cancelled successfully', 
            appointment 
        });
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        res.status(500).json({ 
            message: 'Error cancelling appointment', 
            error: error.message 
        });
    }
};

// Get appointment details
const getAppointmentDetails = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const appointment = await Appointment.findById(appointmentId)
            .populate('tailor', 'shopName location contact')
            .populate('customer', 'username email');

        if (!appointment) {
            return res.status(404).json({ 
                message: 'Appointment not found' 
            });
        }

        res.status(200).json({ appointment });
    } catch (error) {
        console.error('Error fetching appointment details:', error);
        res.status(500).json({ 
            message: 'Error fetching appointment details', 
            error: error.message 
        });
    }
};

// Update appointment measurements
const updateMeasurements = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { measurements } = req.body;

        const appointment = await Appointment.findOneAndUpdate(
            { _id: appointmentId, customer: req.user._id },
            { measurements },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({ 
                message: 'Appointment not found' 
            });
        }

        res.status(200).json({ 
            message: 'Measurements updated', 
            appointment 
        });
    } catch (error) {
        console.error('Error updating measurements:', error);
        res.status(500).json({ 
            message: 'Error updating measurements', 
            error: error.message 
        });
    }
};

module.exports = {
    createAppointment,
    getCustomerAppointments,
    getTailorAppointments,
    updateAppointmentStatus,
    cancelAppointment,
    getAppointmentDetails,
    updateMeasurements
};