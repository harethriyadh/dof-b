const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema(
  {
    request_no: {
      type: String,
      required: true,
      unique: true,
      default: () => `LR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      index: true,
    },
    request_date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    employee_name: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    leave_type: {
      type: String,
      required: true,
      trim: true,
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
    number_of_days: {
      type: Number,
      required: true,
      min: 1,
    },
    reason: {
      type: String,
      required: false,
      trim: true,
    },
    spare_employee_id: {
      type: String,
      required: false,
      trim: true,
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ['approved', 'rejected', 'pending'],
      default: 'pending',
      index: true,
    },
    processing_date: {
      type: Date,
    },
    processed_by: {
      type: String,
      trim: true,
    },
    reason_for_rejection: {
      type: String,
      trim: true,
    },
    user_id: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: '__v',
  }
);

// Validate that end_date is after start_date
leaveRequestSchema.pre('save', function (next) {
  if (this.end_date < this.start_date) {
    return next(new Error('End date must be after start date'));
  }
  next();
});

// Calculate number_of_days automatically
leaveRequestSchema.pre('save', function (next) {
  if (this.start_date && this.end_date) {
    const timeDiff = this.end_date.getTime() - this.start_date.getTime();
    this.number_of_days = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end dates
  }
  next();
});

// Make number_of_days not required since it's calculated automatically
leaveRequestSchema.path('number_of_days').required(false);

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
