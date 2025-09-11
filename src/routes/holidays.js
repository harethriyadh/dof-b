const express = require('express');

const { protect, authorize } = require('../middleware/auth');
const { validate, holidaySchemas } = require('../middleware/validate');
const Holiday = require('../models/Holiday');
const logger = require('../utils/logger');

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// @desc    Get all holidays
// @route   GET /api/holidays
// @access  Private
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { isActive: true };
    if (req.query.year) filter.year = parseInt(req.query.year);
    if (req.query.month) {
      const startOfMonth = new Date(req.query.year || new Date().getFullYear(), req.query.month - 1, 1);
      const endOfMonth = new Date(req.query.year || new Date().getFullYear(), req.query.month, 0);
      filter.startDate = { $lte: endOfMonth };
      filter.endDate = { $gte: startOfMonth };
    }
    if (req.query.isRecurring !== undefined) filter.isRecurring = req.query.isRecurring === 'true';

    // Execute query
    const holidays = await Holiday.find(filter)
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Holiday.countDocuments(filter);

    res.json({
      success: true,
      data: {
        holidays,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    logger.error('Get holidays error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_HOLIDAYS_ERROR',
        message: 'Error fetching holidays'
      }
    });
  }
});

// @desc    Get holiday by ID
// @route   GET /api/holidays/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const holiday = await Holiday.findById(req.params.id);

    if (!holiday) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'HOLIDAY_NOT_FOUND',
          message: 'Holiday not found'
        }
      });
    }

    res.json({
      success: true,
      data: {
        holiday
      }
    });
  } catch (error) {
    logger.error('Get holiday error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_HOLIDAY_ERROR',
        message: 'Error fetching holiday'
      }
    });
  }
});

// @desc    Create holiday (Admin/SuperAdmin only)
// @route   POST /api/holidays
// @access  Private (Admin/SuperAdmin)
router.post('/', authorize('admin', 'superadmin'), validate(holidaySchemas.createHoliday), async (req, res) => {
  try {
    const holiday = new Holiday(req.body);
    await holiday.save();

    logger.info(`Holiday ${holiday.name} created by ${req.user.username}`);

    res.status(201).json({
      success: true,
      data: {
        holiday
      },
      message: 'Holiday created successfully'
    });
  } catch (error) {
    logger.error('Create holiday error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_HOLIDAY_ERROR',
        message: 'Error creating holiday'
      }
    });
  }
});

// @desc    Update holiday (Admin/SuperAdmin only)
// @route   PUT /api/holidays/:id
// @access  Private (Admin/SuperAdmin)
router.put('/:id', authorize('admin', 'superadmin'), validate(holidaySchemas.updateHoliday), async (req, res) => {
  try {
    const holiday = await Holiday.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!holiday) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'HOLIDAY_NOT_FOUND',
          message: 'Holiday not found'
        }
      });
    }

    logger.info(`Holiday ${holiday.name} updated by ${req.user.username}`);

    res.json({
      success: true,
      data: {
        holiday
      },
      message: 'Holiday updated successfully'
    });
  } catch (error) {
    logger.error('Update holiday error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_HOLIDAY_ERROR',
        message: 'Error updating holiday'
      }
    });
  }
});

// @desc    Delete holiday (Admin/SuperAdmin only)
// @route   DELETE /api/holidays/:id
// @access  Private (Admin/SuperAdmin)
router.delete('/:id', authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const holiday = await Holiday.findByIdAndDelete(req.params.id);

    if (!holiday) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'HOLIDAY_NOT_FOUND',
          message: 'Holiday not found'
        }
      });
    }

    logger.info(`Holiday ${holiday.name} deleted by ${req.user.username}`);

    res.json({
      success: true,
      message: 'Holiday deleted successfully'
    });
  } catch (error) {
    logger.error('Delete holiday error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_HOLIDAY_ERROR',
        message: 'Error deleting holiday'
      }
    });
  }
});

// @desc    Get current month holidays
// @route   GET /api/holidays/current-month
// @access  Private
router.get('/current-month', async (req, res) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const holidays = await Holiday.findByMonth(year, month);

    res.json({
      success: true,
      data: {
        holidays
      }
    });
  } catch (error) {
    logger.error('Get current month holidays error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_CURRENT_MONTH_HOLIDAYS_ERROR',
        message: 'Error fetching current month holidays'
      }
    });
  }
});

// @desc    Get upcoming holidays
// @route   GET /api/holidays/upcoming
// @access  Private
router.get('/upcoming', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const holidays = await Holiday.findUpcoming(limit);

    res.json({
      success: true,
      data: {
        holidays
      }
    });
  } catch (error) {
    logger.error('Get upcoming holidays error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_UPCOMING_HOLIDAYS_ERROR',
        message: 'Error fetching upcoming holidays'
      }
    });
  }
});

module.exports = router;
