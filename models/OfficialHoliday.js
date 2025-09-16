const mongoose = require('mongoose');

const officialHolidaySchema = new mongoose.Schema(
  {
    holiday_id: {
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
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
    image_urls: [{
      type: String,
      trim: true,
    }],
    message: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: '__v',
  }
);

// Validate that end_date is after start_date
officialHolidaySchema.pre('save', function (next) {
  if (this.end_date < this.start_date) {
    return next(new Error('End date must be after start date'));
  }
  next();
});

module.exports = mongoose.model('OfficialHoliday', officialHolidaySchema);
