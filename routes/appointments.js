const express = require('express');
const router = express.Router();

// 1. Import the Controllers (The Logic)
const { 
    book, 
    getAll, 
    getMyBookings, 
    updateStatus,
    deleteAppointment // ✅ Added this to handle the trash can icon
} = require('../controllers/appointmentController');

// 2. Import the Middlewares (The Security)
// We destructure these from your middleware file
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// --- PUBLIC ROUTES ---

/**
 * @route   POST /api/appointments/book
 * @desc    Create a new appointment (Guest or Logged-in User)
 * @access  Public
 */
router.post('/book', book);


// --- PRIVATE USER ROUTES ---

/**
 * @route   GET /api/appointments/my-bookings
 * @desc    Get appointments for the currently logged-in user
 * @access  Private (Requires Token)
 */
router.get('/my-bookings', authMiddleware, getMyBookings);


// --- ADMIN ROUTES (Dietitian Only) ---

// ✅ Fix: Frontend useEffect calls API.get('/appointments')
// Using '/' here makes it easier to match the frontend request
router.get('/', authMiddleware, adminMiddleware, getAll);
/**
 * ✅ Fix: Changed to .put
 * Frontend handleUpdateStatus uses API.put(`/appointments/${id}/status`)
 */
router.put('/:id/status', authMiddleware, adminMiddleware, updateStatus);
/**
 * ✅ Added Delete Route
 * Frontend handleDelete uses API.delete(`/appointments/${id}`)
 */
router.delete('/:id', authMiddleware, adminMiddleware, deleteAppointment);

module.exports = router;