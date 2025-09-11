const mongoose = require('mongoose');

const supportRequestSchema = new mongoose.Schema({
  ticketNumber: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  category: { type: String, enum: ['technical', 'account', 'leave_request', 'report', 'general', 'bug', 'feature_request'], default: 'general' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  status: { type: String, enum: ['open', 'in_progress', 'waiting_for_user', 'resolved', 'closed'], default: 'open' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedAt: { type: Date },
  resolvedAt: { type: Date },
  closedAt: { type: Date },
  resolution: { type: String, trim: true },
  attachments: [{ 
    filename: String, 
    originalName: String, 
    path: String, 
    size: Number, 
    mimeType: String 
  }],
  tags: [{ type: String, trim: true }],
  isUrgent: { type: Boolean, default: false },
  estimatedResolutionTime: { type: Date },
  actualResolutionTime: { type: Date },
  userSatisfaction: { type: Number, min: 1, max: 5 },
  userFeedback: { type: String, trim: true },
  internalNotes: { type: String, trim: true },
  source: { type: String, enum: ['web', 'mobile', 'email', 'phone'], default: 'web' },
  browserInfo: { type: String },
  deviceInfo: { type: String },
  ipAddress: { type: String },
  department: { type: String, trim: true },
  relatedLeaveRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveRequest' },
  relatedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Indexes
supportRequestSchema.index({ ticketNumber: 1 });
supportRequestSchema.index({ userId: 1, status: 1 });
supportRequestSchema.index({ assignedTo: 1, status: 1 });
supportRequestSchema.index({ category: 1, priority: 1, status: 1 });
supportRequestSchema.index({ createdAt: -1 });
supportRequestSchema.index({ subject: 'text', description: 'text' });

// Virtuals
supportRequestSchema.virtual('isOverdue').get(function() {
  if (this.status === 'resolved' || this.status === 'closed') return false;
  if (!this.estimatedResolutionTime) return false;
  return new Date() > this.estimatedResolutionTime;
});

supportRequestSchema.virtual('resolutionTime').get(function() {
  if (!this.resolvedAt || !this.createdAt) return null;
  return this.resolvedAt - this.createdAt;
});

supportRequestSchema.virtual('assignmentTime').get(function() {
  if (!this.assignedAt || !this.createdAt) return null;
  return this.assignedAt - this.createdAt;
});

supportRequestSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt;
});

supportRequestSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware
supportRequestSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Generate ticket number
    const count = await this.constructor.countDocuments();
    const year = new Date().getFullYear();
    this.ticketNumber = `SR-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  
  // Update timestamps based on status changes
  if (this.isModified('status')) {
    if (this.status === 'resolved' && !this.resolvedAt) {
      this.resolvedAt = new Date();
    } else if (this.status === 'closed' && !this.closedAt) {
      this.closedAt = new Date();
    }
  }
  
  if (this.isModified('assignedTo') && this.assignedTo && !this.assignedAt) {
    this.assignedAt = new Date();
  }
  
  next();
});

// Instance methods
supportRequestSchema.methods.assignTo = function(userId) {
  this.assignedTo = userId;
  this.assignedAt = new Date();
  return this.save();
};

supportRequestSchema.methods.updateStatus = function(status, notes = '') {
  this.status = status;
  if (notes) {
    this.internalNotes = this.internalNotes ? `${this.internalNotes}\n${notes}` : notes;
  }
  return this.save();
};

supportRequestSchema.methods.resolve = function(resolution, userId) {
  this.status = 'resolved';
  this.resolution = resolution;
  this.resolvedAt = new Date();
  if (userId) {
    this.assignedTo = userId;
  }
  return this.save();
};

supportRequestSchema.methods.close = function(userId) {
  this.status = 'closed';
  this.closedAt = new Date();
  if (userId) {
    this.assignedTo = userId;
  }
  return this.save();
};

supportRequestSchema.methods.addAttachment = function(file) {
  this.attachments.push({
    filename: file.filename,
    originalName: file.originalname,
    path: file.path,
    size: file.size,
    mimeType: file.mimetype
  });
  return this.save();
};

supportRequestSchema.methods.setUserSatisfaction = function(rating, feedback = '') {
  this.userSatisfaction = rating;
  this.userFeedback = feedback;
  return this.save();
};

// Static methods
supportRequestSchema.statics.findByUser = function(userId, filters = {}) {
  const query = { userId, ...filters };
  return this.find(query).sort({ createdAt: -1 });
};

supportRequestSchema.statics.findByAssignee = function(assigneeId, filters = {}) {
  const query = { assignedTo: assigneeId, ...filters };
  return this.find(query).sort({ priority: -1, createdAt: -1 });
};

supportRequestSchema.statics.findOpen = function(filters = {}) {
  const query = { status: { $in: ['open', 'in_progress', 'waiting_for_user'] }, ...filters };
  return this.find(query).sort({ priority: -1, createdAt: -1 });
};

supportRequestSchema.statics.findOverdue = function() {
  return this.find({
    status: { $in: ['open', 'in_progress', 'waiting_for_user'] },
    estimatedResolutionTime: { $lt: new Date() }
  }).sort({ estimatedResolutionTime: 1 });
};

supportRequestSchema.statics.findByCategory = function(category, filters = {}) {
  const query = { category, ...filters };
  return this.find(query).sort({ createdAt: -1 });
};

supportRequestSchema.statics.findByPriority = function(priority, filters = {}) {
  const query = { priority, ...filters };
  return this.find(query).sort({ createdAt: -1 });
};

supportRequestSchema.statics.search = function(query, filters = {}) {
  return this.find(
    { 
      $text: { $search: query },
      ...filters 
    },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' }, createdAt: -1 });
};

supportRequestSchema.statics.getStatistics = async function(filters = {}) {
  const stats = await this.aggregate([
    { $match: filters },
    {
      $group: {
        _id: null,
        totalRequests: { $sum: 1 },
        openRequests: {
          $sum: {
            $cond: [
              { $in: ['$status', ['open', 'in_progress', 'waiting_for_user']] },
              1,
              0
            ]
          }
        },
        resolvedRequests: {
          $sum: {
            $cond: [
              { $eq: ['$status', 'resolved'] },
              1,
              0
            ]
          }
        },
        closedRequests: {
          $sum: {
            $cond: [
              { $eq: ['$status', 'closed'] },
              1,
              0
            ]
          }
        },
        avgResolutionTime: {
          $avg: {
            $cond: [
              { $and: [{ $ne: ['$resolvedAt', null] }, { $ne: ['$createdAt', null] }] },
              { $subtract: ['$resolvedAt', '$createdAt'] },
              null
            ]
          }
        },
        avgSatisfaction: { $avg: '$userSatisfaction' }
      }
    }
  ]);

  const statusStats = await this.aggregate([
    { $match: filters },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const categoryStats = await this.aggregate([
    { $match: filters },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        avgResolutionTime: {
          $avg: {
            $cond: [
              { $and: [{ $ne: ['$resolvedAt', null] }, { $ne: ['$createdAt', null] }] },
              { $subtract: ['$resolvedAt', '$createdAt'] },
              null
            ]
          }
        }
      }
    }
  ]);

  const priorityStats = await this.aggregate([
    { $match: filters },
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 }
      }
    }
  ]);

  return {
    overall: stats[0] || {
      totalRequests: 0,
      openRequests: 0,
      resolvedRequests: 0,
      closedRequests: 0,
      avgResolutionTime: 0,
      avgSatisfaction: 0
    },
    byStatus: statusStats,
    byCategory: categoryStats,
    byPriority: priorityStats
  };
};

supportRequestSchema.statics.getPerformanceMetrics = async function(timeRange = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeRange);

  const metrics = await this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        requestsCreated: { $sum: 1 },
        requestsResolved: {
          $sum: {
            $cond: [
              { $eq: ['$status', 'resolved'] },
              1,
              0
            ]
          }
        },
        avgResolutionTime: {
          $avg: {
            $cond: [
              { $and: [{ $ne: ['$resolvedAt', null] }, { $ne: ['$createdAt', null] }] },
              { $subtract: ['$resolvedAt', '$createdAt'] },
              null
            ]
          }
        }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return metrics;
};

module.exports = mongoose.model('SupportRequest', supportRequestSchema);
