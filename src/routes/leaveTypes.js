const express = require('express');
const { protect } = require('../middleware/auth');
const LeaveType = require('../models/LeaveType');
const logger = require('../utils/logger');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// GET /api/v1/leaves/types
router.get('/types', async (req, res) => {
  try {
    const leaveTypes = await LeaveType.find().sort({ id: 1 });

    res.json({
      success: true,
      data: {
        leaveTypes
      }
    });

  } catch (error) {
    logger.error('Get leave types error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_LEAVE_TYPES_ERROR',
        message: 'Error fetching leave types'
      }
    });
  }
});

module.exports = router;
