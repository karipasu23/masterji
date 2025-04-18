const express = require('express');
const router = express.Router();

const { 
    createTailor,
    getTailorById,
    getTailorServices,
    updateTailor,
    searchTailors,
    toggleAvailability,
    updateWorkingHours,
    getTailorsBySpecialization,
    deleteTailor,
    getFeaturedTailors
} = require('../auth-controller/tailor-controller');
const authUserMiddleware = require('../middleware/authUser-middleware');

// Profile management routes
router.post('/create', createTailor);
router.get('/:id', getTailorById);
router.get('/:id/services', getTailorServices);
router.put('/update', authUserMiddleware, updateTailor);
router.delete('/delete', authUserMiddleware, deleteTailor);

// Availability management
router.put('/toggle-availability', authUserMiddleware, toggleAvailability);
router.put('/working-hours', authUserMiddleware, updateWorkingHours);

// Search and filter routes
router.get('/search', searchTailors);
router.get('/specialization', getTailorsBySpecialization);

router.get('/featured', getFeaturedTailors);


module.exports = router;