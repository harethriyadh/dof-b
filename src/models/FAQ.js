const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true, trim: true },
  questionAr: { type: String, required: true, trim: true },
  answer: { type: String, required: true, trim: true },
  answerAr: { type: String, required: true, trim: true },
  category: { type: String, enum: ['general', 'leave_requests', 'authentication', 'profile', 'reports', 'technical'], default: 'general' },
  priority: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  tags: [{ type: String, trim: true }],
  viewCount: { type: Number, default: 0 },
  helpfulCount: { type: Number, default: 0 },
  notHelpfulCount: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Indexes
faqSchema.index({ category: 1, priority: -1, isActive: 1 });
faqSchema.index({ tags: 1 });
faqSchema.index({ question: 'text', answer: 'text' });

// Virtuals
faqSchema.virtual('helpfulRatio').get(function() {
  const total = this.helpfulCount + this.notHelpfulCount;
  return total > 0 ? (this.helpfulCount / total) * 100 : 0;
});

faqSchema.virtual('totalVotes').get(function() {
  return this.helpfulCount + this.notHelpfulCount;
});

// Instance methods
faqSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

faqSchema.methods.markHelpful = function() {
  this.helpfulCount += 1;
  return this.save();
};

faqSchema.methods.markNotHelpful = function() {
  this.notHelpfulCount += 1;
  return this.save();
};

faqSchema.methods.updateLastUpdatedBy = function(userId) {
  this.lastUpdatedBy = userId;
  return this.save();
};

// Static methods
faqSchema.statics.findByCategory = function(category, limit = 10) {
  return this.find({ category, isActive: true })
    .sort({ priority: -1, createdAt: -1 })
    .limit(limit);
};

faqSchema.statics.findByTags = function(tags, limit = 10) {
  return this.find({ tags: { $in: tags }, isActive: true })
    .sort({ priority: -1, viewCount: -1 })
    .limit(limit);
};

faqSchema.statics.search = function(query, limit = 10) {
  return this.find(
    { 
      $text: { $search: query },
      isActive: true 
    },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' }, priority: -1 })
    .limit(limit);
};

faqSchema.statics.findMostViewed = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ viewCount: -1 })
    .limit(limit);
};

faqSchema.statics.findMostHelpful = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ helpfulCount: -1 })
    .limit(limit);
};

faqSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        totalFAQs: { $sum: 1 },
        totalViews: { $sum: '$viewCount' },
        totalHelpfulVotes: { $sum: '$helpfulCount' },
        totalNotHelpfulVotes: { $sum: '$notHelpfulCount' },
        avgViews: { $avg: '$viewCount' },
        avgHelpfulRatio: {
          $avg: {
            $cond: [
              { $gt: [{ $add: ['$helpfulCount', '$notHelpfulCount'] }, 0] },
              { $divide: ['$helpfulCount', { $add: ['$helpfulCount', '$notHelpfulCount'] }] },
              0
            ]
          }
        }
      }
    }
  ]);

  const categoryStats = await this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalViews: { $sum: '$viewCount' }
      }
    },
    { $sort: { count: -1 } }
  ]);

  return {
    overall: stats[0] || {
      totalFAQs: 0,
      totalViews: 0,
      totalHelpfulVotes: 0,
      totalNotHelpfulVotes: 0,
      avgViews: 0,
      avgHelpfulRatio: 0
    },
    byCategory: categoryStats
  };
};

module.exports = mongoose.model('FAQ', faqSchema);
