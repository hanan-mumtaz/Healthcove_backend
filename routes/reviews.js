const express = require('express');
const router = express.Router();
const { 
  addReview, 
  getApprovedReviews, 
  updateReviewStatus,
  getAllReviewsAdmin, // ✅ Add this
  deleteReview        // ✅ Add this
} = require('../controllers/reviewController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// --- PUBLIC ROUTES ---
router.get('/', getApprovedReviews); 

// --- USER ROUTES (Must be logged in) ---
router.post('/', authMiddleware, addReview); 

// --- ADMIN ONLY ROUTES ---
// 1. Fetch all reviews (including pending) for the dashboard
router.get('/admin/all', authMiddleware, adminMiddleware, getAllReviewsAdmin);

// 2. Approve/Reject a review
router.patch('/:id', authMiddleware, adminMiddleware, updateReviewStatus); 

// 3. Delete a review
router.delete('/:id', authMiddleware, adminMiddleware, deleteReview);

module.exports = router;