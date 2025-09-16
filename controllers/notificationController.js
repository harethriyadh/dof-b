const Notification = require('../models/Notification');

// Get all notifications for a user
const getAllNotifications = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { is_read } = req.query;
    
    let filter = { user_id };
    if (is_read !== undefined) {
      filter.is_read = is_read === 'true';
    }
    
    const notifications = await Notification.find(filter).sort({ timestamp: -1 });
    
    res.status(200).json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: notifications,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve notifications',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Get notification by ID
const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOne({ notification_id: id });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Notification retrieved successfully',
      data: notification,
    });
  } catch (error) {
    console.error('Get notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve notification',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Create new notification
const createNotification = async (req, res) => {
  try {
    const { user_id, message, timestamp } = req.body;
    
    const notification = new Notification({
      user_id,
      message,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    });
    
    await notification.save();
    
    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: notification,
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Mark notification as read
const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { notification_id: id },
      { is_read: true },
      { new: true, runValidators: true }
    );
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Notification marked as read successfully',
      data: notification,
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Mark all notifications as read for a user
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const { user_id } = req.params;
    
    const result = await Notification.updateMany(
      { user_id, is_read: false },
      { is_read: true }
    );
    
    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read successfully`,
      data: { modifiedCount: result.modifiedCount },
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Update notification
const updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Convert timestamp string to Date object if provided
    if (updateData.timestamp) {
      updateData.timestamp = new Date(updateData.timestamp);
    }
    
    const notification = await Notification.findOneAndUpdate(
      { notification_id: id },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Notification updated successfully',
      data: notification,
    });
  } catch (error) {
    console.error('Update notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndDelete({ notification_id: id });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

module.exports = {
  getAllNotifications,
  getNotificationById,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  updateNotification,
  deleteNotification,
};
