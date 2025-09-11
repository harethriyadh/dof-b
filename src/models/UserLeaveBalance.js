const mongoose = require('mongoose');

const userLeaveBalanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  leaveTypeId: {
    type: Number,
    required: [true, 'Leave type ID is required']
  },
  balance: {
    type: Number,
    required: [true, 'Balance is required'],
    min: [0, 'Balance cannot be negative'],
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure unique balance per user and leave type
userLeaveBalanceSchema.index({ userId: 1, leaveTypeId: 1 }, { unique: true });

module.exports = mongoose.model('UserLeaveBalance', userLeaveBalanceSchema);
