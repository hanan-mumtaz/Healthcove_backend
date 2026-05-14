const Appointment = require('../models/Appointment');

// 1. Book Appointment
exports.book = async (req, res) => {
  try {
    const { name, email, phone, age, healthIssue, date, time, message } = req.body;
    
    // Security check: Use ID from token if available, otherwise from body
    const userId = req.user ? req.user.id : req.body.userId;

    const newAppointment = new Appointment({
      name, 
      email, 
      phone, 
      age, 
      healthIssue, 
      date, 
      time, 
      message,
      user: userId || null 
    });

    await newAppointment.save();
    res.status(201).json({ success: true, message: "Consultation requested!" });
  } catch (error) {
    res.status(500).json({ message: "Booking failed", error: error.message });
  }
};

// 2. Get User's Own Bookings (For Profile Page)
exports.getMyBookings = async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching your bookings" });
  }
};

// 3. Get All Bookings (Admin Dashboard)
exports.getAll = async (req, res) => {
  try {
    // Fetches all and sorts by newest request first
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching all bookings" });
  }
};

// 4. Update Status (Admin Portal)
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Appointment.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    );
    
    if (!updated) return res.status(404).json({ message: "Appointment not found" });
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};

// ✅ 5. Delete Appointment (Added to match the Trash2 icon in your frontend)
exports.deleteAppointment = async (req, res) => {
  try {
    const deleted = await Appointment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Appointment not found" });
    res.json({ message: "Appointment record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};