const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, "Name is required"], 
      trim: true 
    },
    email: { 
      type: String, 
      required: [true, "Email is required"], 
      lowercase: true 
    },
    phone: { 
      type: String, 
      required: [true, "Phone number is required"] 
    },
    // 🆕 Added: Age (Essential for nutrition plans)
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [1, "Age must be valid"]
    },
    // 🆕 Added: Health Issue (Areej needs to know the specific problem)
    healthIssue: {
      type: String,
      required: [true, "Please describe the health issue"],
      trim: true
    },
    date: { 
      type: String, 
      required: [true, "Appointment date is required"] 
    },
    time: { 
      type: String, 
      required: [true, "Appointment time is required"] 
    },
    message: { 
      type: String, 
      trim: true 
    },
    status: { 
      type: String, 
      enum: ['pending', 'confirmed', 'completed', 'cancelled'], 
      default: 'pending' 
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);