const User = require('../model/userSchema');
const Review = require('../model/reviewSchema');
const Tailor = require('../model/tailorSchema');
const Appointment = require('../model/appointmentSchema');
require('../db/connection');
const mongoose = require('mongoose');


const createReview = async (req, res) => {
    try {
        const userId = req.user._id;
        const { appointmentId, rating, comment } = req.body;

        if (!appointmentId || !rating || !comment) {
            return res.status(400).json({
                success: false,
                message: "Please provide appointmentId, rating, and comment"
            });
        }

        // Verify appointment exists and belongs to user
        const appointment = await Appointment.findOne({
            _id: appointmentId,
            customer: userId,
            status: 'completed'
        });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found or not eligible for review"
            });
        }

        // Check if already reviewed
        const existingReview = await Review.findOne({
            appointment: appointmentId,
            user: userId
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: "You have already reviewed this appointment"
            });
        }

        const reviewData = await Review.create({
            user: userId,
            appointment: appointmentId,
            tailor: appointment.tailor,
            rating,
            comment,
            createdAt: new Date()
        });

        const populatedReview = await Review.findById(reviewData._id)
            .populate('user', 'username email')
            .populate('tailor', 'shopName')
            .populate('appointment');

        // Update tailor's average rating
        const allTailorReviews = await Review.find({ 
            tailor: appointment.tailor 
        });
        
        const averageRating = allTailorReviews.reduce(
            (acc, review) => acc + review.rating, 0
        ) / allTailorReviews.length;

        await Tailor.findByIdAndUpdate(appointment.tailor, {
            $set: {
                'rating.average': averageRating,
                'rating.count': allTailorReviews.length
            }
        });

        // Mark appointment as reviewed
        appointment.reviewed = true;
        await appointment.save();

        return res.status(201).json({
            success: true,
            message: "Review added successfully",
            review: populatedReview
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Error adding review",
            error: err.message
        });
    }
};

const getAppointmentReviews = async (req, res) => {
    try {
        const { tailorId } = req.params;

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(tailorId)) {
            console.log("Invalid tailor ID format:", tailorId);
            return res.status(400).json({
                success: false,
                message: "Invalid tailor ID format"
            });
        }

        // First find the tailor document where owner matches the user ID
        const tailor = await Tailor.findOne({ owner: tailorId });
        
        if (!tailor) {
            console.log("No tailor found with owner ID:", tailorId);
            return res.status(404).json({
                success: false,
                message: "Tailor not found"
            });
        }

        // Now find reviews using the tailor's _id
        const reviews = await Review.find({ tailor: tailor._id })
            .populate('user', 'username email')
            .populate({
                path: 'appointment',
                populate: {
                    path: 'service',
                    select: 'name price'
                }
            })
            .populate('tailor', 'shopName')
            .sort({ createdAt: -1 });

        console.log(`Found ${reviews.length} reviews for tailor with owner ID ${tailorId}`);

        if (!reviews || reviews.length === 0) {
            return res.status(200).json({
                success: true,
                averageRating: 0,
                totalReviews: 0,
                reviews: []
            });
        }

        const averageRating = reviews.reduce(
            (acc, review) => acc + review.rating, 0
        ) / reviews.length;

        return res.status(200).json({
            success: true,
            averageRating,
            totalReviews: reviews.length,
            reviews: reviews.map(review => ({
                _id: review._id,
                user: review.user,
                rating: review.rating,
                comment: review.comment,
                createdAt: review.createdAt,
                appointment: {
                    _id: review.appointment._id,
                    service: review.appointment.service,
                    appointmentDate: review.appointment.appointmentDate
                },
                tailor: review.tailor
            }))
        });

    } catch (err) {
        console.error("Error in getAppointmentReviews:", err);
        return res.status(500).json({
            success: false,
            message: "Error retrieving reviews",
            error: err.message
        });
    }
};

const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user._id;

        const review = await Review.findOne({
            _id: reviewId,
            user: userId
        }).populate('appointment');

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found or unauthorized"
            });
        }

        // Remove review flag from appointment
        await Appointment.findByIdAndUpdate(review.appointment._id, {
            $set: { reviewed: false }
        });

        await Review.deleteOne({ _id: reviewId });

        // Update tailor rating
        const remainingReviews = await Review.find({
            tailor: review.tailor
        });

        const averageRating = remainingReviews.length > 0
            ? remainingReviews.reduce((acc, rev) => acc + rev.rating, 0) / remainingReviews.length
            : 0;

        await Tailor.findByIdAndUpdate(review.tailor, {
            $set: {
                'rating.average': averageRating,
                'rating.count': remainingReviews.length
            }
        });

        return res.status(200).json({
            success: true,
            message: "Review deleted successfully"
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Error deleting review",
            error: err.message
        });
    }
};

module.exports = {
    createReview,
    getAppointmentReviews,
    deleteReview
};