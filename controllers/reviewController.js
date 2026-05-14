const Review = require('../models/review');
const User = require('../models/User'); // <--- 1. Make sure to import User!
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    // Fetch the full user profile from the DB
    const userProfile = await User.findById(req.user.id);
    
    if (!userProfile) {
      return res.status(404).json({ message: "User not found" });
    }

    const newReview = new Review({
      user: req.user.id,
      name: userProfile.name, 
      rating,
      // ✅ FIX: Use userProfile (from DB) instead of req.user (from Token)
      picture: userProfile.picture, 
      comment
    });

    await newReview.save();
    res.status(201).json({ message: "Review submitted! Waiting for approval." });
  } catch (error) {
    console.error("Review Submit Error:", error.message);
    res.status(500).json({ message: error.message || "Failed to submit review" });
  }
};

// Get Approved Reviews (Public)
exports.getApprovedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ status: 'approved' }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews" });
  }
};

// Update Status (Admin Only)
exports.updateReviewStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await Review.findByIdAndUpdate(req.params.id, { status });
    res.json({ message: `Review ${status}` });
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};
// ✅ 1. Get ALL reviews (So Admin can see pending ones to approve)
exports.getAllReviewsAdmin = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error fetching all reviews" });
  }
};

// ✅ 2. Delete Review (For that red trash can button in your dashboard)
exports.deleteReview = async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};