const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    notification_id: {
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
    message: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    is_read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: '__v',
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
