const express = require('express');
const { protect } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// @desc    Get FAQ
// @route   GET /api/help/faq
// @access  Private
router.get('/faq', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        message: 'Help functionality will be implemented here'
      }
    });
  } catch (error) {
    logger.error('Get FAQ error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_FAQ_ERROR',
        message: 'Error fetching FAQ'
      }
    });
  }
});

module.exports = router;
