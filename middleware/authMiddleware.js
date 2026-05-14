const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config();

const authMiddleware = (req, res, next) => {
  let token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    // ✅ Improved: Handles "Bearer " prefix more robustly
    if (token.startsWith("Bearer ") || token.startsWith("bearer ")) {
      token = token.slice(7, token.length).trimLeft();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // ✅ decoded now contains { id, role, iat, exp }
    req.user = decoded; 
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

const adminMiddleware = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // We check the DB to ensure the role hasn't changed since the token was issued
    const user = await User.findById(req.user.id);
    
    if (user && user.role === 'admin') {
      next(); 
    } else {
      res.status(403).json({ message: "Access denied. Admins only." });
    }
  } catch (error) {
    console.error("Admin Middleware Error:", error);
    res.status(500).json({ message: "Server error in admin verification" });
  }
};

const optionalAuth = (req, res, next) => {
  let token = req.header("Authorization");
  if (!token) return next();

  try {
    if (token.toLowerCase().startsWith("bearer ")) {
      token = token.slice(7).trim();
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (error) {
    // Proceed as guest if token is invalid
    next(); 
  }
};

module.exports = { authMiddleware, adminMiddleware, optionalAuth };