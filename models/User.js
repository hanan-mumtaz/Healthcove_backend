const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true, 
      lowercase: true 
    },
    password: { 
      type: String,
      // We don't set 'required: true' here to allow Google OAuth users 
      // to exist without a traditional password.
    }, 
    googleId: { type: String, unique: true, sparse: true },
    role: { 
      type: String, 
      enum: ['client', 'admin'], 
      default: 'client' 
    },
    picture: { type: String },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash if the password is new or being modified
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Helper method to verify password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false; // Handle Google users trying to login via email
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);