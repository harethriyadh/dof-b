const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: [true, 'Department ID is required'],
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Department name is required'],
    trim: true,
    maxlength: [100, 'Department name cannot exceed 100 characters']
  },
  collegeId: {
    type: Number,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Department', departmentSchema);
