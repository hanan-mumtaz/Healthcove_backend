const User = require('../models/User');
const jwt = require('jsonwebtoken');

// ✅ Standardized Token Generator
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// 1. Manual Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    user = new User({ name, email, password });
    await user.save();

    const token = generateToken(user._id, user.role);
    res.status(201).json({ token, user: { id: user._id, name, email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// 2. Manual Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id, user.role);
    // ✅ Include name/picture in response so login feels instant
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email, 
        role: user.role,
        picture: user.picture 
      } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login' });
  }
};

// 3. Google OAuth Callback
exports.googleCallback = (req, res) => {
  try {
    if (!req.user) {
      return res.redirect(`${process.env.FRONTEND_URL || process.env.CLIENT_URL}/#/signin?error=no_user`);
    }

    // Passport might nest the object differently; this check keeps it safe
    const userObj = req.user.user ? req.user.user : req.user;
    
    // Create token with ID and Role
    const token = generateToken(userObj._id, userObj.role);

    // ✅ Redirect to the #/auth-success route for HashRouter compatibility
    res.redirect(`${process.env.FRONTEND_URL || process.env.CLIENT_URL}/#/auth-success?token=${token}`);
  } catch (error) {
    console.error("Google Callback Error:", error);
    res.redirect(`${process.env.FRONTEND_URL || process.env.CLIENT_URL}/#/signin?error=server_error`);
  }
};

// 4. Get Current User (The "Sync" Route)
exports.getMe = async (req, res) => {
  try {
    // req.user.id is added by your authMiddleware (protect)
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });
    
    res.json(user); // ✅ Sends full record including 'name' and 'picture'
  } catch (error) {
    res.status(500).json({ message: "Server Error fetching profile" });
  }
};

// 5. Logout
exports.logout = async (req, res) => {
  res.json({ message: "Logged out successfully" });
};