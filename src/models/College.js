const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: [true, 'College ID is required'],
    unique: true
  },
  name: {
    type: String,
    required: [true, 'College name is required'],
    trim: true,
    maxlength: [100, 'College name cannot exceed 100 characters']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('College', collegeSchema);
