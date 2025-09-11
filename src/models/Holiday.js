const mongoose = require('mongoose');
const moment = require('moment');

const holidaySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Holiday name is required'],
    trim: true,
    minlength: [2, 'Holiday name must be at least 2 characters long'],
    maxlength: [100, 'Holiday name cannot exceed 100 characters']
  },
  nameAr: {
    type: String,
    required: [true, 'Holiday name in Arabic is required'],
    trim: true,
    minlength: [2, 'Holiday name in Arabic must be at least 2 characters long'],
    maxlength: [100, 'Holiday name in Arabic cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(value) {
        return value >= this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  year: {
    type: Number,
    min: [2020, 'Year must be at least 2020'],
    max: [2030, 'Year cannot exceed 2030'],
    validate: {
      validator: function(value) {
        if (this.isRecurring && value) {
          return false;
        }
        if (!this.isRecurring && !value) {
          return false;
        }
        return true;
      },
      message: 'Year is required for non-recurring holidays and should not be set for recurring holidays'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  color: {
    type: String,
    default: '#ff6b6b',
    match: [/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color code']
  },
  icon: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: {
      values: ['national', 'religious', 'cultural', 'company', 'other'],
      message: 'Category must be one of: national, religious, cultural, company, other'
    },
    default: 'other'
  },
  priority: {
    type: Number,
    default: 0,
    min: [0, 'Priority cannot be negative']
  },
  affectedDepartments: [{
    type: String,
    trim: true
  }],
  excludedDepartments: [{
    type: String,
    trim: true
  }],
  affectedRoles: [{
    type: String,
    enum: {
      values: ['employee', 'head_of_department', 'manager', 'admin', 'superadmin'],
      message: 'Role must be one of: employee, head_of_department, manager, admin, superadmin'
    }
  }],
  excludedRoles: [{
    type: String,
    enum: {
      values: ['employee', 'head_of_department', 'manager', 'admin', 'superadmin'],
      message: 'Role must be one of: employee, head_of_department, manager, admin, superadmin'
    }
  }],
  isPaid: {
    type: Boolean,
    default: true
  },
  isMandatory: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
holidaySchema.index({ name: 1 });
holidaySchema.index({ startDate: 1 });
holidaySchema.index({ endDate: 1 });
holidaySchema.index({ isActive: 1 });
holidaySchema.index({ isRecurring: 1 });
holidaySchema.index({ year: 1 });
holidaySchema.index({ category: 1 });

// Compound indexes
holidaySchema.index({ startDate: 1, endDate: 1 });
holidaySchema.index({ isActive: 1, startDate: 1 });
holidaySchema.index({ year: 1, startDate: 1 });

// Virtual for duration
holidaySchema.virtual('duration').get(function() {
  const start = moment(this.startDate);
  const end = moment(this.endDate);
  return end.diff(start, 'days') + 1;
});

// Virtual for is current
holidaySchema.virtual('isCurrent').get(function() {
  const now = moment();
  const start = moment(this.startDate);
  const end = moment(this.endDate);
  return now.isBetween(start, end, 'day', '[]');
});

// Virtual for is upcoming
holidaySchema.virtual('isUpcoming').get(function() {
  const now = moment();
  const start = moment(this.startDate);
  return now.isBefore(start, 'day');
});

// Virtual for is past
holidaySchema.virtual('isPast').get(function() {
  const now = moment();
  const end = moment(this.endDate);
  return now.isAfter(end, 'day');
});

// Virtual for display name
holidaySchema.virtual('displayName').get(function() {
  return this.name;
});

// Virtual for display name in Arabic
holidaySchema.virtual('displayNameAr').get(function() {
  return this.nameAr;
});

// Pre-save middleware to validate dates
holidaySchema.pre('save', function(next) {
  if (this.startDate && this.endDate) {
    if (this.endDate < this.startDate) {
      return next(new Error('End date must be after start date'));
    }
  }
  next();
});

// Instance method to check if holiday affects user
holidaySchema.methods.affectsUser = function(user) {
  // Check if holiday is active
  if (!this.isActive) {
    return false;
  }

  // Check if user role is excluded
  if (this.excludedRoles && this.excludedRoles.includes(user.role)) {
    return false;
  }

  // Check if user role is affected (if specified)
  if (this.affectedRoles && this.affectedRoles.length > 0 && !this.affectedRoles.includes(user.role)) {
    return false;
  }

  // Check if user department is excluded
  if (this.excludedDepartments && this.excludedDepartments.includes(user.department)) {
    return false;
  }

  // Check if user department is affected (if specified)
  if (this.affectedDepartments && this.affectedDepartments.length > 0 && !this.affectedDepartments.includes(user.department)) {
    return false;
  }

  return true;
};

// Instance method to check if date falls within holiday
holidaySchema.methods.includesDate = function(date) {
  const checkDate = moment(date);
  const start = moment(this.startDate);
  const end = moment(this.endDate);
  return checkDate.isBetween(start, end, 'day', '[]');
};

// Instance method to get holiday summary
holidaySchema.methods.getSummary = function() {
  return {
    id: this._id,
    name: this.name,
    nameAr: this.nameAr,
    description: this.description,
    startDate: this.startDate,
    endDate: this.endDate,
    duration: this.duration,
    isRecurring: this.isRecurring,
    year: this.year,
    isActive: this.isActive,
    isPublic: this.isPublic,
    color: this.color,
    icon: this.icon,
    category: this.category,
    priority: this.priority,
    isPaid: this.isPaid,
    isMandatory: this.isMandatory,
    isCurrent: this.isCurrent,
    isUpcoming: this.isUpcoming,
    isPast: this.isPast
  };
};

// Instance method to get holiday details
holidaySchema.methods.getDetails = function() {
  return {
    ...this.getSummary(),
    affectedDepartments: this.affectedDepartments,
    excludedDepartments: this.excludedDepartments,
    affectedRoles: this.affectedRoles,
    excludedRoles: this.excludedRoles,
    notes: this.notes
  };
};

// Static method to find active holidays
holidaySchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ startDate: 1 });
};

// Static method to find current holidays
holidaySchema.statics.findCurrent = function() {
  const now = new Date();
  return this.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now }
  }).sort({ startDate: 1 });
};

// Static method to find upcoming holidays
holidaySchema.statics.findUpcoming = function(limit = 10) {
  const now = new Date();
  return this.find({
    isActive: true,
    startDate: { $gt: now }
  })
    .sort({ startDate: 1 })
    .limit(limit);
};

// Static method to find holidays by year
holidaySchema.statics.findByYear = function(year) {
  return this.find({
    $or: [
      { year: year },
      { isRecurring: true }
    ],
    isActive: true
  }).sort({ startDate: 1 });
};

// Static method to find holidays by month
holidaySchema.statics.findByMonth = function(year, month) {
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0);
  
  return this.find({
    isActive: true,
    $or: [
      {
        startDate: { $lte: endOfMonth },
        endDate: { $gte: startOfMonth }
      },
      {
        isRecurring: true,
        $expr: {
          $and: [
            { $lte: [{ $month: '$startDate' }, month] },
            { $gte: [{ $month: '$endDate' }, month] }
          ]
        }
      }
    ]
  }).sort({ startDate: 1 });
};

// Static method to find holidays by category
holidaySchema.statics.findByCategory = function(category) {
  return this.find({ category, isActive: true }).sort({ startDate: 1 });
};

// Static method to find recurring holidays
holidaySchema.statics.findRecurring = function() {
  return this.find({ isRecurring: true, isActive: true }).sort({ startDate: 1 });
};

// Static method to find holidays affecting department
holidaySchema.statics.findByDepartment = function(department) {
  return this.find({
    isActive: true,
    $or: [
      { affectedDepartments: { $in: [department] } },
      { affectedDepartments: { $size: 0 } },
      { affectedDepartments: { $exists: false } }
    ],
    excludedDepartments: { $ne: department }
  }).sort({ startDate: 1 });
};

// Static method to find holidays affecting user
holidaySchema.statics.findByUser = function(user) {
  return this.find({ isActive: true }).then(holidays => {
    return holidays.filter(holiday => holiday.affectsUser(user));
  });
};

// Static method to check if date is a holiday
holidaySchema.statics.isHoliday = function(date, user = null) {
  const checkDate = moment(date);
  
  return this.find({
    isActive: true,
    startDate: { $lte: checkDate.toDate() },
    endDate: { $gte: checkDate.toDate() }
  }).then(holidays => {
    if (!user) {
      return holidays.filter(holiday => holiday.isPublic);
    }
    return holidays.filter(holiday => holiday.affectsUser(user));
  });
};

// Static method to get holiday statistics
holidaySchema.statics.getStatistics = function(year = null) {
  const matchStage = { isActive: true };
  if (year) {
    matchStage.$or = [
      { year: year },
      { isRecurring: true }
    ];
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalDays: { $sum: { $add: [{ $subtract: ['$endDate', '$startDate'] }, 1] } },
        recurringCount: { $sum: { $cond: ['$isRecurring', 1, 0] } },
        paidCount: { $sum: { $cond: ['$isPaid', 1, 0] } },
        mandatoryCount: { $sum: { $cond: ['$isMandatory', 1, 0] } }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

// Static method to get upcoming holidays for dashboard
holidaySchema.statics.getUpcomingForDashboard = function(limit = 5) {
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  return this.find({
    isActive: true,
    startDate: { $gte: now, $lte: thirtyDaysFromNow }
  })
    .sort({ startDate: 1 })
    .limit(limit)
    .select('name nameAr startDate endDate color category');
};

// Static method to search holidays
holidaySchema.statics.search = function(query, filters = {}) {
  const searchQuery = {
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { nameAr: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } }
    ],
    ...filters
  };

  return this.find(searchQuery).sort({ startDate: 1 });
};

// Static method to get holidays for calendar
holidaySchema.statics.getForCalendar = function(startDate, endDate, user = null) {
  return this.find({
    isActive: true,
    startDate: { $lte: endDate },
    endDate: { $gte: startDate }
  }).then(holidays => {
    if (!user) {
      return holidays.filter(holiday => holiday.isPublic);
    }
    return holidays.filter(holiday => holiday.affectsUser(user));
  });
};

module.exports = mongoose.model('Holiday', holidaySchema);
