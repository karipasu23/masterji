const express = require('express');
const router = express.Router();
const auth = require('../middleware/authUser-middleware');
const { 
    addService,
    getTailorServices,
    updateService,
    deleteService,
    searchServicesByCategory,
    getServiceById,
    getServicesByPriceRange,
    getPopularServices
} = require('../auth-controller/service-controller');

router.get('/popular', getPopularServices);
// Protected routes (require authentication)
router.use(auth); // Apply auth middleware to all routes    

// Service management routes for tailor dashboard
router.post('/add', addService);
router.get('/', getTailorServices);
router.put('/:id', updateService);
router.delete('/:id', deleteService);

// Search and filter routes
router.get('/search', searchServicesByCategory);
router.get('/price-range', getServicesByPriceRange);
router.get('/:id', getServiceById);


module.exports = router;