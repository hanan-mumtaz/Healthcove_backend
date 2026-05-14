const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true }, // Name of the client
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved'], default: 'pending' },
  picture: { type: String }, // ✅ Ensure this line exists!
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);