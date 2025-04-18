const Service = require('../model/serviceSchema');
const Tailor = require('../model/tailorSchema');

// Add new service
const addService = async (req, res) => {
    try {

        console.log('Request user:', req.user);
        const tailor = await Tailor.findOne({ owner: req.user._id });
        
        if (!tailor) {
            return res.status(404).json({ 
                message: 'Tailor profile not found' 
            });
        }

        const newService = new Service({
            ...req.body,
            tailor: tailor._id
        });

        await newService.save();
        res.status(201).json({ 
            message: 'Service added successfully', 
            service: newService 
        });
    } catch (error) {
        console.error('Error adding service:', error);
        res.status(500).json({ 
            message: 'Error adding service', 
            error: error.message 
        });
    }
};

// Get all services for a tailor
const getTailorServices = async (req, res) => {
    try {
        const tailor = await Tailor.findOne({ owner: req.user._id });
        
        if (!tailor) {
            return res.status(404).json({ 
                message: 'Tailor profile not found' 
            });
        }

        const services = await Service.find({ tailor: tailor._id });
        res.status(200).json({ services });
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ 
            message: 'Error fetching services', 
            error: error.message 
        });
    }
};

const getPopularServices = async (req, res) => {
    try {
        // First try to get popular services (sorted by bookings)
        let services = await Service.find()
            .sort({ bookings: -1 })
            .limit(3)
            .populate('tailor', 'shopName');

        // If no services found, get any services
        if (!services || services.length === 0) {
            services = await Service.find()
                .limit(3)
                .populate('tailor', 'shopName');
        }

        // If still no services found, return appropriate message
        if (!services || services.length === 0) {
            return res.status(404).json({
                message: 'No services found',
                services: []
            });
        }

        res.status(200).json({ services });
    } catch (error) {
        console.error('Error fetching popular services:', error);
        res.status(500).json({ 
            message: 'Error fetching popular services',
            error: error.message 
        });
    }
};

// Update service
const updateService = async (req, res) => {
    try {
        const tailor = await Tailor.findOne({ owner: req.user._id });
        
        if (!tailor) {
            return res.status(404).json({ 
                message: 'Tailor profile not found' 
            });
        }

        const updatedService = await Service.findOneAndUpdate(
            { 
                _id: req.params.id, 
                tailor: tailor._id 
            },
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedService) {
            return res.status(404).json({ 
                message: 'Service not found' 
            });
        }

        res.status(200).json({ 
            message: 'Service updated successfully', 
            service: updatedService 
        });
    } catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({ 
            message: 'Error updating service', 
            error: error.message 
        });
    }
};

// Delete service
const deleteService = async (req, res) => {
    try {
        const tailor = await Tailor.findOne({ owner: req.user._id });
        
        if (!tailor) {
            return res.status(404).json({ 
                message: 'Tailor profile not found' 
            });
        }

        const deletedService = await Service.findOneAndDelete({
            _id: req.params.id,
            tailor: tailor._id
        });

        if (!deletedService) {
            return res.status(404).json({ 
                message: 'Service not found' 
            });
        }

        res.status(200).json({ 
            message: 'Service deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({ 
            message: 'Error deleting service', 
            error: error.message 
        });
    }
};

// Search services by category
const searchServicesByCategory = async (req, res) => {
    try {
        const { category } = req.query;
        const services = await Service.find({ category })
            .populate('tailor', 'shopName location rating');

        res.status(200).json({ services });
    } catch (error) {
        console.error('Error searching services:', error);
        res.status(500).json({ 
            message: 'Error searching services', 
            error: error.message 
        });
    }
};

// Get service details by ID
const getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id)
            .populate('tailor', 'shopName location contact rating');

        if (!service) {
            return res.status(404).json({ 
                message: 'Service not found' 
            });
        }

        res.status(200).json({ service });
    } catch (error) {
        console.error('Error fetching service:', error);
        res.status(500).json({ 
            message: 'Error fetching service', 
            error: error.message 
        });
    }
};

// Get services by price range
const getServicesByPriceRange = async (req, res) => {
    try {
        const { min, max } = req.query;
        
        const services = await Service.find({
            price: { 
                $gte: parseFloat(min) || 0, 
                $lte: parseFloat(max) || Infinity 
            }
        }).populate('tailor', 'shopName location');

        res.status(200).json({ services });
    } catch (error) {
        console.error('Error fetching services by price:', error);
        res.status(500).json({ 
            message: 'Error fetching services', 
            error: error.message 
        });
    }
};

module.exports = {
    addService,
    getTailorServices,
    getPopularServices,
    updateService,
    deleteService,
    searchServicesByCategory,
    getServiceById,
    getServicesByPriceRange
};