const express = require('express');
const router = express.Router();
const Review = require('../model/reviewSchema');

const { 
    createReview,
    getAppointmentReviews,
    deleteReview
} = require('../auth-controller/reviews-controller');
const authUserMiddleware = require('../middleware/authUser-middleware');

// Protected review routes
router.use(authUserMiddleware);

// Create a review for an appointment
router.post('/create', createReview);

// Get all reviews for a tailor
router.get('/tailor/:tailorId', getAppointmentReviews);

router.get('/appointment/:appointmentId', async (req, res) => {
    try {
      const review = await Review.findOne({ 
        appointment: req.params.appointmentId,
        user: req.user._id 
      }).populate('appointment'); // Add populate to get appointment details if needed
      
      return res.status(200).json({
        success: true,
        review
      });
    } catch (error) {
      console.error('Error fetching review:', error);
      return res.status(500).json({
        success: false,
        message: "Error fetching review",
        error: error.message
      });
    }
});

// Delete a review (only by the review author)
router.delete('/:reviewId', deleteReview);

module.exports = router;