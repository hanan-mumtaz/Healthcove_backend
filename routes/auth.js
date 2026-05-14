const express = require('express');
const router = express.Router();
const passport = require('passport');

// ✅ FIX: Add 'getMe' to this list!
const { googleCallback, logout, getMe } = require('../controllers/authController');

const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/auth/google
 */
router.get(
    "/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
        prompt: "select_account",
    })
);

/**
 * @route   GET /api/auth/google/callback
 */
router.get(
    "/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: "/" }),
    googleCallback
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile (This powers Hanan's Profile page)
 * @access  Private
 */
router.get("/me", authMiddleware, getMe); // 👈 Now this will work!

/**
 * @route   POST /api/auth/logout
 */
router.post("/logout", authMiddleware, logout);

module.exports = router;