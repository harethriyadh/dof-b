const express = require('express');
const { protect } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// @desc    Get dashboard overview
// @route   GET /api/dashboard/overview
// @access  Private
router.get('/overview', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        message: 'Dashboard functionality will be implemented here'
      }
    });
  } catch (error) {
    logger.error('Get dashboard overview error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_DASHBOARD_OVERVIEW_ERROR',
        message: 'Error fetching dashboard overview'
      }
    });
  }
});

module.exports = router;
