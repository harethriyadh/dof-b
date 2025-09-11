const mongoose = require('mongoose');

const dashboardStatsSchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true },
  type: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'], required: true },
  
  // User Statistics
  totalUsers: { type: Number, default: 0 },
  activeUsers: { type: Number, default: 0 },
  newUsers: { type: Number, default: 0 },
  usersByRole: {
    employee: { type: Number, default: 0 },
    head_of_department: { type: Number, default: 0 },
    manager: { type: Number, default: 0 },
    admin: { type: Number, default: 0 },
    superadmin: { type: Number, default: 0 }
  },
  usersByDepartment: { type: Map, of: Number, default: new Map() },
  
  // Leave Request Statistics
  totalLeaveRequests: { type: Number, default: 0 },
  pendingRequests: { type: Number, default: 0 },
  approvedRequests: { type: Number, default: 0 },
  rejectedRequests: { type: Number, default: 0 },
  cancelledRequests: { type: Number, default: 0 },
  newRequests: { type: Number, default: 0 },
  processedRequests: { type: Number, default: 0 },
  avgProcessingTime: { type: Number, default: 0 }, // in hours
  
  // Leave Type Statistics
  requestsByLeaveType: { type: Map, of: Number, default: new Map() },
  leaveTypeUtilization: { type: Map, of: Number, default: new Map() },
  
  // Department Statistics
  requestsByDepartment: { type: Map, of: Number, default: new Map() },
  departmentUtilization: { type: Map, of: Number, default: new Map() },
  
  // Time-based Statistics
  requestsByMonth: { type: Map, of: Number, default: new Map() },
  requestsByWeek: { type: Map, of: Number, default: new Map() },
  requestsByDay: { type: Map, of: Number, default: new Map() },
  
  // Performance Metrics
  avgResponseTime: { type: Number, default: 0 }, // API response time in ms
  systemUptime: { type: Number, default: 100 }, // percentage
  errorRate: { type: Number, default: 0 }, // percentage
  
  // Holiday Statistics
  totalHolidays: { type: Number, default: 0 },
  upcomingHolidays: { type: Number, default: 0 },
  holidaysThisMonth: { type: Number, default: 0 },
  
  // Notification Statistics
  totalNotifications: { type: Number, default: 0 },
  unreadNotifications: { type: Number, default: 0 },
  notificationsByType: { type: Map, of: Number, default: new Map() },
  
  // Support Statistics
  totalSupportRequests: { type: Number, default: 0 },
  openSupportRequests: { type: Number, default: 0 },
  resolvedSupportRequests: { type: Number, default: 0 },
  avgSupportResolutionTime: { type: Number, default: 0 },
  supportRequestsByCategory: { type: Map, of: Number, default: new Map() },
  
  // System Health
  databaseConnections: { type: Number, default: 0 },
  memoryUsage: { type: Number, default: 0 },
  cpuUsage: { type: Number, default: 0 },
  diskUsage: { type: Number, default: 0 },
  
  // Custom Metrics
  customMetrics: { type: Map, of: mongoose.Schema.Types.Mixed, default: new Map() },
  
  // Metadata
  lastUpdated: { type: Date, default: Date.now },
  generatedBy: { type: String, default: 'system' },
  version: { type: String, default: '1.0' }
}, { timestamps: true });

// Indexes
dashboardStatsSchema.index({ date: 1, type: 1 }, { unique: true });
dashboardStatsSchema.index({ type: 1, date: -1 });

// Static methods
dashboardStatsSchema.statics.getLatestStats = function(type = 'daily') {
  return this.findOne({ type }).sort({ date: -1 });
};

dashboardStatsSchema.statics.getStatsByDateRange = function(startDate, endDate, type = 'daily') {
  return this.find({
    date: { $gte: startDate, $lte: endDate },
    type
  }).sort({ date: 1 });
};

dashboardStatsSchema.statics.getStatsByType = function(type, limit = 30) {
  return this.find({ type }).sort({ date: -1 }).limit(limit);
};

dashboardStatsSchema.statics.updateOrCreateStats = async function(date, type, statsData) {
  const filter = { date, type };
  const update = { 
    ...statsData, 
    lastUpdated: new Date() 
  };
  
  return this.findOneAndUpdate(filter, update, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true
  });
};

dashboardStatsSchema.statics.generateDailyStats = async function(date = new Date()) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  // Import models
  const User = require('./User');
  const LeaveRequest = require('./LeaveRequest');
  const Department = require('./Department');
  const Holiday = require('./Holiday');
  const Notification = require('./Notification');
  const SupportRequest = require('./SupportRequest');
  
  // Calculate statistics
  const [
    totalUsers,
    activeUsers,
    newUsers,
    totalLeaveRequests,
    pendingRequests,
    approvedRequests,
    rejectedRequests,
    newRequests,
    totalHolidays,
    upcomingHolidays,
    totalNotifications,
    unreadNotifications,
    totalSupportRequests,
    openSupportRequests
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } }),
    LeaveRequest.countDocuments(),
    LeaveRequest.countDocuments({ status: 'pending' }),
    LeaveRequest.countDocuments({ status: 'approved' }),
    LeaveRequest.countDocuments({ status: 'rejected' }),
    LeaveRequest.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } }),
    Holiday.countDocuments(),
    Holiday.countDocuments({ startDate: { $gte: new Date() } }),
    Notification.countDocuments(),
    Notification.countDocuments({ isRead: false }),
    SupportRequest.countDocuments(),
    SupportRequest.countDocuments({ status: { $in: ['open', 'in_progress', 'waiting_for_user'] } })
  ]);
  
  // Calculate users by role
  const usersByRole = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } }
  ]);
  
  const roleStats = {
    employee: 0,
    head_of_department: 0,
    manager: 0,
    admin: 0,
    superadmin: 0
  };
  
  usersByRole.forEach(role => {
    roleStats[role._id] = role.count;
  });
  
  // Calculate users by department
  const usersByDepartment = await User.aggregate([
    { $group: { _id: '$department', count: { $sum: 1 } } }
  ]);
  
  const departmentStats = new Map();
  usersByDepartment.forEach(dept => {
    departmentStats.set(dept._id, dept.count);
  });
  
  // Calculate requests by leave type
  const requestsByLeaveType = await LeaveRequest.aggregate([
    { $lookup: { from: 'leavetypes', localField: 'leaveTypeId', foreignField: '_id', as: 'leaveType' } },
    { $unwind: '$leaveType' },
    { $group: { _id: '$leaveType.name', count: { $sum: 1 } } }
  ]);
  
  const leaveTypeStats = new Map();
  requestsByLeaveType.forEach(type => {
    leaveTypeStats.set(type._id, type.count);
  });
  
  // Calculate requests by department
  const requestsByDepartment = await LeaveRequest.aggregate([
    { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
    { $group: { _id: '$user.department', count: { $sum: 1 } } }
  ]);
  
  const requestDeptStats = new Map();
  requestsByDepartment.forEach(dept => {
    requestDeptStats.set(dept._id, dept.count);
  });
  
  // Calculate average processing time
  const avgProcessingTime = await LeaveRequest.aggregate([
    { $match: { processedAt: { $exists: true } } },
    {
      $group: {
        _id: null,
        avgTime: {
          $avg: {
            $divide: [
              { $subtract: ['$processedAt', '$createdAt'] },
              1000 * 60 * 60 // Convert to hours
            ]
          }
        }
      }
    }
  ]);
  
  const statsData = {
    totalUsers,
    activeUsers,
    newUsers,
    usersByRole: roleStats,
    usersByDepartment: departmentStats,
    totalLeaveRequests,
    pendingRequests,
    approvedRequests,
    rejectedRequests,
    newRequests,
    requestsByLeaveType: leaveTypeStats,
    requestsByDepartment: requestDeptStats,
    avgProcessingTime: avgProcessingTime[0]?.avgTime || 0,
    totalHolidays,
    upcomingHolidays,
    totalNotifications,
    unreadNotifications,
    totalSupportRequests,
    openSupportRequests,
    systemUptime: 100, // This would be calculated from system monitoring
    errorRate: 0, // This would be calculated from error logs
    generatedBy: 'system'
  };
  
  return this.updateOrCreateStats(startOfDay, 'daily', statsData);
};

dashboardStatsSchema.statics.generateWeeklyStats = async function(date = new Date()) {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  // Get daily stats for the week
  const dailyStats = await this.getStatsByDateRange(startOfWeek, endOfWeek, 'daily');
  
  // Aggregate weekly statistics
  const weeklyStats = {
    totalUsers: Math.max(...dailyStats.map(stat => stat.totalUsers)),
    activeUsers: Math.max(...dailyStats.map(stat => stat.activeUsers)),
    newUsers: dailyStats.reduce((sum, stat) => sum + stat.newUsers, 0),
    totalLeaveRequests: Math.max(...dailyStats.map(stat => stat.totalLeaveRequests)),
    newRequests: dailyStats.reduce((sum, stat) => sum + stat.newRequests, 0),
    processedRequests: dailyStats.reduce((sum, stat) => sum + stat.processedRequests, 0),
    avgProcessingTime: dailyStats.reduce((sum, stat) => sum + stat.avgProcessingTime, 0) / dailyStats.length,
    totalHolidays: Math.max(...dailyStats.map(stat => stat.totalHolidays)),
    totalNotifications: dailyStats.reduce((sum, stat) => sum + stat.totalNotifications, 0),
    totalSupportRequests: Math.max(...dailyStats.map(stat => stat.totalSupportRequests)),
    openSupportRequests: Math.max(...dailyStats.map(stat => stat.openSupportRequests)),
    generatedBy: 'system'
  };
  
  return this.updateOrCreateStats(startOfWeek, 'weekly', weeklyStats);
};

dashboardStatsSchema.statics.generateMonthlyStats = async function(date = new Date()) {
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  
  // Get daily stats for the month
  const dailyStats = await this.getStatsByDateRange(startOfMonth, endOfMonth, 'daily');
  
  // Aggregate monthly statistics
  const monthlyStats = {
    totalUsers: Math.max(...dailyStats.map(stat => stat.totalUsers)),
    activeUsers: Math.max(...dailyStats.map(stat => stat.activeUsers)),
    newUsers: dailyStats.reduce((sum, stat) => sum + stat.newUsers, 0),
    totalLeaveRequests: Math.max(...dailyStats.map(stat => stat.totalLeaveRequests)),
    newRequests: dailyStats.reduce((sum, stat) => sum + stat.newRequests, 0),
    processedRequests: dailyStats.reduce((sum, stat) => sum + stat.processedRequests, 0),
    avgProcessingTime: dailyStats.reduce((sum, stat) => sum + stat.avgProcessingTime, 0) / dailyStats.length,
    totalHolidays: Math.max(...dailyStats.map(stat => stat.totalHolidays)),
    holidaysThisMonth: dailyStats[0]?.holidaysThisMonth || 0,
    totalNotifications: dailyStats.reduce((sum, stat) => sum + stat.totalNotifications, 0),
    totalSupportRequests: Math.max(...dailyStats.map(stat => stat.totalSupportRequests)),
    openSupportRequests: Math.max(...dailyStats.map(stat => stat.openSupportRequests)),
    generatedBy: 'system'
  };
  
  return this.updateOrCreateStats(startOfMonth, 'monthly', monthlyStats);
};

dashboardStatsSchema.statics.getDashboardSummary = async function() {
  const [daily, weekly, monthly] = await Promise.all([
    this.getLatestStats('daily'),
    this.getLatestStats('weekly'),
    this.getLatestStats('monthly')
  ]);
  
  return {
    daily: daily || {},
    weekly: weekly || {},
    monthly: monthly || {},
    lastUpdated: new Date()
  };
};

module.exports = mongoose.model('DashboardStats', dashboardStatsSchema);
