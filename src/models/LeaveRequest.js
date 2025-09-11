const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  leaveTypeId: {
    type: Number,
    required: [true, 'Leave type ID is required']
  },
  daysCount: {
    type: Number,
    required: [true, 'Days count is required'],
    min: [1, 'Days count must be at least 1']
  },
  startingDate: {
    type: Date,
    required: [true, 'Starting date is required']
  },
  endingDate: {
    type: Date,
    required: [true, 'Ending date is required']
  },
  description: {
    type: String,
    default: null,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: ['approved', 'rejected', 'pending'],
    default: 'pending'
  },
  departmentId: {
    type: Number,
    required: [true, 'Department ID is required']
  },
  isPaid: {
    type: Boolean,
    required: [true, 'Is paid field is required'],
    default: true
  }
}, {
  timestamps: true
});

// Validate that ending date is after starting date
leaveRequestSchema.pre('save', function(next) {
  if (this.startingDate && this.endingDate && this.startingDate >= this.endingDate) {
    return next(new Error('Ending date must be after starting date'));
  }
  next();
});

// Virtual for calculating total days
leaveRequestSchema.virtual('totalDays').get(function() {
  if (this.startingDate && this.endingDate) {
    const start = new Date(this.startingDate);
    const end = new Date(this.endingDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end dates
  }
  return this.daysCount;
});

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
