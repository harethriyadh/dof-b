const express = require('express');
const { protect } = require('../middleware/auth');
const UserLeaveBalance = require('../models/UserLeaveBalance');
const logger = require('../utils/logger');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// GET /api/v1/balances/{userId}
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
          message: 'Not authorized to view this user\'s balances'
        }
      });
    }

    const balances = await UserLeaveBalance.find({ userId })
      .populate('userId', 'fullName username')
      .sort({ leaveTypeId: 1 });

    res.json({
      success: true,
      data: {
        balances
      }
    });

  } catch (error) {
    logger.error('Get user balances error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_BALANCES_ERROR',
        message: 'Error fetching user balances'
      }
    });
  }
});

module.exports = router;
