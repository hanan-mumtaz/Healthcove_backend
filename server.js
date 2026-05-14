const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require("passport");
const connectDB = require('./config/db');

// Load Environment Variables
dotenv.config();

// Connect to Database
// Note: Vercel will use the MONGODB_URI set in your Dashboard Environment Variables
connectDB(); 

const app = express();

// 1. CORS Configuration
const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';
let frontendOrigin = frontendUrl;

try {
  frontendOrigin = new URL(frontendUrl).origin;
} catch (error) {
  frontendOrigin = frontendUrl;
}

const allowedOrigins = [
  frontendOrigin,
  'http://localhost:5173',
  'http://localhost:3000',
  /\.vercel\.app$/ // Crucial: Allows Vercel preview and production deployments
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some(o => typeof o === 'string' ? o === origin : o.test(origin))) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());
app.use(passport.initialize());

// 2. Load Passport Configuration
require("./config/passport");

// 3. Define Routes

/**
 * ✅ ROOT ROUTE (Health Check)
 * This prevents the "Cannot GET /" error when visiting the base URL.
 */
app.get('/', (req, res) => {
  res.status(200).json({
    message: "HealthCove API is Live and Running!",
    database: process.env.MONGODB_URI ? "Connected" : "Missing MONGODB_URI",
    mode: process.env.NODE_ENV || 'development',
    endpoints: {
      auth: "/api/auth (Google)",
      users: "/api/users (Local)",
      blogs: "/api/blogs",
      appointments: "/api/appointments",
      reviews: "/api/reviews"
    }
  });
});

/**
 * ✅ API ROUTES
 * These map to the files you provided
 */
app.use('/api/auth', require('./routes/auth'));         // Google Auth Logic
app.use('/api/users', require('./routes/users'));       // Local Register/Login Logic
app.use('/api/blogs', require('./routes/blogs'));       // Blog Posts
app.use('/api/appointments', require('./routes/appointments')); // Dietitian Bookings
app.use('/api/reviews', require('./routes/reviews'));   // Patient Reviews

// Static files (Warning: Vercel is read-only; ephemeral storage only)
app.use('/uploads', express.static('uploads'));

// 4. Global Error Handler
app.use((err, req, res, next) => {
  console.error("Internal Server Error:", err.message);
  res.status(500).json({ 
    message: 'Something went wrong on the server!',
    error: process.env.NODE_ENV === 'development' ? err.stack : "Internal Error"
  });
});

// 5. Start Server (Local Only)
const PORT = process.env.PORT || 5000;

/**
 * Vercel ignores this block. require.main === module ensures 
 * app.listen only runs when you run 'node server.js' locally.
 */
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

// ✅ CRITICAL FOR VERCEL
// Your api/index.js requires this export to handle serverless routing.
module.exports = app;