const mongoose = require('mongoose');

const leaveTypeSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: [true, 'Leave type ID is required'],
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Leave type name is required'],
    trim: true,
    maxlength: [50, 'Leave type name cannot exceed 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Leave type description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LeaveType', leaveTypeSchema);
