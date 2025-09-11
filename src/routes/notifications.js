const express = require('express');
const { protect } = require('../middleware/auth');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// GET /api/v1/notifications/{userId}
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user is requesting their own data or has manager/admin role
    if (req.user._id.toString() !== userId && 
        !['Manager', 'Head of Department', 'Super Admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Not authorized to view this user\'s notifications'
        }
      });
    }

    const notifications = await Notification.find({ 
      userId, 
      isRead: false 
    })
      .populate('userId', 'fullName username')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        notifications
      }
    });

  } catch (error) {
    logger.error('Get user notifications error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_NOTIFICATIONS_ERROR',
        message: 'Error fetching user notifications'
      }
    });
  }
});

module.exports = router;
