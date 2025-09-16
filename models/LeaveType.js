const mongoose = require('mongoose');

const leaveTypeSchema = new mongoose.Schema(
  {
    leave_type_id: {
      type: String,
      required: true,
      unique: true,
      default: () => new mongoose.Types.ObjectId().toHexString(),
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    payment_status: {
      type: String,
      required: true,
      trim: true,
    },
    duration_rules: [{
      min_days: {
        type: Number,
        required: true,
        min: 0,
      },
      max_days: {
        type: Number,
        required: true,
        min: 1,
      },
      payment_status: {
        type: String,
        required: true,
        trim: true,
      },
    }],
    frequency: {
      type: {
        type: String,
        enum: ['monthly', 'once_per_lifetime', 'limited_per_lifetime'],
        required: true,
      },
      limit: {
        type: Number,
        min: 0,
      },
      days_per_period: {
        type: Number,
        min: 0,
      },
    },
    balance_rules: {
      is_accumulative: {
        type: Boolean,
        default: false,
      },
      expires: {
        type: Boolean,
        default: false,
      },
    },
    required_balance_id: {
      type: String,
      trim: true,
    },
    requires_proof: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: '__v',
  }
);

module.exports = mongoose.model('LeaveType', leaveTypeSchema);
