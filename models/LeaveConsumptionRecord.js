const mongoose = require('mongoose');

const leaveConsumptionRecordSchema = new mongoose.Schema(
  {
    record_id: {
      type: String,
      required: true,
      unique: true,
      default: () => new mongoose.Types.ObjectId().toHexString(),
      index: true,
    },
    user_id: {
      type: String,
      required: true,
      index: true,
    },
    leave_request_id: {
      type: String,
      required: true,
      index: true,
    },
    leave_type_id: {
      type: String,
      required: true,
      index: true,
    },
    days_consumed: {
      type: Number,
      required: true,
      min: 1,
    },
    date_recorded: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: '__v',
  }
);

module.exports = mongoose.model('LeaveConsumptionRecord', leaveConsumptionRecordSchema);
